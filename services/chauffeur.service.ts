import api from "./api";
import type {
  ProfilChauffeur,
  ProfilChauffeurCreate,
  ProfilChauffeurUpdate,
  DisponibiliteUpdate,
  Document,
  Assistance,
  AssistanceCreate,
  Camion,
  CamionCreate,
  CamionUpdate,
} from "@/types";

export interface ChauffeurListParams {
  skip?: number;
  limit?: number;
  disponibilite?: string;
  categorie_permis?: string;
  experience_min?: number;
}

export interface Offre {
  id: string;
  proprietaire_id: string;
  proprietaire_info?: {
    nom_complet: string;
    nom_entreprise?: string;
    photo_profil?: string | null;
    telephone: string;
  } | null;
  titre: string;
  description: string;
  type_contrat: string;
  salaire_propose: number;
  zone_travail: string;
  date_debut: string;
  camion_id: string | null;
  statut: string;
  created_at: string;
  expires_at?: string | null;
  is_expired?: boolean;
}

export interface Candidature {
  id: string;
  offre_id: string;
  chauffeur_id: string;
  message: string | null;
  statut: string;
  created_at: string;
}

export const chauffeurService = {
  list: (params?: ChauffeurListParams) =>
    api.get<ProfilChauffeur[]>("/api/chauffeurs/", { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ProfilChauffeur>(`/api/chauffeurs/${id}`).then((r) => r.data),

  getMyProfile: () =>
    api.get<ProfilChauffeur>("/api/chauffeurs/me").then((r) => r.data),

  createProfile: (data: ProfilChauffeurCreate) =>
    api.post<ProfilChauffeur>("/api/chauffeurs/me", data).then((r) => r.data),

  updateProfile: (data: ProfilChauffeurUpdate) =>
    api.put<ProfilChauffeur>("/api/chauffeurs/me", data).then((r) => r.data),

  updateStatut: (data: DisponibiliteUpdate) =>
    api.put<{ message: string; disponibilite: string }>("/api/chauffeurs/me/statut", data).then((r) => r.data),

  getDocuments: () =>
    api.get<Document[]>("/api/chauffeurs/me/documents").then((r) => r.data),

  uploadDocument: (formData: FormData) =>
    api.post<{ id: string; message: string; url: string }>("/api/chauffeurs/me/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),

  // ── Offres ──
  getOffres: (params?: { type_contrat?: string; zone?: string }) =>
    api.get<Offre[]>("/api/offres/", { params }).then((r) => r.data),

  getOffreById: (id: string) =>
    api.get<Offre>(`/api/offres/${id}`).then((r) => r.data),

  postulerOffre: (offreId: string, message?: string) =>
    api.post<{ message: string; id: string }>(`/api/offres/${offreId}/candidater`, { message }).then((r) => r.data),

  getMesCandidatures: (offreId: string) =>
    api.get<Candidature[]>(`/api/offres/${offreId}/mes-candidatures`).then((r) => r.data),

  // ── Assistance ──
  getMesDemandes: () =>
    api.get<Assistance[]>("/api/mecaniciens/assistance/mes-demandes").then((r) => r.data),

  creerDemande: (data: AssistanceCreate) =>
    api.post<Assistance>("/api/mecaniciens/assistance", data).then((r) => r.data),

  getMecaniciensProches: (lat: number, lng: number, specialite?: string) =>
    api.get<any[]>("/api/mecaniciens/proches", {
      params: { lat, lng, rayon_km: 50, specialite },
    }).then((r) => r.data),

  // ── Camions (chauffeur = propriétaire de camion) ──
  getMyCamions: () =>
    api.get<Camion[]>("/api/chauffeurs/me/camions").then((r) => r.data),

  createCamion: (data: CamionCreate) =>
    api.post<Camion>("/api/chauffeurs/me/camions", data).then((r) => r.data),

  getCamion: (camionId: string) =>
    api.get<Camion>(`/api/chauffeurs/me/camions/${camionId}`).then((r) => r.data),

  updateCamion: (camionId: string, data: CamionUpdate) =>
    api.put<Camion>(`/api/chauffeurs/me/camions/${camionId}`, data).then((r) => r.data),

  deleteCamion: (camionId: string) =>
    api.delete<{ message: string }>(`/api/chauffeurs/me/camions/${camionId}`).then((r) => r.data),

  uploadCamionPhoto: (camionId: string, formData: FormData) =>
    api.post<{ id: string; message: string; url: string }>(
      `/api/chauffeurs/me/camions/${camionId}/photos`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    ).then((r) => r.data),

  deleteCamionPhoto: (camionId: string, photoId: string) =>
    api.delete<{ message: string }>(`/api/chauffeurs/me/camions/${camionId}/photos/${photoId}`).then((r) => r.data),

  setMainPhoto: (camionId: string, photoId: string) =>
    api.post<{ message: string }>(`/api/chauffeurs/me/camions/${camionId}/photos/${photoId}/principale`).then((r) => r.data),

  togglePublish: (camionId: string, expires_at?: string) =>
    api.post<{ message: string; is_public: boolean }>(`/api/chauffeurs/me/camions/${camionId}/publish`, { expires_at }).then((r) => r.data),

  // ── Camions publics ──
  getPublicCamions: (params?: { skip?: number; limit?: number; type_camion?: string }) =>
    api.get<Camion[]>("/api/proprietaires/camions/public", { params }).then((r) => r.data),

  getPublicCamion: (camionId: string) =>
    api.get<Camion>(`/api/proprietaires/camions/public/${camionId}`).then((r) => r.data),

  // ── Assistance (proprietaire also) ──
  createAssistance: (data: AssistanceCreate) =>
    api.post<Assistance>("/api/proprietaires/me/assistance", data).then((r) => r.data),

  getMyAssistances: () =>
    api.get<Assistance[]>("/api/proprietaires/me/assistance").then((r) => r.data),
};
