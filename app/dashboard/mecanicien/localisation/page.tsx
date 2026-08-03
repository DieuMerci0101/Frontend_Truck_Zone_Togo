"use client";

import { useQuery } from "@tanstack/react-query";
import { mecanicienService } from "@/services/mecanicien.service";
import { useMechanicLocation } from "@/providers/mechanic-location-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { MapPin, Navigation, Locate, Power, Users, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const MechanicsLiveMap = dynamic(() => import("@/components/maps/mechanics-live-map"), {
  ssr: false,
});

export default function MecanicienLocalisationPage() {
  const {
    position,
    isActive,
    gpsLoading,
    lastUpdatedAt,
    activate,
    deactivate,
    updatePosition,
  } = useMechanicLocation();

  const { data: actifs, isLoading: loadingActifs } = useQuery({
    queryKey: ["mecanicien", "actifs"],
    queryFn: () => mecanicienService.getMecaniciensActifs(),
    refetchInterval: 30000,
    enabled: isActive,
  });

  const autresMecaniciens = (actifs || []).map((m) => ({
    id: m.id,
    lat: m.localisation_lat!,
    lng: m.localisation_lng!,
    nom: m.nom_complet,
    photo: m.photo_url,
    telephone: m.telephone,
    specialites: m.specialites,
    distance_km: m.distance_km,
    disponibilite: m.disponibilite,
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Navigation className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Localisation</h1>
            <p className="text-gray-500">Votre position en temps réel pour les chauffeurs</p>
          </div>
        </div>
        {isActive ? (
          <Button
            variant="outline"
            className="min-h-[44px] border-red-200 text-red-600 hover:bg-red-50"
            onClick={deactivate}
          >
            <Power className="h-4 w-4 mr-2" />
            Désactiver ma position
          </Button>
        ) : (
          <Button
            className="min-h-[44px]"
            onClick={activate}
            loading={gpsLoading}
          >
            <Locate className="h-4 w-4 mr-2" />
            Activer ma position
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {gpsLoading && (
              <span className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Géolocalisation en cours...
              </span>
            )}
            {isActive ? (
              <Badge variant="success" className="animate-pulse">
                En ligne — visible par les chauffeurs
              </Badge>
            ) : (
              <Badge variant="secondary">Hors ligne</Badge>
            )}
            {position && (
              <span className="text-xs text-gray-500 font-mono">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </span>
            )}
            {isActive && lastUpdatedAt && (
              <span className="text-xs text-gray-500">
                Dernière mise à jour : {formatDateTime(lastUpdatedAt)}
              </span>
            )}
          </div>

          <div className="rounded-xl overflow-hidden border border-gray-200">
            {position ? (
              <MechanicsLiveMap
                center={position}
                mechanics={autresMecaniciens}
                height="h-72 sm:h-96"
                zoom={13}
                userDraggable
                onUserMove={(lat, lng) => updatePosition(lat, lng, { silent: true })}
              />
            ) : (
              <div className="h-72 sm:h-96 flex flex-col items-center justify-center bg-gray-50">
                <MapPin className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 mb-4">
                  Activez votre position pour vous rendre visible sur la carte
                </p>
                <Button onClick={activate} loading={gpsLoading} className="min-h-[44px]">
                  <Locate className="h-4 w-4 mr-2" />
                  Activer la géolocalisation
                </Button>
              </div>
            )}
          </div>

          {position && (
            <p className="text-xs text-gray-400 mt-2 text-center sm:text-right">
              Astuce : déplacez le marqueur bleu pour ajuster votre position manuellement
            </p>
          )}
        </CardContent>
      </Card>

      {isActive && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-green-600" />
              Mécaniciens actifs à proximité
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingActifs ? (
              <Skeleton className="h-24 w-full" />
            ) : actifs && actifs.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {actifs.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                  >
                    {m.photo_url ? (
                      <img
                        src={m.photo_url}
                        alt={m.nom_complet || "Mécanicien"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Navigation className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {m.nom_complet || "Mécanicien"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {m.specialites?.slice(0, 2).join(" · ") || "Généraliste"}
                      </p>
                    </div>
                    <Badge variant="success" className="text-[10px] shrink-0">
                      {m.distance_km != null ? `${m.distance_km.toFixed(1)} km` : "Actif"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-3">
                Aucun autre mécanicien actif à proximité
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
