"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { WS_URL } from "@/constants";

interface AlertMessage {
  type: string;
  title: string;
  message: string;
  alert_level: string;
  should_disconnect: boolean;
}

export function useAlertWebSocket() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (!user?.id) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = `${WS_URL}/alerts/${user.id}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log("[AlertWS] Connected");
      };

      ws.onmessage = (event) => {
        try {
          const data: AlertMessage = JSON.parse(event.data);

          if (data.type === "alert") {
            // Show toast notification based on alert level
            switch (data.alert_level) {
              case "critical":
              case "danger":
                toast.error(data.message, { duration: 6000 });
                break;
              case "warning":
                toast(data.message, { icon: "⚠️", duration: 5000 });
                break;
              case "success":
                toast.success(data.message);
                break;
              default:
                toast(data.message);
            }

            // Auto-disconnect if specified
            if (data.should_disconnect) {
              setTimeout(() => {
                toast("Déconnexion automatique...", { icon: "🔒" });
                logout();
              }, 2000);
            }
          } else if (data.type === "pong") {
            // Keep-alive response
          }
        } catch (err) {
          console.error("[AlertWS] Parse error:", err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log("[AlertWS] Disconnected, reconnecting in 5s...");
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = (error) => {
        console.error("[AlertWS] Error:", error);
        ws.close();
      };
    } catch (err) {
      console.error("[AlertWS] Connection failed:", err);
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    }
  }, [user?.id, logout]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected };
}
