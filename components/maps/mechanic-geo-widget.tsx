"use client";

import { useMechanicLocation } from "@/providers/mechanic-location-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Locate, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";

const MechanicsLiveMap = dynamic(() => import("@/components/maps/mechanics-live-map"), {
  ssr: false,
});

export default function MechanicGeoWidget() {
  const { position, isActive, gpsLoading, activate } = useMechanicLocation();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-blue-600" />
            Ma position en temps réel
          </span>
          <div className="flex items-center gap-2">
            {isActive && (
              <Badge variant="success" className="animate-pulse text-[10px]">
                Actif
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={activate}
              loading={gpsLoading}
              className="min-h-[36px]"
            >
              {gpsLoading ? (
                <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <Locate className="h-3.5 w-3.5 mr-1" />
              )}
              {position ? "Mettre à jour" : "Activer ma position"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {position ? (
          <div className="space-y-2">
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <MechanicsLiveMap
                center={position}
                height="h-48"
                zoom={15}
              />
            </div>
            <p className="text-xs text-gray-500 text-right">
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              {isActive && " — Mise à jour automatique toutes les 30s"}
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <MapPin className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500 mb-3">
              Activez votre position pour être visible par les chauffeurs à proximité
            </p>
            <Button
              variant="default"
              size="sm"
              onClick={activate}
              loading={gpsLoading}
              className="min-h-[44px]"
            >
              <Locate className="h-4 w-4 mr-2" />
              Activer la géolocalisation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
