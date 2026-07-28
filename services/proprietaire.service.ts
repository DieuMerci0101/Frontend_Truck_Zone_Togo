import api from "./api";
import type {
  ProfilProprietaire,
  ProfilProprietaireUpdate,
  Camion,
  CamionCreate,
  CamionUpdate,
  Offre,
  OffreCreate,
  OffreUpdate,
} from "@/types";

export const proprietaireService = {
  list: (params?: { skip?: number; limit?: number }) =>
    api.get<ProfilProprietaire[]>("/api/proprietaires/", { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ProfilProprietaire>(`/api/proprietaires/${id}`).then((r) => r.data),

  getMyProfile: () =>
    api.get<ProfilProprietaire>("/api/proprietaires/me").then((r) => r.data),

  createProfile: (data: ProfilProprietaireUpdate) =>
    api.post<ProfilProprietaire>("/api/proprietaires/me", data).then((r) => r.data),

  updateProfile: (data: ProfilProprietaireUpdate) =>
    api.put<ProfilProprietaire>("/api/proprietaires/me", data).then((r) => r.data),

  // ── Camions ──
  getMyCamions: () =>
    api.get<Camion[]>("/api/proprietaires/me/camions").then((r) => r.data),

  createCamion: (data: CamionCreate) =>
    api.post<Camion>("/api/proprietaires/me/camions", data).then((r) => r.data),

  getCamion: (camionId: string) =>
    api.get<Camion>(`/api/proprietaires/me/camions/${camionId}`).then((r) => r.data),

  updateCamion: (camionId: string, data: CamionUpdate) =>
    api.put<Camion>(`/api/proprietaires/me/camions/${camionId}`, data).then((r) => r.data),

  deleteCamion: (camionId: string) =>
    api.delete<{ message: string }>(`/api/proprietaires/me/camions/${camionId}`).then((r) => r.data),

  uploadCamionPhoto: (camionId: string, formData: FormData) =>
    api.post<{ id: string; message: string; url: string }>(
      `/api/proprietaires/me/camions/${camionId}/photos`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    ).then((r) => r.data),

  deleteCamionPhoto: (camionId: string, photoId: string) =>
    api.delete<{ message: string }>(`/api/proprietaires/me/camions/${camionId}/photos/${photoId}`).then((r) => r.data),

  setMainPhoto: (camionId: string, photoId: string) =>
    api.post<{ message: string }>(`/api/proprietaires/me/camions/${camionId}/photos/${photoId}/principale`).then((r) => r.data),

  togglePublish: (camionId: string) =>
    api.post<{ message: string; is_public: boolean }>(`/api/proprietaires/me/camions/${camionId}/publish`).then((r) => r.data),

  // ── Offres ──
  getMyOffres: () =>
    api.get<Offre[]>("/api/proprietaires/me/offres").then((r) => r.data),

  createOffre: (data: OffreCreate) =>
    api.post<Offre>("/api/proprietaires/me/offres", data).then((r) => r.data),

  getOffre: (offreId: string) =>
    api.get<Offre>(`/api/proprietaires/me/offres/${offreId}`).then((r) => r.data),

  updateOffre: (offreId: string, data: OffreUpdate) =>
    api.put<Offre>(`/api/proprietaires/me/offres/${offreId}`, data).then((r) => r.data),

  deleteOffre: (offreId: string) =>
    api.delete<{ message: string }>(`/api/proprietaires/me/offres/${offreId}`).then((r) => r.data),
};
