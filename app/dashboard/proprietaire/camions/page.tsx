"use client";

import { useState, useRef } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
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
import { TYPE_CAMION, ETAT_CAMION } from "@/constants";
import { API_URL } from "@/constants";
import { Truck, Plus, Pencil, Trash2, Camera, Upload, Star, Eye, EyeOff, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Camion, CamionCreate, CamionUpdate, CamionPhoto } from "@/types";
import PageAnimation from "@/components/ui/page-animation";
import CardAnimation from "@/components/ui/card-animation";

const camionSchema = z.object({
  immatriculation: z.string().min(1, "Immatriculation requise").regex(/^[A-Za-z]{2,3}-\d{2,4}(-[A-Za-z]{1,3})?$/, "Le format de l'immatriculation est invalide. Exemple attendu : TGE-12 ou TG-1234-AB"),
  marque: z.string().min(1, "Marque requise"),
  modele: z.string().min(1, "Modèle requis"),
  annee: z.coerce.number().min(1990, "Année minimale: 1990").max(2030),
  type_camion: z.string().min(1, "Type requis"),
  capacite_charge: z.coerce.number().min(1, "Capacité requise"),
  etat: z.string().min(1, "État requis"),
  description: z.string().optional(),
  expires_at: z.string().optional().nullable(),
  nb_essieux: z.coerce.number().min(2).max(12).optional().nullable(),
  carburant: z.string().optional().nullable(),
  boite_vitesse: z.string().optional().nullable(),
  kilometrage: z.coerce.number().min(0).optional().nullable(),
  localisation: z.string().optional().nullable(),
});

type CamionFormValues = z.infer<typeof camionSchema>;

const etatBadge: Record<string, "success" | "info" | "warning" | "destructive"> = {
  bon_etat: "success",
  excellent: "success",
  bon: "info",
  use: "warning",
  en_reparation: "destructive",
};

function resolvePhotoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
  return url;
}

