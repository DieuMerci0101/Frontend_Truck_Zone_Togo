import api from "./api";
import type {
  ProfilMecanicien,
  ProfilMecanicienUpdate,
  Assistance,
  AssistanceCreate,
  AssistanceUpdateStatut,
  VerificationStatusMecanicien,
  MecanicienActif,
} from "@/types";

export interface MechanicVerification {
  verification_status: VerificationStatusMecanicien;
  proof_document_url: string | null;
  is_verified: boolean;
}

export interface MecanicienListParams {
  skip?: number;
  limit?: number;
  specialite?: string;
  disponibilite?: string;
  tarification?: string;
}

export interface PositionUpdateResponse {
  message: string;
  localisation_lat: number;
  localisation_lng: number;
  position_active?: boolean;
}

export interface ActivationResponse {
  message: string;
  position_active: boolean;
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

  updatePosition: (lat: number, lng: number) =>
    api.put<PositionUpdateResponse>("/api/mecaniciens/me/position", { localisation_lat: lat, localisation_lng: lng }).then((r) => r.data),

  updateLocation: (lat: number, lng: number) =>
    api.patch<PositionUpdateResponse>("/api/mechanics/location", { localisation_lat: lat, localisation_lng: lng }).then((r) => r.data),

  activateLocation: (lat?: number, lng?: number) =>
    api.post<ActivationResponse>("/api/mechanics/location/activate", lat != null && lng != null ? { localisation_lat: lat, localisation_lng: lng } : {}).then((r) => r.data),

  deactivateLocation: () =>
    api.post<ActivationResponse>("/api/mechanics/location/deactivate").then((r) => r.data),

  getMecaniciensActifs: (lat?: number, lng?: number, rayonKm?: number) =>
    api.get<MecanicienActif[]>("/api/mecaniciens/actifs", {
      params: {
        ...(lat != null ? { lat } : {}),
        ...(lng != null ? { lng } : {}),
        ...(rayonKm ? { rayon_km: rayonKm } : {}),
      },
    }).then((r) => r.data),

  // ── Vérification du mécanicien ──
  uploadProof: (formData: FormData) =>
    api.post<{ message: string; proof_document_url: string; verification_status: VerificationStatusMecanicien }>(
      "/api/mecaniciens/upload-proof",
      formData
    ).then((r) => r.data),

  getVerification: () =>
    api.get<MechanicVerification>("/api/mecaniciens/verification").then((r) => r.data),

  // ── Assistance ──
  createAssistance: (data: AssistanceCreate) =>
    api.post<Assistance>("/api/mecaniciens/assistance", data).then((r) => r.data),

  getAssistance: (id: string) =>
    api.get<Assistance>(`/api/mecaniciens/assistance/${id}`).then((r) => r.data),

  getMyDemandes: () =>
    api.get<Assistance[]>("/api/mecaniciens/assistance/mes-demandes").then((r) => r.data),

  updateAssistanceStatut: (id: string, data: AssistanceUpdateStatut) =>
    api.put<{ message: string; statut: string }>(`/api/mecaniciens/assistance/${id}/statut`, data).then((r) => r.data),

  getAssistanceDisponibles: () =>
    api.get<Assistance[]>("/api/mecaniciens/assistance/disponibles").then((r) => r.data),

  prendreAssistance: (id: string) =>
    api.put<{ message: string; statut: string }>(`/api/mecaniciens/assistance/${id}/prendre`).then((r) => r.data),
};
