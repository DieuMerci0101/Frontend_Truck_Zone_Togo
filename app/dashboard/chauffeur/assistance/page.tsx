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
import { TYPE_PANNE, URGENCE, STATUT_ASSISTANCE } from "@/constants";
import { Wrench, Plus, MapPin, Clock, AlertTriangle, Phone } from "lucide-react";

const assistanceSchema = z.object({
  type_panne: z.string().min(1, "Le type de panne est requis"),
  description: z.string().min(5, "Description trop courte"),
  urgence: z.string().min(1, "Le niveau d'urgence est requis"),
  vehicule_description: z.string().min(2, "Description du véhicule requise"),
});

type AssistanceFormValues = z.infer<typeof assistanceSchema>;

const statutBadge: Record<string, "warning" | "info" | "success" | "default"> = {
  en_attente: "warning",
  assignee: "info",
  en_cours: "info",
  terminee: "success",
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

export default function ChauffeurAssistancePage() {
  const queryClient = useQueryClient();
  const [createDialog, setCreateDialog] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data: mesDemandes, isLoading } = useQuery({
    queryKey: ["chauffeur", "mes-demandes"],
    queryFn: () => chauffeurService.getMesDemandes(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => chauffeurService.creerDemande(data),
    onSuccess: () => {
      toast.success("Demande d'assistance envoyée !");
      queryClient.invalidateQueries({ queryKey: ["chauffeur", "mes-demandes"] });
      setCreateDialog(false);
      reset();
      setLocation(null);
    },
    onError: () => toast.error("Erreur lors de l'envoi"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssistanceFormValues>({
    resolver: zodResolver(assistanceSchema) as Resolver<AssistanceFormValues>,
  });

  const onSubmit = (data: AssistanceFormValues) => {
    const payload = {
      ...data,
      localisation_lat: location?.lat || 6.1256,
      localisation_lng: location?.lng || 1.2254,
    };
    createMutation.mutate(payload);
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          toast.success("Position capturée");
        },
        () => toast.error("Impossible de récupérer la position")
      );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <Wrench className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assistance mécanique</h1>
            <p className="text-gray-500">Demandez de l&apos;aide en cas de panne</p>
          </div>
        </div>
        <Button onClick={() => setCreateDialog(true)} className="w-full sm:w-auto min-h-[44px] bg-red-600 hover:bg-red-700">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Demander une assistance
        </Button>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-900">Urgence mécanique ?</p>
              <p className="text-sm text-red-700 mt-1">
                En cas de panne, décrivez votre problème et localisation. Un mécanicien partenaire sera notifié automatiquement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : mesDemandes && mesDemandes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mesDemandes.map((demande) => (
            <Card key={demande.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {TYPE_PANNE[demande.type_panne as keyof typeof TYPE_PANNE] || demande.type_panne}
                  </h3>
                  <Badge variant={statutBadge[demande.statut] || "info"} className="shrink-0 text-[10px]">
                    {STATUT_ASSISTANCE[demande.statut as keyof typeof STATUT_ASSISTANCE] || demande.statut}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">{demande.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge variant={urgenceBadge[demande.urgence] || "default"} className="text-[10px]">
                    {demande.urgence}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  <p>Véhicule: {demande.vehicule_description}</p>
                  <p className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {formatDate(demande.created_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Wrench className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune demande d&apos;assistance</p>
            <Button className="mt-4 w-full sm:w-auto min-h-[44px]" onClick={() => setCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Créer votre première demande
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} title="Demander une assistance mécanique" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Type de panne" options={Object.entries(TYPE_PANNE).map(([v, l]) => ({ value: v, label: l }))} error={errors.type_panne?.message} {...register("type_panne")} />
            <Select label="Niveau d'urgence" options={Object.entries(URGENCE).map(([v, l]) => ({ value: v, label: l }))} error={errors.urgence?.message} {...register("urgence")} />
          </div>
          <Textarea label="Description du problème" placeholder="Décrivez la panne en détail..." rows={4} error={errors.description?.message} {...register("description")} />
          <Input label="Description du véhicule" placeholder="Ex: Camion Renault Premium, TG-1234-AB" error={errors.vehicule_description?.message} {...register("vehicule_description")} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Géolocalisation</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={requestLocation} className="min-h-[44px]">
                <MapPin className="h-4 w-4 mr-1" />
                {location ? "Position capturée" : "Ma position actuelle"}
              </Button>
              {location && <span className="text-xs text-gray-500">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setCreateDialog(false)} className="w-full sm:w-auto min-h-[44px]">Annuler</Button>
            <Button type="submit" loading={createMutation.isPending} className="w-full sm:w-auto min-h-[44px] bg-red-600 hover:bg-red-700">
              <AlertTriangle className="h-4 w-4 mr-2" /> Envoyer la demande
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
