"use client";

import { useAlertWebSocket } from "@/hooks/use-alert-websocket";
import { useAssistanceWebSocket } from "@/hooks/use-assistance-websocket";
import { useAuth } from "@/providers/auth-provider";

/**
 * Monte les connexions temps réel globales du dashboard :
 * - alertes / incidents / messages (« /ws/alerts/{user_id} ») pour tous les rôles ;
 * - file d'attente des demandes d'assistance (« /ws/assistance ») pour les
 *   mécaniciens uniquement (rafraîchissement « premier arrivé » sans polling).
 */
export function RealTimeNotifications() {
  useAlertWebSocket();
  const { user } = useAuth();
  const isMechanic = user?.role === "mecanicien";
  useAssistanceWebSocket(isMechanic);
  return null;
}
