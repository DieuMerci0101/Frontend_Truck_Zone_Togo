"use client";

import { useAlertWebSocket } from "@/hooks/use-alert-websocket";
import { useAssistanceWebSocket } from "@/hooks/use-assistance-websocket";
import { useAuth } from "@/providers/auth-provider";

/**
 * Monte les connexions temps réel globales du dashboard :
 * - alertes / incidents / messages (« /ws/alerts/{user_id} ») pour tous les rôles ;
 * - assistance (« /ws/assistance ») pour mécaniciens (« premier arrivé »),
 *   chauffeurs et propriétaires (nouvelles propositions + mécanicien sélectionné).
 */
export function RealTimeNotifications() {
  useAlertWebSocket();
  const { user } = useAuth();
  const assistanceEnabled =
    user?.role === "mecanicien" ||
    user?.role === "chauffeur" ||
    user?.role === "proprietaire";
  useAssistanceWebSocket(assistanceEnabled);
  return null;
}
