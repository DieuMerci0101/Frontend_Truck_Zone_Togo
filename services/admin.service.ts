import api from "./api";
import type { AdminStats, User, Document, Incident, Assistance } from "@/types";

export interface AdminAssistanceResponse {
  total: number;
  en_attente: number;
  pris_en_charge: number;
  terminee: number;
  demandes: Assistance[];
}

export interface AdminUserListParams {
  skip?: number;
  limit?: number;
  role?: string;
}

export interface AdminDocumentListParams {
  skip?: number;
  limit?: number;
  statut?: string;
}

export interface AdminIncidentListParams {
  skip?: number;
  limit?: number;
  statut?: string;
}

export const adminService = {
  getStats: () =>
    api.get<AdminStats>("/api/admin/stats").then((r) => r.data),

  getUsers: (params?: AdminUserListParams) =>
    api.get<User[]>("/api/admin/users", { params }).then((r) => r.data),

  getUserById: (userId: string) =>
    api.get<User>(`/api/admin/users/${userId}`).then((r) => r.data),

  toggleUserStatus: (userId: string) =>
    api.put<{ message: string; is_active: boolean }>(`/api/admin/users/${userId}/status`).then((r) => r.data),

  getDocuments: (params?: AdminDocumentListParams) =>
    api.get<Document[]>("/api/admin/documents", { params }).then((r) => r.data),

  updateDocumentStatut: (documentId: string, statut: string, motif?: string) =>
    api.put<{ message: string }>(`/api/admin/documents/${documentId}/statut`, { statut, motif }).then((r) => r.data),

  getIncidents: (params?: AdminIncidentListParams) =>
    api.get<Incident[]>("/api/admin/incidents", { params }).then((r) => r.data),

  updateIncidentStatut: (incidentId: string, statut: string) =>
    api.put<{ message: string; statut: string }>(`/api/incidents/${incidentId}/statut`, { statut }).then((r) => r.data),

  getAssistance: (params?: { statut?: string }) =>
    api.get<AdminAssistanceResponse>("/api/admin/assistance", { params }).then((r) => r.data),
};
