import api from "./api";
import type { AdminStats, User, Document, Incident } from "@/types";

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

  updateDocumentStatut: (documentId: string, statut: string) =>
    api.put<{ message: string }>(`/api/admin/documents/${documentId}/statut`, null, {
      params: { statut },
    }).then((r) => r.data),

  getIncidents: (params?: AdminIncidentListParams) =>
    api.get<Incident[]>("/api/admin/incidents", { params }).then((r) => r.data),
};
