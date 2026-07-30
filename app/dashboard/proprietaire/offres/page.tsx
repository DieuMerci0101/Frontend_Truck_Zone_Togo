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
import { formatMoney, formatDate } from "@/lib/utils";
import { TYPE_CONTRAT, ZONES_CIRCULATION, API_URL } from "@/constants";
import { Briefcase, Plus, Pencil, Trash2, Clock } from "lucide-react";
import type { Offre, OffreCreate, OffreUpdate, Camion } from "@/types";
import PageAnimation from "@/components/ui/page-animation";
import CardAnimation from "@/components/ui/card-animation";

function resolvePhotoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
  return url;
}

function isEditable(created_at: string): boolean {
  if (!created_at) return false;
  const created = new Date(created_at);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return diffMs <= 5 * 60 * 1000;
}

function minutesRemaining(created_at: string): number {
  if (!created_at) return 0;
  const created = new Date(created_at);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const remaining = 5 - Math.floor(diffMs / 60000);
  return Math.max(0, remaining);
}

const offreSchema = z.object({
  titre: z.string().min(1, "Le titre est requis"),
  description: z.string().min(5, "Description trop courte"),
  type_contrat: z.string().min(1, "Le type de contrat est requis"),
  salaire_propose: z.coerce.number().min(0, "Le salaire doit être positif"),
  zone_travail: z.string().min(1, "La zone est requise"),
  date_debut: z.string().min(1, "La date de début est requise"),
  camion_id: z.string().optional(),
});

type OffreFormValues = z.infer<typeof offreSchema>;

const statutBadge: Record<string, "success" | "info" | "default"> = {
  active: "success",
  pourvue: "info",
  expirée: "default",
};

