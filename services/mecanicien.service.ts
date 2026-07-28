import api from "./api";
import type {
  ProfilMecanicien,
  ProfilMecanicienUpdate,
  Assistance,
  AssistanceCreate,
  AssistanceUpdateStatut,
} from "@/types";

export interface MecanicienListParams {
  skip?: number;
  limit?: number;
  specialite?: string;
  disponibilite?: string;
  tarification?: string;
}

export const mecanicienService = {
  list: (params?: MecanicienListParams) =>
    api.get<ProfilMecanicien[]>("/api/mecaniciens/", { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ProfilMecanicien>(`/api/mecaniciens/${id}`).then((r) => r.data),

  getMyProfile: () =>
    api.get<ProfilMecanicien>("/api/mecaniciens/me").then((r) => r.data),

  createProfile: (data: ProfilMecanicienUpdate) =>
    api.post<ProfilMecanicien>("/api/mecaniciens/me", data).then((r) => r.data),

  updateProfile: (data: ProfilMecanicienUpdate) =>
    api.put<ProfilMecanicien>("/api/mecaniciens/me", data).then((r) => r.data),

  getProches: (lat: number, lng: number, rayonKm?: number, specialite?: string) =>
    api.get<ProfilMecanicien[]>("/api/mecaniciens/proches", {
      params: { lat, lng, rayon_km: rayonKm || 50, specialite },
    }).then((r) => r.data),

  // ── Assistance ──
  createAssistance: (data: AssistanceCreate) =>
    api.post<Assistance>("/api/mecaniciens/assistance", data).then((r) => r.data),

  getAssistance: (id: string) =>
    api.get<Assistance>(`/api/mecaniciens/assistance/${id}`).then((r) => r.data),

  getMyDemandes: () =>
    api.get<Assistance[]>("/api/mecaniciens/assistance/mes-demandes").then((r) => r.data),

  updateAssistanceStatut: (id: string, data: AssistanceUpdateStatut) =>
    api.put<{ message: string; statut: string }>(`/api/mecaniciens/assistance/${id}/statut`, data).then((r) => r.data),
};
