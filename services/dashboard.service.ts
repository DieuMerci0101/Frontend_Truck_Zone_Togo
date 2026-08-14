import api from "./api";
import type { DashboardOverview } from "@/types";

export const dashboardService = {
  /**
   * Vue d'ensemble de l'utilisateur connecté, adaptée à son rôle.
   * Un seul appel pour alimenter le tableau de bord (web + mobile).
   */
  getOverview: () =>
    api.get<DashboardOverview>("/api/dashboard/overview").then((r) => r.data),
};