export default function ProprietaireCamionsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCamion, setEditingCamion] = useState<Camion | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [photoCamionId, setPhotoCamionId] = useState<string | null>(null);
  const [viewPhotos, setViewPhotos] = useState<Camion | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [publishDialog, setPublishDialog] = useState(false);
  const [publishCamion, setPublishCamion] = useState<Camion | null>(null);
  const [publishExpiresAt, setPublishExpiresAt] = useState("");
  const [prolongerDialog, setProlongerDialog] = useState(false);
  const [prolongerCamion, setProlongerCamion] = useState<Camion | null>(null);
  const [prolongerExpiresAt, setProlongerExpiresAt] = useState("");

  const { data: camions, isLoading } = useQuery({
    queryKey: ["proprietaire", "camions"],
    queryFn: () => proprietaireService.getMyCamions(),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CamionFormValues>({
    resolver: zodResolver(camionSchema) as Resolver<CamionFormValues>,
  });
  const watchEtat = useWatch({ control, name: "etat" });

  const createMutation = useMutation({
    mutationFn: (data: CamionFormValues) =>
      proprietaireService.createCamion(data as CamionCreate),
    onSuccess: () => {
      toast.success("Camion ajouté avec succès");
      queryClient.invalidateQueries({ queryKey: ["proprietaire", "camions"] });
      closeDialog();
    },
    onError: () => toast.error("Erreur lors de l'ajout du camion"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CamionFormValues }) =>
      proprietaireService.updateCamion(id, data as CamionUpdate),
    onSuccess: () => {
      toast.success("Camion mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["proprietaire", "camions"] });
      closeDialog();
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => proprietaireService.deleteCamion(id),
    onSuccess: () => {
      toast.success("Camion supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["proprietaire", "camions"] });
      setDeleteConfirm(null);
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const publishMutation = useMutation({
    mutationFn: ({ camionId, expires_at }: { camionId: string; expires_at?: string }) =>
      proprietaireService.togglePublish(camionId, expires_at),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["proprietaire", "camions"] });
    },
    onError: () => toast.error("Erreur lors de la publication"),
  });

  const prolongerMutation = useMutation({
    mutationFn: ({ camionId, expires_at }: { camionId: string; expires_at: string }) =>
      proprietaireService.extendPublish(camionId, expires_at),
    onSuccess: () => {
      toast.success("Publication prolongée avec succès");
      queryClient.invalidateQueries({ queryKey: ["proprietaire", "camions"] });
    },
    onError: () => toast.error("Erreur lors de la prolongation"),
  });

  const photoMutation = useMutation({
    mutationFn: ({ camionId, file }: { camionId: string; file: File }) => {
      const fd = new FormData();
      fd.append("file", file);
      return proprietaireService.uploadCamionPhoto(camionId, fd);
    },
    onSuccess: () => {
      toast.success("Photo uploadée");
      queryClient.invalidateQueries({ queryKey: ["proprietaire", "camions"] });
      setPhotoCamionId(null);
    },
    onError: () => toast.error("Erreur lors de l'upload"),
  });

  const deletePhotoMutation = useMutation({
    mutationFn: ({ camionId, photoId }: { camionId: string; photoId: string }) =>
      proprietaireService.deleteCamionPhoto(camionId, photoId),
    onSuccess: () => {
      toast.success("Photo supprimée");
      queryClient.invalidateQueries({ queryKey: ["proprietaire", "camions"] });
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const setMainPhotoMutation = useMutation({
    mutationFn: ({ camionId, photoId }: { camionId: string; photoId: string }) =>
      proprietaireService.setMainPhoto(camionId, photoId),
    onSuccess: () => {
      toast.success("Photo principale mise à jour");
      queryClient.invalidateQueries({ queryKey: ["proprietaire", "camions"] });
    },
    onError: () => toast.error("Erreur"),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCamion(null);
    reset();
  };

  const openEdit = (camion: Camion) => {
    setEditingCamion(camion);
    reset({
      immatriculation: camion.immatriculation,
      marque: camion.marque,
      modele: camion.modele,
      annee: camion.annee,
      type_camion: camion.type_camion,
      capacite_charge: camion.capacite_charge,
      etat: camion.etat,
      description: camion.description || "",
      expires_at: camion.expires_at ? camion.expires_at.slice(0, 16) : "",
      nb_essieux: camion.nb_essieux || null,
      carburant: camion.carburant || "",
      boite_vitesse: camion.boite_vitesse || "",
      kilometrage: camion.kilometrage || null,
      localisation: camion.localisation || "",
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: CamionFormValues) => {
    if (editingCamion) {
      updateMutation.mutate({ id: editingCamion.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !photoCamionId) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} dépasse 5 Mo — ignoré`);
        continue;
      }
      photoMutation.mutate({ camionId: photoCamionId, file });
    }
  };

  return (
    <PageAnimation className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg">
            <Truck className="h-6 w-6 text-slate-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes camions</h1>
            <p className="text-gray-500">Gérez votre flotte de véhicules</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingCamion(null);
            reset();
            setDialogOpen(true);
          }}
          className="w-full sm:w-auto min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un camion
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : camions && camions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {camions.map((camion, i) => {
            const photoUrl = resolvePhotoUrl(camion.photo_principale_url);
            return (
              <CardAnimation index={i}>
              <Card key={camion.id} className="overflow-hidden">
                <div
                  className="h-40 sm:h-44 bg-gray-200 flex items-center justify-center relative group cursor-pointer"
                  onClick={() => { setViewPhotos(camion); setCurrentPhotoIndex(0); }}
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={`${camion.marque} ${camion.modele}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Truck className="h-12 w-12 text-gray-400" />
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPhotoCamionId(camion.id); fileInputRef.current?.click(); }}
                      className="p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    <Badge variant={camion.is_public ? "success" : "secondary"} className="text-[10px]">
                      {camion.is_public ? "Public" : "Privé"}
                    </Badge>
                    {camion.photos && camion.photos.length > 0 && (
                      <Badge variant="info" className="text-[10px]">
                        {camion.photos.length} photo(s)
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        {camion.marque} {camion.modele}
                      </h3>
                      <p className="text-sm text-gray-500">{camion.immatriculation}</p>
                    </div>
                    <Badge variant={etatBadge[camion.etat] || "info"} className="shrink-0">
                      {ETAT_CAMION[camion.etat as keyof typeof ETAT_CAMION] || camion.etat}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1 mt-3">
                    <p>Année: {camion.annee}</p>
                    <p>Type: {TYPE_CAMION[camion.type_camion as keyof typeof TYPE_CAMION] || camion.type_camion}</p>
                    <p>Capacité: {camion.capacite_charge} tonnes</p>
                    {camion.nb_essieux && <p>Essieux: {camion.nb_essieux}</p>}
                    {camion.carburant && <p>Carburant: {camion.carburant}</p>}
                    {camion.boite_vitesse && <p>Boîte: {camion.boite_vitesse}</p>}
                    {camion.kilometrage && <p>Kilométrage: {camion.kilometrage.toLocaleString()} km</p>}
                    {camion.localisation && <p>Localisation: {camion.localisation}</p>}
                    {camion.expires_at && (
                      <p className={new Date(camion.expires_at) <= new Date() ? "text-red-500 font-medium" : "text-amber-600"}>
                        Expire le {new Date(camion.expires_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(camion)} className="min-h-[44px]">
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Modifier
                      </Button>
                      {camion.is_public || (camion.etat !== "en_reparation" && camion.etat !== "use") ? (
                        <Button
                          variant={camion.is_public ? "secondary" : "default"}
                          size="sm"
                          onClick={() => {
                            if (camion.is_public) {
                              publishMutation.mutate({ camionId: camion.id });
                            } else {
                              setPublishCamion(camion);
                              setPublishExpiresAt("");
                              setPublishDialog(true);
                            }
                          }}
                          loading={publishMutation.isPending}
                          className="min-h-[44px]"
                        >
                          {camion.is_public ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                          {camion.is_public ? "Dépublier" : "Publier"}
                        </Button>
                      ) : null}
                      {camion.is_public && camion.expires_at && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setProlongerCamion(camion);
                            setProlongerExpiresAt("");
                            setProlongerDialog(true);
                          }}
                          className="min-h-[44px]"
                        >
                          Prolonger
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteConfirm(camion.id)}
                        className="min-h-[44px]"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                      </Button>
                    </div>
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
            <Truck className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucun camion enregistré</p>
            <Button className="mt-4 w-full sm:w-auto min-h-[44px]" onClick={() => { reset(); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter votre premier camion
            </Button>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        capture="environment"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} title={editingCamion ? "Modifier le camion" : "Ajouter un camion"} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Immatriculation" placeholder="TG-1234-AB" error={errors.immatriculation?.message} {...register("immatriculation")} />
            <Input label="Marque" placeholder="Mercedes" error={errors.marque?.message} {...register("marque")} />
            <Input label="Modèle" placeholder="Actros 1845" error={errors.modele?.message} {...register("modele")} />
            <Input label="Année" type="number" placeholder="2020" error={errors.annee?.message} {...register("annee")} />
            <Select label="Type de camion" options={Object.entries(TYPE_CAMION).map(([v, l]) => ({ value: v, label: l }))} error={errors.type_camion?.message} {...register("type_camion")} />
            <Input label="Capacité (tonnes)" type="number" placeholder="20" error={errors.capacite_charge?.message} {...register("capacite_charge")} />
            <Select label="État" options={Object.entries(ETAT_CAMION).map(([v, l]) => ({ value: v, label: l }))} error={errors.etat?.message} {...register("etat")} />
            <Input label="Nombre d'essieux" type="number" placeholder="2-12" {...register("nb_essieux")} />
            {watchEtat && ["en_reparation", "use"].includes(watchEtat) && (
              <p className="text-amber-600 text-sm">Ce camion sera enregistré dans votre flotte personnelle mais ne pourra pas être publié.</p>
            )}
            {watchEtat && ["bon_etat", "excellent"].includes(watchEtat) && (
              <Input
                type="datetime-local"
                label="Date et heure d'échéance de publication"
                error={errors.expires_at?.message}
                min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
                {...register("expires_at")}
              />
            )}
            <Select label="Carburant" options={[{ value: "", label: "Sélectionner" }, { value: "diesel", label: "Diesel" }, { value: "essence", label: "Essence" }, { value: "gaz", label: "Gaz" }, { value: "electrique", label: "Électrique" }, { value: "hybride", label: "Hybride" }]} {...register("carburant")} />
            <Select label="Boîte de vitesses" options={[{ value: "", label: "Sélectionner" }, { value: "manuelle", label: "Manuelle" }, { value: "automatique", label: "Automatique" }]} {...register("boite_vitesse")} />
            <Input label="Kilométrage (km)" type="number" placeholder="50000" {...register("kilometrage")} />
            <Input label="Localisation" placeholder="Lomé, Togo" {...register("localisation")} />
          </div>
          <Textarea label="Description (optionnel)" placeholder="Informations supplémentaires..." rows={3} {...register("description")} />
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" type="button" onClick={closeDialog} className="w-full sm:w-auto min-h-[44px]">Annuler</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending} className="w-full sm:w-auto min-h-[44px]">
              {editingCamion ? "Mettre à jour" : "Ajouter"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmer la suppression" size="sm">
        <p className="text-gray-600 mb-4">Êtes-vous sûr de vouloir supprimer ce camion ? Cette action est irréversible.</p>
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="w-full sm:w-auto min-h-[44px]">Annuler</Button>
          <Button variant="destructive" loading={deleteMutation.isPending} onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)} className="w-full sm:w-auto min-h-[44px]">Supprimer</Button>
        </div>
      </Dialog>

      {/* Photo Gallery Dialog */}
      <Dialog open={!!viewPhotos} onClose={() => setViewPhotos(null)} title={`${viewPhotos?.marque} ${viewPhotos?.modele} — Photos`} size="lg">
        <div className="space-y-4">
          {viewPhotos?.photos && viewPhotos.photos.length > 0 ? (
            <>
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={resolvePhotoUrl(viewPhotos.photos[currentPhotoIndex]?.photo_url) || ""}
                  alt="Photo du camion"
                  className="w-full h-full object-contain"
                />
                {viewPhotos.photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentPhotoIndex((i) => (i > 0 ? i - 1 : viewPhotos.photos.length - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPhotoIndex((i) => (i < viewPhotos.photos.length - 1 ? i + 1 : 0))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="info">{currentPhotoIndex + 1}/{viewPhotos.photos.length}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {viewPhotos.photos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${idx === currentPhotoIndex ? "border-amber-500" : "border-transparent"}`}
                    onClick={() => setCurrentPhotoIndex(idx)}
                  >
                    <img src={resolvePhotoUrl(photo.photo_url) || ""} alt="" className="w-full h-full object-cover" />
                    {photo.est_principale && (
                      <div className="absolute top-1 left-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Supprimer cette photo ?")) {
                          deletePhotoMutation.mutate({ camionId: viewPhotos.id, photoId: photo.id });
                          if (currentPhotoIndex >= (viewPhotos.photos.length - 1) && currentPhotoIndex > 0) {
                            setCurrentPhotoIndex(currentPhotoIndex - 1);
                          }
                        }
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-600 rounded-full text-white min-h-[28px] min-w-[28px] flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const photo = viewPhotos.photos[currentPhotoIndex];
                    if (photo) setMainPhotoMutation.mutate({ camionId: viewPhotos.id, photoId: photo.id });
                  }}
                  disabled={!viewPhotos.photos[currentPhotoIndex]?.est_principale === false}
                >
                  <Star className="h-3.5 w-3.5 mr-1" />
                  Photo principale
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400 py-8">Aucune photo</p>
          )}
          <div className="flex justify-center">
            <Button onClick={() => { setPhotoCamionId(viewPhotos?.id || null); fileInputRef.current?.click(); }}>
              <Upload className="h-4 w-4 mr-2" />
              Ajouter une photo
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog open={publishDialog} onClose={() => setPublishDialog(false)} title={`Publier ${publishCamion?.marque} ${publishCamion?.modele}`} size="sm">
        <div className="space-y-4">
          <p className="text-gray-600">Choisissez la durée de publication :</p>
          <Input
            type="datetime-local"
            label="Durée de publication"
            value={publishExpiresAt}
            onChange={(e) => setPublishExpiresAt(e.target.value)}
            min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
          />
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setPublishDialog(false)} className="w-full sm:w-auto min-h-[44px]">Annuler</Button>
            <Button
              onClick={() => {
                if (publishCamion) {
                  const expiresAt = publishExpiresAt ? new Date(publishExpiresAt).toISOString() : undefined;
                  publishMutation.mutate({ camionId: publishCamion.id, expires_at: expiresAt });
                  setPublishDialog(false);
                  setPublishCamion(null);
                }
              }}
              loading={publishMutation.isPending}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Publier
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Prolonger Dialog */}
      <Dialog open={prolongerDialog} onClose={() => setProlongerDialog(false)} title={`Prolonger ${prolongerCamion?.marque} ${prolongerCamion?.modele}`} size="sm">
        <div className="space-y-4">
          <p className="text-gray-600">Choisissez la nouvelle date d'expiration :</p>
          <Input
            type="datetime-local"
            label="Nouvelle date d'expiration"
            value={prolongerExpiresAt}
            onChange={(e) => setProlongerExpiresAt(e.target.value)}
            min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
          />
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setProlongerDialog(false)} className="w-full sm:w-auto min-h-[44px]">Annuler</Button>
            <Button
              onClick={() => {
                if (prolongerCamion && prolongerExpiresAt) {
                  const expiresAt = new Date(prolongerExpiresAt).toISOString();
                  prolongerMutation.mutate({ camionId: prolongerCamion.id, expires_at: expiresAt });
                  setProlongerDialog(false);
                  setProlongerCamion(null);
                }
              }}
              disabled={!prolongerExpiresAt}
              loading={prolongerMutation.isPending}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Prolonger
            </Button>
          </div>
        </div>
      </Dialog>
    </PageAnimation>
  );
}
