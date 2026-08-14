"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { mecanicienService } from "@/services/mecanicien.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { STATUT_ASSISTANCE, TYPE_PANNE } from "@/constants";
import { Headphones, CheckCircle, Play, MapPin, Clock, Wrench, User, Navigation, LocateFixed } from "lucide-react";
import type { StatutAssistance, Assistance } from "@/types";
import MechanicGeoWidget from "@/components/maps/mechanic-geo-widget";
import { useMechanicLocation } from "@/providers/mechanic-location-provider";

const statutBadge: Record<string, "warning" | "info" | "success" | "destructive" | "default" | "secondary"> = {
  en_attente: "warning",
  pris_en_charge: "secondary",
  assignee: "info",
  en_cours: "success",
  terminee: "default",
};

const urgenceBadge: Record<string, "destructive" | "warning" | "info" | "default"> = {
  Critique: "destructive",
  Haute: "warning",
  Moyenne: "info",
  Faible: "default",
  critique: "destructive",
  haute: "warning",
  moyenne: "info",
  faible: "default",
};

export default function MecanicienAssistancePage() {
  const queryClient = useQueryClient();
  const { position } = useMechanicLocation();

  const { data: monProfil } = useQuery({
    queryKey: ["mecanicien", "profile"],
    queryFn: () => mecanicienService.getMyProfile(),
  });

  const { data: mesDemandes, isLoading: loadingMine } = useQuery({
    queryKey: ["mecanicien", "mes-demandes"],
    queryFn: () => mecanicienService.getMyDemandes(),
  });

  const rayon = monProfil?.rayon_intervention ?? 50;
  const { data: disponibles, isLoading: loadingDispo } = useQuery({
    queryKey: [
      "mecanicien",
      "demandes-disponibles",
      position?.lat ?? null,
      position?.lng ?? null,
      rayon,
    ],
    queryFn: () =>
      mecanicienService.getAssistanceDisponibles(
        position?.lat,
        position?.lng,
        rayon
      ),
    refetchInterval: 10000,
  });

  const toutesDemandes: Assistance[] = [
    ...(mesDemandes || []),
    ...(disponibles || []).filter(
      (d) => !mesDemandes?.some((m) => m.id === d.id)
    ),
  ];

  const prendreMutation = useMutation({
    mutationFn: (id: string) => mecanicienService.prendreAssistance(id),
    onSuccess: () => {
      toast.success("Demande prise en charge");
      queryClient.invalidateQueries({ queryKey: ["mecanicien"] });
    },
    onError: (err: unknown) => {
      // Course « premier arrivé » : un autre mécanicien a déjà accepté.
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "";
      if (msg.includes("déjà prise")) {
        toast.error("Demande déjà prise par un autre mécanicien", { duration: 5000 });
        queryClient.invalidateQueries({ queryKey: ["mecanicien"] });
      } else {
        toast.error("Impossible de prendre la demande");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: StatutAssistance }) =>
      mecanicienService.updateAssistanceStatut(id, { statut }),
    onSuccess: () => {
      toast.success("Statut mis à jour");
      queryClient.invalidateQueries({ queryKey: ["mecanicien"] });
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const openMaps = (lat?: number | null, lng?: number | null) => {
    if (!lat || !lng) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  };

  const isLoading = (loadingMine || loadingDispo) && !mesDemandes && !disponibles;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 rounded-lg">
          <Headphones className="h-6 w-6 text-slate-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandes d&apos;assistance</h1>
          <p className="text-gray-500">Demandes disponibles et interventions en cours</p>
        </div>
      </div>

      <MechanicGeoWidget />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : toutesDemandes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {toutesDemandes.map((demande) => {
            const isMine = mesDemandes?.some((m) => m.id === demande.id);
            const isTerminee = demande.statut === "terminee";
            const isTaken = demande.statut !== "en_attente" && !isMine;
            return (
              <Card
                key={demande.id}
                className={`flex flex-col hover:shadow-md transition-shadow ${
                  isTerminee ? "opacity-60" : ""
                }`}
              >
                <CardContent className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {TYPE_PANNE[demande.type_panne as keyof typeof TYPE_PANNE] ||
                        demande.type_panne}
                    </h3>
                    <Badge
                      variant={statutBadge[demande.statut] || "info"}
                      className="shrink-0 text-[10px]"
                    >
                      {STATUT_ASSISTANCE[demande.statut as keyof typeof STATUT_ASSISTANCE] ||
                        demande.statut}
                    </Badge>
                  </div>

                  <Badge
                    variant={urgenceBadge[demande.urgence] || "default"}
                    className="text-[10px] w-fit mb-2"
                  >
                    {demande.urgence}
                  </Badge>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-2 flex-1">
                    {demande.description}
                  </p>

                  <div className="text-xs text-gray-500 space-y-1 mb-3">
                    <p className="flex items-center gap-1">
                      <Wrench className="h-3 w-3 shrink-0" />
                      {demande.vehicule_description}
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="h-3 w-3 shrink-0" />
                      {formatDate(demande.created_at)}
                    </p>
                    {demande.distance_km != null && (
                      <p className="flex items-center gap-1 font-medium text-blue-700">
                        <LocateFixed className="h-3 w-3 shrink-0" />
                        {demande.distance_km < 1
                          ? `${Math.round(demande.distance_km * 1000)} m`
                          : `${demande.distance_km.toLocaleString("fr-FR")} km`}{" "}
                        de votre position
                      </p>
                    )}
                  </div>

                  {demande.demandeur_info && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-3">
                      {demande.demandeur_info.photo_profil ? (
                        <img
                          src={demande.demandeur_info.photo_profil}
                          alt={demande.demandeur_info.nom_complet}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-slate-700" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {demande.demandeur_info.nom_complet}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {demande.demandeur_info.role}
                        </p>
                      </div>
                    </div>
                  )}

                  {isTaken && demande.mecanicien_info && (
                    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg mb-3">
                      {demande.mecanicien_info.photo_profil ? (
                        <img
                          src={demande.mecanicien_info.photo_profil}
                          alt={demande.mecanicien_info.nom_complet}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Wrench className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-700">
                          Pris en charge par
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {demande.mecanicien_info.nom_complet}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-auto">
                    {demande.statut === "en_attente" && (
                      <Button
                        size="sm"
                        className="flex-1 min-h-[44px]"
                        loading={prendreMutation.isPending}
                        onClick={() => prendreMutation.mutate(demande.id)}
                      >
                        <Play className="h-3.5 w-3.5 mr-1" />
                        Prendre en charge
                      </Button>
                    )}
                    {isMine && (demande.statut === "pris_en_charge" || demande.statut === "assignee") && (
                      <Button
                        size="sm"
                        className="flex-1 min-h-[44px]"
                        loading={updateMutation.isPending}
                        onClick={() =>
                          updateMutation.mutate({
                            id: demande.id,
                            statut: "en_cours" as StatutAssistance,
                          })
                        }
                      >
                        <Play className="h-3.5 w-3.5 mr-1" />
                        Commencer
                      </Button>
                    )}
                    {isMine && demande.statut === "en_cours" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 min-h-[44px]"
                        loading={updateMutation.isPending}
                        onClick={() =>
                          updateMutation.mutate({
                            id: demande.id,
                            statut: "terminee" as StatutAssistance,
                          })
                        }
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Marquer comme Réparé
                      </Button>
                    )}
                    {demande.localisation_lat && demande.localisation_lng && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={`min-h-[44px] ${isTaken ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={isTaken}
                        onClick={() => {
                          if (!isTaken) openMaps(demande.localisation_lat, demande.localisation_lng);
                        }}
                        title={isTaken ? "Géolocalisation réservée au mécanicien assigné" : "Voir sur Google Maps"}
                      >
                        <Navigation className="h-3.5 w-3.5 mr-1" />
                        {isTaken ? "Indisponible" : "Y aller"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Headphones className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune demande d&apos;assistance</p>
            <p className="text-sm text-gray-400 mt-1">
              Activez votre position pour voir les demandes autour de vous et être
              notifié en priorité
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