export default function ProprietaireOffresPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffre, setEditingOffre] = useState<Offre | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: offres, isLoading } = useQuery({
    queryKey: ["proprietaire", "offres"],
    queryFn: () => proprietaireService.getMyOffres(),
  });

  const { data: camions } = useQuery({
    queryKey: ["proprietaire", "camions"],
    queryFn: () => proprietaireService.getMyCamions(),
  });

  const [selectedCamionId, setSelectedCamionId] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<OffreFormValues>({
    resolver: zodResolver(offreSchema) as Resolver<OffreFormValues>,
  });

  const watchCamionId = watch("camion_id");
  const selectedCamion: Camion | undefined = camions?.find((c) => c.id === (watchCamionId || selectedCamionId));

  const createMutation = useMutation({
    mutationFn: (data: OffreFormValues) => proprietaireService.createOffre(data as OffreCreate),
    onSuccess: () => {
      toast.success("Offre publiée avec succès");
      queryClient.invalidateQueries({ queryKey: ["proprietaire", "offres"] });
      closeDialog();
    },
    onError: () => toast.error("Erreur lors de la publication"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: OffreFormValues }) =>
      proprietaireService.updateOffre(id, data as OffreUpdate),
    onSuccess: () => {
      toast.success("Offre mise à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["proprietaire", "offres"] });
      closeDialog();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Erreur lors de la mise à jour");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => proprietaireService.deleteOffre(id),
    onSuccess: () => {
      toast.success("Offre supprimée avec succès");
      queryClient.invalidateQueries({ queryKey: ["proprietaire", "offres"] });
      setDeleteConfirm(null);
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingOffre(null);
    setSelectedCamionId("");
    reset();
  };

  const openEdit = (offre: Offre) => {
    setEditingOffre(offre);
    setSelectedCamionId(offre.camion_id || "");
    reset({
      titre: offre.titre,
      description: offre.description,
      type_contrat: offre.type_contrat,
      salaire_propose: offre.salaire_propose,
      zone_travail: offre.zone_travail,
      date_debut: offre.date_debut.split("T")[0],
      camion_id: offre.camion_id || "",
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: OffreFormValues) => {
    const payload = { ...data, camion_id: data.camion_id || undefined };
    if (editingOffre) {
      updateMutation.mutate({ id: editingOffre.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <PageAnimation className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg">
            <Briefcase className="h-6 w-6 text-slate-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes offres</h1>
            <p className="text-gray-500">Publiez et gérez vos offres d&apos;emploi</p>
          </div>
        </div>
        <Button onClick={() => { reset(); setSelectedCamionId(""); setDialogOpen(true); }} className="w-full sm:w-auto min-h-[44px]">
          <Plus className="h-4 w-4 mr-2" />
          Publier une offre
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-56" />)}
        </div>
      ) : offres && offres.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {offres.map((offre, i) => {
            const canEdit = isEditable(offre.created_at);
            const minsLeft = minutesRemaining(offre.created_at);
            return (
              <CardAnimation index={i}>
              <Card key={offre.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{offre.titre}</h3>
                    <Badge variant={statutBadge[offre.statut] || "info"} className="shrink-0 text-[10px]">
                      {offre.statut}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">{offre.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="info" className="text-[10px]">
                      {TYPE_CONTRAT[offre.type_contrat as keyof typeof TYPE_CONTRAT] || offre.type_contrat}
                    </Badge>
                    <span className="text-sm font-semibold text-green-700">{formatMoney(offre.salaire_propose)}</span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1 mb-3">
                    <p>Zone: {offre.zone_travail}</p>
                    <p>Début: {formatDate(offre.date_debut)}</p>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 mb-3">
                      <Clock className="h-3 w-3" />
                      <span>Modifiable pendant {minsLeft} min</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-auto">
                    {canEdit && (
                      <Button variant="outline" size="sm" onClick={() => openEdit(offre)} className="min-h-[44px] flex-1">
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Modifier
                      </Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => setDeleteConfirm(offre.id)} className="min-h-[44px]">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </CardAnimation>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune offre publiée</p>
            <Button className="mt-4 w-full sm:w-auto min-h-[44px]" onClick={() => { reset(); setSelectedCamionId(""); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Publier votre première offre
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} title={editingOffre ? "Modifier l'offre" : "Publier une offre"} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
          <Input label="Titre" placeholder="Chauffeur pour trajet Lomé-Kara" error={errors.titre?.message} {...register("titre")} />
          <Textarea label="Description" placeholder="Décrivez les conditions et exigences..." rows={4} error={errors.description?.message} {...register("description")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Type de contrat" options={Object.entries(TYPE_CONTRAT).map(([v, l]) => ({ value: v, label: l }))} error={errors.type_contrat?.message} {...register("type_contrat")} />
            <Input label="Salaire proposé (FCFA)" type="number" placeholder="250000" error={errors.salaire_propose?.message} {...register("salaire_propose")} />
            <Select label="Zone de travail" options={ZONES_CIRCULATION.map((z) => ({ value: z, label: z }))} error={errors.zone_travail?.message} {...register("zone_travail")} />
            <Input label="Date de début" type="date" error={errors.date_debut?.message} {...register("date_debut")} />
          </div>
          {camions && camions.length > 0 && (
            <Select
              label="Camion associé (optionnel)"
              options={[{ value: "", label: "Aucun" }, ...camions.map((c) => ({ value: c.id, label: `${c.marque} ${c.modele} (${c.immatriculation})` }))]}
              {...register("camion_id")}
            />
          )}
          {selectedCamion && (() => {
            const photoUrl = resolvePhotoUrl(selectedCamion.photos?.find((p) => p.est_principale)?.photo_url || selectedCamion.photo_principale_url);
            if (!photoUrl) return null;
            return (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <img src={photoUrl} alt={selectedCamion.marque} className="h-16 w-16 rounded-lg object-cover" />
                <div>
                  <p className="font-medium text-gray-900">{selectedCamion.marque} {selectedCamion.modele}</p>
                  <p className="text-sm text-gray-500">{selectedCamion.immatriculation}</p>
                </div>
              </div>
            );
          })()}
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" type="button" onClick={closeDialog} className="w-full sm:w-auto min-h-[44px]">Annuler</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending} className="w-full sm:w-auto min-h-[44px]">
              {editingOffre ? "Mettre à jour" : "Publier"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmer la suppression" size="sm">
        <p className="text-gray-600 mb-4">Êtes-vous sûr de vouloir supprimer cette offre ?</p>
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="w-full sm:w-auto min-h-[44px]">Annuler</Button>
          <Button variant="destructive" loading={deleteMutation.isPending} onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)} className="w-full sm:w-auto min-h-[44px]">Supprimer</Button>
        </div>
      </Dialog>
    </PageAnimation>
  );
}
