import api from "./api";
import type {
  Incident,
  IncidentCreate,
  IncidentUpdate,
  IncidentStatistiques,
  IncidentCommentaire,
  IncidentCommentaireCreate,
} from "@/types";

export interface IncidentListParams {
  skip?: number;
  limit?: number;
  statut?: string;
  type_incident?: string;
}

export const incidentService = {
  list: (params?: IncidentListParams) =>
    api.get<Incident[]>("/api/incidents/", { params }).then((r) => r.data),

  create: (data: IncidentCreate) =>
    api.post<Incident>("/api/incidents/", data).then((r) => r.data),

  getStats: () =>
    api.get<IncidentStatistiques>("/api/incidents/statistiques").then((r) => r.data),

  getProches: (lat: number, lng: number, rayonKm?: number) =>
    api.get<Incident[]>("/api/incidents/proches", {
      params: { lat, lng, rayon_km: rayonKm || 50 },
    }).then((r) => r.data),

  getById: (id: string) =>
    api.get<Incident>(`/api/incidents/${id}`).then((r) => r.data),

  update: (id: string, data: IncidentUpdate) =>
    api.put<Incident>(`/api/incidents/${id}`, data).then((r) => r.data),

  addCommentaire: (id: string, data: IncidentCommentaireCreate) =>
    api.post<IncidentCommentaire>(`/api/incidents/${id}/commentaire`, data).then((r) => r.data),

  getCommentaires: (id: string) =>
    api.get<IncidentCommentaire[]>(`/api/incidents/${id}/commentaires`).then((r) => r.data),
};
