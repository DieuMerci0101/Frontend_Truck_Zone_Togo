"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { WS_URL } from "@/constants";

interface AssistanceEvent {
  type: string;
  demande_id: string;
  demandeur_id?: string;
  mecanicien_id?: string;
}

/**
 * Connexion WebSocket à `/ws/assistance`.
 * Côté mécanicien : rafraîchit instantanément la file d'attente quand une
 * demande apparaît ou est attribuée.
 * Côté chauffeur/propriétaire : signale les nouvelles propositions de prise en
 * charge et la sélection du mécanicien, sans attendre le polling.
 */
export function useAssistanceWebSocket(enabled = true) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["mecanicien", "demandes-disponibles"] });
    queryClient.invalidateQueries({ queryKey: ["mecanicien", "mes-demandes"] });
    queryClient.invalidateQueries({ queryKey: ["chauffeur", "mes-demandes"] });
    queryClient.invalidateQueries({ queryKey: ["proprietaire", "assistance"] });
    queryClient.invalidateQueries({ queryKey: ["propositions"] });
  }, [queryClient]);

  const connect = useCallback(() => {
    if (!enabled) return;
    if (!user?.id) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = `${WS_URL}/assistance?user_id=${user.id}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log("[AssistanceWS] Connected");
      };

      ws.onmessage = (event) => {
        try {
          const data: AssistanceEvent = JSON.parse(event.data);
          const estDemandeur = !!data.demandeur_id && data.demandeur_id === user?.id;

          if (data.type === "assistance_new") {
            toast(
              estDemandeur
                ? "Votre demande a été transmise aux mécaniciens à proximité"
                : "Nouvelle demande d'assistance disponible",
              { icon: "🛠️" }
            );
          } else if (data.type === "assistance_proposal") {
            // Un mécanicien vient de proposer son assistance pour la demande.
            toast(
              estDemandeur
                ? "🔧 Un mécanicien vient de proposer son assistance pour votre demande"
                : "Une proposition a été enregistrée",
              { icon: "🔧" }
            );
          } else if (data.type === "assistance_taken") {
            toast(
              estDemandeur
                ? "✅ Le mécanicien sélectionné a été informé de votre choix"
                : "Une demande vient d'être prise en charge",
              { icon: "🔔" }
            );
          } else if (data.type === "pong") {
            return;
          }
          refresh();
        } catch (err) {
          console.error("[AssistanceWS] Parse error:", err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log("[AssistanceWS] Disconnected, reconnecting in 5s...");
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = (error) => {
        console.error("[AssistanceWS] Error:", error);
        ws.close();
      };
    } catch (err) {
      console.error("[AssistanceWS] Connection failed:", err);
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    }
  }, [user?.id, enabled, refresh]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { isConnected };
}
