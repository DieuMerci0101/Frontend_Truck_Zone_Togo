import api from "./api";
import type { AdminStats, User, Document, Incident, Assistance, VerificationStatusMecanicien, VerificationStatusUser } from "@/types";

export interface AdminVerificationDocument {
  id: string;
  type_document: string;
  statut: string;
  commentaire_admin: string | null;
  fichier_url: string | null;
  created_at: string | null;
}

export interface AdminVerificationItem {
  user_id: string;
  role: User["role"];
  nom_complet: string | null;
  email: string | null;
  telephone: string | null;
  photo_profil: string | null;
  verification_status: VerificationStatusUser;
  verification_reject_motif: string | null;
  required_documents: string[];
  missing_documents: string[];
  documents: AdminVerificationDocument[];
  created_at: string | null;
  soumis_le: string | null;
}

export interface AdminVerificationListParams {
  statut?: string;
  role?: string;
  skip?: number;
  limit?: number;
}

export interface AdminMechanicPending {
  id: string;
  user_id: string;
  nom_complet: string | null;
  email: string | null;
  telephone: string | null;
  specialites: string[];
  annees_experience: number;
  tarification: string;
  proof_document_url: string | null;
  verification_status: VerificationStatusMecanicien;
  created_at: string;
}

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

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string | null;
}

export interface AdminAuditParams {
  skip?: number;
  limit?: number;
  action?: string;
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

  approveDocument: (documentId: string) =>
    api.patch<{ message: string }>(`/api/admin/documents/${documentId}/approve`).then((r) => r.data),

  rejectDocument: (documentId: string, motif: string) =>
    api.patch<{ message: string }>(`/api/admin/documents/${documentId}/reject`, { motif }).then((r) => r.data),

  getIncidents: (params?: AdminIncidentListParams) =>
    api.get<Incident[]>("/api/admin/incidents", { params }).then((r) => r.data),

  updateIncidentStatut: (incidentId: string, statut: string) =>
    api.put<{ message: string; statut: string }>(`/api/incidents/${incidentId}/statut`, { statut }).then((r) => r.data),

  getAssistance: (params?: { statut?: string }) =>
    api.get<AdminAssistanceResponse>("/api/admin/assistance", { params }).then((r) => r.data),

  // ── Journal d'audit ──
  getAudit: (params?: AdminAuditParams) =>
    api.get<AuditLogEntry[]>("/api/admin/audit", { params }).then((r) => r.data),

  // ── Vérification des mécaniciens ──
  getMechanicsPending: (params?: { statut?: string; skip?: number; limit?: number }) =>
    api.get<AdminMechanicPending[]>("/api/admin/mechanics/pending", { params }).then((r) => r.data),

  verifyMechanic: (mechanicId: string, statut: "approved" | "rejected", motif?: string) =>
    api.put<{ message: string; verification_status: string }>(`/api/admin/verify-mechanic/${mechanicId}`, { statut, motif }).then((r) => r.data),

  // ── Vérification des utilisateurs (chauffeur / propriétaire / mécanicien) ──
  getVerifications: (params?: AdminVerificationListParams) =>
    api.get<AdminVerificationItem[]>("/api/admin/verifications", { params }).then((r) => r.data),

  decideVerification: (userId: string, statut: "approved" | "rejected", motif?: string) =>
    api.put<{ message: string }>(`/api/admin/verifications/${userId}`, { statut, motif }).then((r) => r.data),
};
