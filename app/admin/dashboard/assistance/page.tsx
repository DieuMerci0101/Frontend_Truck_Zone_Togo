"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { STATUT_ASSISTANCE, URGENCE } from "@/constants";
import { AlertTriangle, Clock, CheckCircle, Users, MapPin } from "lucide-react";
import type { Assistance } from "@/types";

const statutBadge: Record<string, "warning" | "info" | "success" | "default"> = {
  en_attente: "warning",
  pris_en_charge: "info",
  terminee: "success",
};

const urgenceColor: Record<string, string> = {
  Faible: "text-slate-500",
  Moyenne: "text-amber-600",
  Haute: "text-red-600",
  Critique: "text-red-700",
};

export default function AdminAssistancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "assistance"],
    queryFn: () => adminService.getAssistance(),
    refetchInterval: 15000,
  });

  const demandes = data?.demandes || [];
  const total = data?.total || 0;
  const enAttente = data?.en_attente || 0;
  const terminee = data?.terminee || 0;
  const prisEnCharge = data?.pris_en_charge || 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assistance mécanique</h1>
        <p className="text-slate-500 mt-1">Supervision de toutes les demandes d&apos;assistance</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{total}</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-xl">
                <Users className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-500">En attente</p>
                <p className="text-2xl sm:text-3xl font-bold text-amber-600">{enAttente}</p>
              </div>
              <div className="p-2 bg-amber-50 rounded-xl">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-500">Pris en charge</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-700">{prisEnCharge}</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-slate-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-500">Terminées</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{terminee}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : demandes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {demandes.map((d: Assistance) => (
            <Card key={d.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge variant={statutBadge[d.statut] || "info"}>
                    {STATUT_ASSISTANCE[d.statut as keyof typeof STATUT_ASSISTANCE] || d.statut}
                  </Badge>
                  <span className={`text-xs font-medium ${urgenceColor[d.urgence] || ""}`}>
                    {d.urgence}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {d.demandeur_info?.photo_profil ? (
                    <img
                      src={d.demandeur_info.photo_profil}
                      alt={d.demandeur_info.nom_complet}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-slate-500" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {d.demandeur_info?.nom_complet || "Utilisateur"}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {d.demandeur_info?.role === "chauffeur" ? "Chauffeur" :
                       d.demandeur_info?.role === "proprietaire" ? "Propriétaire" :
                       d.demandeur_info?.role === "mecanicien" ? "Mécanicien" : d.demandeur_info?.role}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 mb-3 flex-1">
                  <p className="font-medium text-slate-900">{d.type_panne}</p>
                  <p className="line-clamp-2">{d.description}</p>
                  <p className="text-slate-400">{formatDate(d.created_at)}</p>
                  {d.vehicule_description && (
                    <p className="text-slate-500">{d.vehicule_description}</p>
                  )}
                </div>

                {d.mecanicien_info && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg mb-3">
                    {d.mecanicien_info.photo_profil ? (
                      <img
                        src={d.mecanicien_info.photo_profil}
                        alt={d.mecanicien_info.nom_complet}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
                        <Users className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                    )}
                    <p className="text-xs text-slate-700 truncate">
                      Pris en charge par <strong>{d.mecanicien_info.nom_complet}</strong>
                    </p>
                  </div>
                )}

                {(d.localisation_lat && d.localisation_lng) ? (
                  <a
                    href={`https://www.google.com/maps?q=${d.localisation_lat},${d.localisation_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-amber-800"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Voir sur la carte
                  </a>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Aucune demande d&apos;assistance</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
