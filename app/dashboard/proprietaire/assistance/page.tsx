"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { proprietaireService } from "@/services/proprietaire.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Headphones, Plus, MapPin, Clock, AlertTriangle, CheckCircle, Loader2, Locate } from "lucide-react";
import { MapPicker } from "@/components/maps";
import NearbyMechanicsMap from "@/components/maps/nearby-mechanics-map";

const TYPE_PANNE_OPTIONS = [
  { value: "Mécanique", label: "Mécanique" },
  { value: "Pneumatique", label: "Pneumatique" },
  { value: "Électricité", label: "Électricité" },
  { value: "Carrosserie", label: "Carrosserie" },
  { value: "Autre", label: "Autre" },
];

const URGENCE_OPTIONS = [
  { value: "Faible", label: "Faible" },
  { value: "Moyenne", label: "Moyenne" },
  { value: "Haute", label: "Haute" },
  { value: "Critique", label: "Critique" },
];

const assistanceSchema = z.object({
  type_panne: z.string().min(1, "Type de panne requis"),
  description: z.string().min(5, "Description requise (5 caractères min)"),
  urgence: z.string().min(1, "Urgence requise"),
  vehicule_description: z.string().min(2, "Description du véhicule requise"),
  localisation_lat: z.coerce.number().min(-90).max(90),
  localisation_lng: z.coerce.number().min(-180).max(180),
});

type AssistanceFormValues = z.infer<typeof assistanceSchema>;

const statutBadge: Record<string, "success" | "warning" | "destructive" | "info"> = {
  en_attente: "warning",
  en_cours: "info",
  resolue: "success",
  annulee: "destructive",
};

const statutLabel: Record<string, string> = {
  en_attente: "En attente",
  en_cours: "En cours",
  resolue: "Résolue",
  annulee: "Annulée",
};

const urgenceBadge: Record<string, "destructive" | "warning" | "info" | "default"> = {
  critique: "destructive",
  haute: "warning",
  moyenne: "info",
  faible: "default",
};

export default function ProprietaireAssistancePage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const { data: demandes, isLoading } = useQuery({
    queryKey: ["proprietaire", "assistance"],
    queryFn: () => proprietaireService.getMyAssistances(),
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AssistanceFormValues>({
    resolver: zodResolver(assistanceSchema) as Resolver<AssistanceFormValues>,
    defaultValues: {
      localisation_lat: 6.1256,
      localisation_lng: 1.2254,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: AssistanceFormValues) => proprietaireService.createAssistance(data as any),
    onSuccess: () => {
      toast.success("Demande d'assistance envoyée");
      queryClient.invalidateQueries({ queryKey: ["proprietaire", "assistance"] });
      setDialogOpen(false);
      reset();
    },
    onError: () => toast.error("Erreur lors de l'envoi"),
  });

  const onSubmit = (data: AssistanceFormValues) => {
    createMutation.mutate(data);
  };

  const detectGPS = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      toast.error("Géolocalisation non supportée sur cet appareil");
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("localisation_lat", pos.coords.latitude);
        setValue("localisation_lng", pos.coords.longitude);
        toast.success("Position détectée");
        setGpsLoading(false);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Veuillez autoriser l'accès à la localisation GPS dans votre navigateur");
        } else if (err.code === err.TIMEOUT) {
          toast.error("Le GPS met trop de temps à répondre. Réessayez dans une zone dégagée");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          toast.error("Position GPS indisponible. Vérifiez que le GPS est activé");
        } else {
          toast.error("Impossible de détecter la position GPS");
        }
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Headphones className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assistance mécanique</h1>
            <p className="text-gray-500">Demandez de l&apos;aide en cas de panne</p>
          </div>
        </div>
        <Button onClick={() => { reset(); setDialogOpen(true); }} className="w-full sm:w-auto min-h-[44px]">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle demande
        </Button>
      </div>

      <NearbyMechanicsMap />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : demandes && demandes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {demandes.map((d) => (
            <Card key={d.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {TYPE_PANNE_OPTIONS.find((o) => o.value === d.type_panne)?.label || d.type_panne}
                  </h3>
                  <Badge variant={statutBadge[d.statut] || "info"} className="shrink-0 text-[10px]">
                    {statutLabel[d.statut] || d.statut}
                  </Badge>
                </div>
                <Badge variant={urgenceBadge[d.urgence] || "default"} className="text-[10px] w-fit mb-2">
                  {d.urgence}
                </Badge>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2 flex-1">{d.description}</p>
                <p className="text-sm text-gray-500 mb-1">Véhicule: {d.vehicule_description}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(d.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Headphones className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune demande d&apos;assistance</p>
            <Button className="mt-4 w-full sm:w-auto min-h-[44px]" onClick={() => { reset(); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une demande
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Demander une assistance" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Type de panne" options={TYPE_PANNE_OPTIONS} error={errors.type_panne?.message} {...register("type_panne")} />
            <Select label="Urgence" options={URGENCE_OPTIONS} error={errors.urgence?.message} {...register("urgence")} />
          </div>
          <Input label="Description du véhicule" placeholder="Ex: Mercedes Actros 1845, plaque TG-1234" error={errors.vehicule_description?.message} {...register("vehicule_description")} />
          <Textarea label="Description du problème" placeholder="Décrivez la panne en détail..." rows={4} error={errors.description?.message} {...register("description")} />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Position sur la carte</label>
              <Button type="button" variant="outline" size="sm" onClick={detectGPS} loading={gpsLoading} className="min-h-[36px]">
                <Locate className="h-3.5 w-3.5 mr-1" />
                {gpsLoading ? "Détection..." : "Ma position"}
              </Button>
            </div>
            <input type="hidden" {...register("localisation_lat")} />
            <input type="hidden" {...register("localisation_lng")} />
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <MapPicker
                lat={watch("localisation_lat") || 6.1256}
                lng={watch("localisation_lng") || 1.2254}
                onPositionChange={(lat, lng) => {
                  setValue("localisation_lat", lat);
                  setValue("localisation_lng", lng);
                }}
                height="h-48"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto min-h-[44px]">Annuler</Button>
            <Button type="submit" loading={createMutation.isPending} className="w-full sm:w-auto min-h-[44px]">Envoyer la demande</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
