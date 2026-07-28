"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { chauffeurService } from "@/services/chauffeur.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Headphones, Plus, MapPin, Clock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

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
    queryFn: () => chauffeurService.getMyAssistances(),
  });

  const {
    register,
    handleSubmit,
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
    mutationFn: (data: AssistanceFormValues) => chauffeurService.createAssistance(data as any),
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setValue("localisation_lat", pos.coords.latitude);
          setValue("localisation_lng", pos.coords.longitude);
          toast.success("Position détectée");
          setGpsLoading(false);
        },
        () => {
          toast.error("Impossible de détecter la position");
          setGpsLoading(false);
        }
      );
    } else {
      toast.error("Géolocalisation non supportée");
      setGpsLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <Headphones className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assistance mécanique</h1>
            <p className="text-gray-500">Demandez de l&apos;aide en cas de panne</p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto min-h-[44px]">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle demande
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : demandes && demandes.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {demandes.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {TYPE_PANNE_OPTIONS.find((o) => o.value === d.type_panne)?.label || d.type_panne}
                      </h3>
                      <Badge variant={statutBadge[d.statut] || "info"}>
                        {statutLabel[d.statut] || d.statut}
                      </Badge>
                      <Badge variant={urgenceBadge[d.urgence] || "default"}>
                        {d.urgence}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{d.description}</p>
                    <p className="text-sm text-gray-500 mt-1">Véhicule: {d.vehicule_description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(d.created_at)}</span>
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
            <Headphones className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune demande d&apos;assistance</p>
            <Button className="mt-4 w-full sm:w-auto min-h-[44px]" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une demande
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Demander une assistance" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Type de panne" options={TYPE_PANNE_OPTIONS} error={errors.type_panne?.message} {...register("type_panne")} />
            <Select label="Urgence" options={URGENCE_OPTIONS} error={errors.urgence?.message} {...register("urgence")} />
          </div>
          <Input label="Description du véhicule" placeholder="Ex: Mercedes Actros 1845, plaque TG-1234" error={errors.vehicule_description?.message} {...register("vehicule_description")} />
          <Textarea label="Description du problème" placeholder="Décrivez la panne en détail..." rows={4} error={errors.description?.message} {...register("description")} />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Position GPS</label>
              <Button type="button" variant="outline" size="sm" onClick={detectGPS} loading={gpsLoading} className="min-h-[36px]">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                Détecter ma position
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Latitude" type="number" step="any" error={errors.localisation_lat?.message} {...register("localisation_lat")} />
              <Input label="Longitude" type="number" step="any" error={errors.localisation_lng?.message} {...register("localisation_lng")} />
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
