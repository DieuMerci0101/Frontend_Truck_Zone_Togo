"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { incidentService } from "@/services/incident.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, getStatusColor } from "@/lib/utils";
import { TYPE_INCIDENT, GRAVITE_INCIDENT, STATUT_INCIDENT } from "@/constants";
import { AlertTriangle, Plus, MapPin } from "lucide-react";

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

export default function ChauffeurIncidentsPage() {
  const queryClient = useQueryClient();
  const [createDialog, setCreateDialog] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data: incidents, isLoading } = useQuery({
    queryKey: ["chauffeur", "incidents"],
    queryFn: () => incidentService.list({ limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => incidentService.create(data),
    onSuccess: () => {
      toast.success("Incident déclaré avec succès");
      queryClient.invalidateQueries({ queryKey: ["chauffeur", "incidents"] });
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

  const onSubmit = (data: IncidentFormValues) => {
    const now = new Date().toISOString();
    const payload = {
      type_incident: data.type_incident,
      gravite: data.gravite,
      description: data.description,
      date_incident: now,
      localisation_lat: location?.lat || 6.1256,
      localisation_lng: location?.lng || 1.2254,
      victimes: data.victimes === "true",
      nombre_victimes: data.nombre_victimes || undefined,
      vehicules_impliques: data.vehicules_impliques
        ? data.vehicules_impliques.split(",").map((s) => s.trim())
        : undefined,
      temoin_contact: data.temoin_contact || undefined,
    };
    createMutation.mutate(payload);
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          toast.success("Position récupérée");
        },
        () => toast.error("Impossible de récupérer la position")
      );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
            <p className="text-gray-500">Déclarez et suivez vos incidents</p>
          </div>
        </div>
        <Button onClick={() => setCreateDialog(true)} className="w-full sm:w-auto min-h-[44px]">
          <Plus className="h-4 w-4 mr-2" />
          Déclarer un incident
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : incidents && incidents.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {incidents.map((inc) => (
            <Card key={inc.id}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{inc.type_incident}</h3>
                      <Badge variant={statutBadge[inc.statut] || "info"}>
                        {STATUT_INCIDENT[inc.statut as keyof typeof STATUT_INCIDENT] || inc.statut}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{inc.description}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-sm text-gray-500">
                      <span>Gravité: {inc.gravite}</span>
                      <span>{formatDate(inc.date_incident)}</span>
                      {inc.victimes && (
                        <span className="text-red-600 font-medium">
                          {inc.nombre_victimes} victime(s)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Localisation
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={requestLocation}
                className="min-h-[44px]"
              >
                <MapPin className="h-4 w-4 mr-1" />
                {location ? "Position capturée" : "Ma position actuelle"}
              </Button>
              {location && (
                <span className="text-xs text-gray-500">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </span>
              )}
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
