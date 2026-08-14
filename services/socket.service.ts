import { io, Socket } from "socket.io-client";
import { API_URL } from "@/constants";
import { getToken } from "@/lib/auth";

/**
 * Service Socket.io — messagerie temps réel (Module 6).
 *
 * Connexion unique (singleton) authentifiée par le JWT de l'utilisateur
 * connecté. Événements serveur écoutés :
 *   - `receive_message` : nouveau message (texte, média, audio) en temps réel
 *   - `typing`           : quelqu'un tape dans la conversation
 *   - `read_status`      : messages lus par l'autre participant
 *
 * Usage (React) :
 *   socketService.on("receive_message", handler);
 *   socketService.joinRoom(conversationId);
 */
class SocketService {
  private socket: Socket | null = null;
  private manuallyClosed = false;

  /** (Ré)ouvre la connexion si nécessaire et retourne le socket. */
  getSocket(): Socket {
    if (this.socket && this.socket.connected) return this.socket;
    if (this.socket && !this.manuallyClosed) {
      this.socket.connect();
      return this.socket;
    }

    this.manuallyClosed = false;
    this.socket = io(API_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      auth: (cb) => cb({ token: getToken() || "" }),
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      timeout: 20000,
    });
    return this.socket;
  }

  on(event: string, handler: (...args: unknown[]) => void): void {
    this.getSocket().on(event as Parameters<Socket["on"]>[0], handler);
  }

  off(event: string, handler?: (...args: unknown[]) => void): void {
    if (!this.socket) return;
    if (handler) {
      this.socket.off(event as Parameters<Socket["off"]>[0], handler);
    } else {
      this.socket.removeAllListeners(event as Parameters<Socket["removeAllListeners"]>[0]);
    }
  }

  emit(event: string, payload?: unknown): void {
    this.getSocket().emit(event, payload);
  }

  /**
   * Émission avec acquittement serveur (python-socketio renvoie la valeur de
   * retour du handler). Rejette en cas de timeout — le code appelant peut
   * alors basculer sur le REST.
   */
  emitWithAck<T = unknown>(event: string, payload?: unknown, timeoutMs = 8000): Promise<T> {
    const socket = this.getSocket();
    return new Promise((resolve, reject) => {
      socket.timeout(timeoutMs).emit(
        event,
        payload,
        (err: Error | null, response?: T) => {
          if (err) reject(err);
          else resolve(response as T);
        }
      );
    });
  }

  /** Rejoint la room de la conversation (l'accès est vérifié côté serveur). */
  joinRoom(conversationId: string): void {
    this.emit("join_room", { conversation_id: conversationId });
  }

  leaveRoom(conversationId: string): void {
    if (this.socket) this.emit("leave_room", { conversation_id: conversationId });
  }

  sendMessage(payload: {
    conversation_id: string;
    contenu: string;
    reply_to_message_id?: string | null;
  }): void {
    this.emit("send_message", payload);
  }

  sendTyping(conversationId: string, isTyping: boolean): void {
    this.emit("typing", { conversation_id: conversationId, is_typing: isTyping });
  }

  markRead(conversationId: string): void {
    this.emit("read_status", { conversation_id: conversationId });
  }

  disconnect(): void {
    this.manuallyClosed = true;
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  get isConnected(): boolean {
    return !!this.socket?.connected;
  }
}

export const socketService = new SocketService();
