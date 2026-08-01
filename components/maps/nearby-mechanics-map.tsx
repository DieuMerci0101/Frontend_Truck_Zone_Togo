"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { mecanicienService } from "@/services/mecanicien.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigation, Locate, Wrench, MapPin, Users } from "lucide-react";
import dynamic from "next/dynamic";

const MechanicsLiveMap = dynamic(() => import("@/components/maps/mechanics-live-map"), {
  ssr: false,
});

export default function NearbyMechanicsMap() {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const { data: actifs, isLoading: loadingMecaniciens } = useQuery({
    queryKey: ["mecanicien", "actifs", userPos?.lat, userPos?.lng],
    queryFn: () => mecanicienService.getMecaniciensActifs(userPos!.lat, userPos!.lng, 50),
    enabled: !!userPos,
    refetchInterval: 30000,
  });

  const detectPosition = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    detectPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markers = (actifs || []).map((m) => ({
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Mécaniciens en ligne à proximité
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={detectPosition}
            loading={gpsLoading}
            className="min-h-[36px]"
          >
            <Locate className="h-3.5 w-3.5 mr-1" />
            {userPos ? "Recentrer" : "Ma position"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!userPos ? (
          <div className="text-center py-6">
            <MapPin className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500 mb-3">
              Activez votre position pour trouver les mécaniciens en ligne près de chez vous
            </p>
            <Button
              variant="default"
              size="sm"
              onClick={detectPosition}
              loading={gpsLoading}
              className="min-h-[44px]"
            >
              <Locate className="h-4 w-4 mr-2" />
              Activer la géolocalisation
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-gray-200">
              {loadingMecaniciens ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <MechanicsLiveMap
                  center={userPos}
                  mechanics={markers}
                  height="h-48"
                  zoom={12}
                />
              )}
            </div>
            {actifs && actifs.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {actifs.length} mécanicien{actifs.length > 1 ? "s" : ""} en ligne
                  {actifs.length > 1 ? "s" : ""}
                </p>
                <div className="max-h-48 overflow-y-auto space-y-2">
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
                          <Wrench className="h-5 w-5 text-green-600" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {m.nom_complet || "Mécanicien"}
                        </p>
                        <div className="flex gap-1.5 flex-wrap">
                          {m.specialites?.slice(0, 2).map((s) => (
                            <Badge key={s} variant="info" className="text-[9px]">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge variant="success" className="text-[10px] shrink-0">
                        {m.distance_km != null ? `${m.distance_km.toFixed(1)} km` : "En ligne"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {actifs && actifs.length === 0 && (
              <div className="text-center py-4">
                <Navigation className="h-6 w-6 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">
                  Aucun mécanicien en ligne à proximité pour le moment
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
