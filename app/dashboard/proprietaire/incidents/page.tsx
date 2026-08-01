"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { incidentService } from "@/services/incident.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { TYPE_INCIDENT, GRAVITE_INCIDENT, STATUT_INCIDENT } from "@/constants";
import { AlertTriangle, Plus, MapPin, Locate, Clock } from "lucide-react";
import { MapPicker } from "@/components/maps";
import type { Incident } from "@/types";

const incidentSchema = z.object({
  type_incident: z.string().min(1, "Le type est requis"),
  gravite: z.string().min(1, "La gravité est requise"),
  description: z.string().min(5, "Description trop courte"),
  victimes: z.enum(["true", "false"]),
  nombre_victimes: z.coerce.number().optional(),
  vehicules_impliques: z.string().optional(),
  temoin_contact: z.string().optional(),
});

type IncidentFormValues = z.infer<typeof incidentSchema>;

const statutBadge: Record<string, "warning" | "info" | "success" | "default"> = {
  declare: "warning",
  en_cours: "info",
  traite: "success",
  cloture: "default",
};

const graviteColor: Record<string, string> = {
  Faible: "text-green-600",
  Moyenne: "text-yellow-600",
  Grave: "text-amber-600",
  Mortel: "text-red-600",
};

export default function ProprietaireIncidentsPage() {
  const queryClient = useQueryClient();
  const [createDialog, setCreateDialog] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number }>({
    lat: 6.1256,
    lng: 1.2254,
  });

  const { data: incidents, isLoading } = useQuery({
    queryKey: ["proprietaire", "incidents"],
    queryFn: () => incidentService.list({ limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => incidentService.create(data),
    onSuccess: () => {
      toast.success("Incident déclaré avec succès");
      queryClient.invalidateQueries({ queryKey: ["proprietaire", "incidents"] });
      setCreateDialog(false);
      reset();
    },
    onError: () => toast.error("Erreur lors de la déclaration"),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema) as Resolver<IncidentFormValues>,
    defaultValues: { victimes: "false" },
  });

  const hasVictimes = watch("victimes") === "true";

  const detectGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Géolocalisation non supportée");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success("Position capturée");
        setGpsLoading(false);
      },
      () => {
        toast.error("Impossible de récupérer la position");
        setGpsLoading(false);
      }
    );
  };

  const onSubmit = (data: IncidentFormValues) => {
    const now = new Date().toISOString();
    const payload = {
      type_incident: data.type_incident,
      gravite: data.gravite,
      description: data.description,
      date_incident: now,
      localisation_lat: location.lat,
      localisation_lng: location.lng,
      victimes: data.victimes === "true",
      nombre_victimes: data.nombre_victimes || undefined,
      vehicules_impliques: data.vehicules_impliques
        ? data.vehicules_impliques.split(",").map((s) => s.trim())
        : undefined,
      temoin_contact: data.temoin_contact || undefined,
    };
    createMutation.mutate(payload);
  };

  const openMaps = (lat?: number | null, lng?: number | null) => {
    if (!lat || !lng) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
            <p className="text-gray-500">Déclarez et suivez les incidents</p>
          </div>
        </div>
        <Button onClick={() => { reset(); setCreateDialog(true); }} className="w-full sm:w-auto min-h-[44px]">
          <Plus className="h-4 w-4 mr-2" />
          Déclarer un incident
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : incidents && incidents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {incidents.map((inc: Incident) => (
            <Card key={inc.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{inc.type_incident}</h3>
                  <Badge variant={statutBadge[inc.statut] || "info"} className="shrink-0 text-[10px]">
                    {STATUT_INCIDENT[inc.statut as keyof typeof STATUT_INCIDENT] || inc.statut}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 mb-3 flex-1">{inc.description}</p>
                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  <p className={graviteColor[inc.gravite] || "text-gray-600"}>
                    Gravité: <span className="font-medium">{inc.gravite}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(inc.date_incident)}
                  </p>
                  <p className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Signalé le {formatDateTime(inc.created_at)}
                  </p>
                  {inc.victimes && (
                    <p className="text-red-600 font-medium">{inc.nombre_victimes} victime(s)</p>
                  )}
                </div>
                {inc.localisation_lat && inc.localisation_lng && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full min-h-[36px] text-xs"
                    onClick={() => openMaps(inc.localisation_lat, inc.localisation_lng)}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Voir sur Google Maps
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucun incident déclaré</p>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        title="Déclarer un incident"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Type d'incident"
              options={Object.entries(TYPE_INCIDENT).map(([v, l]) => ({ value: v, label: l }))}
              error={errors.type_incident?.message}
              {...register("type_incident")}
            />
            <Select
              label="Gravité"
              options={Object.entries(GRAVITE_INCIDENT).map(([v, l]) => ({ value: v, label: l }))}
              error={errors.gravite?.message}
              {...register("gravite")}
            />
          </div>

          <Textarea
            label="Description"
            placeholder="Décrivez l'incident en détail..."
            rows={4}
            error={errors.description?.message}
            {...register("description")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Y a-t-il des victimes ?"
              options={[
                { value: "false", label: "Non" },
                { value: "true", label: "Oui" },
              ]}
              {...register("victimes")}
            />
            {hasVictimes && (
              <Input
                label="Nombre de victimes"
                type="number"
                placeholder="0"
                error={errors.nombre_victimes?.message}
                {...register("nombre_victimes")}
              />
            )}
          </div>

          <Input
            label="Véhicules impliqués (séparés par virgule)"
            placeholder="TG-1234-AB, TG-5678-CD"
            {...register("vehicules_impliques")}
          />

          <Input
            label="Contact témoin (optionnel)"
            placeholder="+228 90 00 00 00"
            {...register("temoin_contact")}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Position sur la carte</label>
              <Button type="button" variant="outline" size="sm" onClick={detectGPS} loading={gpsLoading} className="min-h-[36px]">
                <Locate className="h-3.5 w-3.5 mr-1" />
                {gpsLoading ? "Détection..." : "Ma position"}
              </Button>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <MapPicker
                lat={location.lat}
                lng={location.lng}
                onPositionChange={(lat, lng) => setLocation({ lat, lng })}
                height="h-48"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setCreateDialog(false)} className="w-full sm:w-auto min-h-[44px]">
              Annuler
            </Button>
            <Button
              type="submit"
              variant="destructive"
              loading={createMutation.isPending}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Déclarer l&apos;incident
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
