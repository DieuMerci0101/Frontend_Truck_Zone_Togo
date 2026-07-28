"use client";

import { useState, useRef } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/auth-provider";
import { mecanicienService } from "@/services/mecanicien.service";
import { profileService } from "@/services/profile.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import {
  TARIFICATION_MECANICIEN,
  DISPONIBILITE_MECANICIEN,
  SPECIALITES_MECANICIEN,
} from "@/constants";
import { X, Plus, Save, Wrench, Camera } from "lucide-react";

const profileSchema = z.object({
  nom_complet: z.string().min(2, "Le nom complet est requis"),
  telephone: z.string().min(8, "Le téléphone est requis"),
  date_naissance: z.string().optional(),
  lieu_naissance: z.string().optional(),
  adresse: z.string().optional(),
  annees_experience: z.coerce.number().min(0, "Minimum 0"),
  tarification: z.string().min(1, "Tarification requise"),
  disponibilite: z.string().default("disponible"),
  rayon_intervention: z.coerce.number().min(1, "Rayon requis"),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function MecanicienProfilPage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [specialites, setSpecialites] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newSpecialite, setNewSpecialite] = useState("");
  const [newCertification, setNewCertification] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["mecanicien", "profile"],
    queryFn: () => mecanicienService.getMyProfile(),
    retry: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileFormValues>,
    values: profile
      ? {
          nom_complet: user?.nom_complet || "",
          telephone: user?.telephone || "",
          date_naissance: user?.date_naissance || "",
          lieu_naissance: user?.lieu_naissance || "",
          adresse: user?.adresse || "",
          annees_experience: profile.annees_experience,
          tarification: profile.tarification,
          disponibilite: profile.disponibilite,
          rayon_intervention: profile.rayon_intervention,
          bio: user?.bio || profile.bio || "",
        }
      : undefined,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => mecanicienService.createProfile(data),
    onSuccess: () => {
      toast.success("Profil créé avec succès");
      queryClient.invalidateQueries({ queryKey: ["mecanicien", "profile"] });
    },
    onError: () => toast.error("Erreur lors de la création du profil"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => mecanicienService.updateProfile(data),
    onSuccess: () => {
      toast.success("Profil mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["mecanicien", "profile"] });
    },
    onError: () => toast.error("Erreur lors de la mise à jour du profil"),
  });

  const profileUpdateMutation = useMutation({
    mutationFn: (data: { nom_complet: string; telephone: string; date_naissance?: string; lieu_naissance?: string; adresse?: string; bio?: string }) =>
      profileService.updateProfile(data),
    onSuccess: async () => {
      await refreshUser();
      toast.success("Informations personnelles mises à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const photoMutation = useMutation({
    mutationFn: (file: File) => profileService.uploadPhoto(file),
    onSuccess: async () => {
      await refreshUser();
      toast.success("Photo de profil mise à jour");
    },
    onError: () => toast.error("Erreur lors de l'upload de la photo"),
  });

  const deletePhotoMutation = useMutation({
    mutationFn: () => profileService.deletePhoto(),
    onSuccess: async () => {
      await refreshUser();
      toast.success("Photo de profil supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 5 Mo");
      return;
    }
    photoMutation.mutate(file);
  };

  const onSubmit = (data: ProfileFormValues) => {
    const { nom_complet, telephone, date_naissance, lieu_naissance, adresse, ...mecanicienData } = data;
    profileUpdateMutation.mutate({ nom_complet, telephone, date_naissance, lieu_naissance, adresse, bio: mecanicienData.bio });
    const payload = { ...mecanicienData, specialites, certifications };
    if (profile) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const addSpecialite = () => {
    if (newSpecialite && !specialites.includes(newSpecialite)) {
      setSpecialites([...specialites, newSpecialite]);
      setNewSpecialite("");
    }
  };

  const addCertification = () => {
    if (newCertification && !certifications.includes(newCertification)) {
      setCertifications([...certifications, newCertification]);
      setNewCertification("");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Wrench className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
          <p className="text-gray-500">Gérez vos informations personnelles et professionnelles</p>
        </div>
      </div>

      {/* Photo de profil */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar
                src={user?.photo_profil || null}
                name={user?.nom_complet || ""}
                size="lg"
                className="h-20 w-20 sm:h-24 sm:w-24 text-2xl"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg font-semibold text-gray-900">{user?.nom_complet}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG ou WebP — max 5 Mo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire */}
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
          <CardDescription>Vos compétences et conditions d&apos;intervention</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nom complet"
                placeholder="Votre nom complet"
                error={errors.nom_complet?.message}
                {...register("nom_complet")}
              />
              <Input
                label="Téléphone"
                placeholder="+228 90 12 34 56"
                error={errors.telephone?.message}
                {...register("telephone")}
              />
              <Input
                label="Date de naissance"
                type="date"
                {...register("date_naissance")}
              />
              <Input
                label="Lieu de naissance"
                placeholder="Ex: Lomé, Togo"
                {...register("lieu_naissance")}
              />
            </div>
            <Input
              label="Adresse"
              placeholder="Votre adresse complète"
              {...register("adresse")}
            />

            <Separator />

            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Profil mécanicien</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Années d'expérience"
                type="number"
                placeholder="0"
                error={errors.annees_experience?.message}
                {...register("annees_experience")}
              />
              <Select
                label="Tarification"
                options={Object.entries(TARIFICATION_MECANICIEN).map(([v, l]) => ({
                  value: v,
                  label: l,
                }))}
                error={errors.tarification?.message}
                {...register("tarification")}
              />
              <Select
                label="Disponibilité"
                options={Object.entries(DISPONIBILITE_MECANICIEN).map(([v, l]) => ({
                  value: v,
                  label: l,
                }))}
                error={errors.disponibilite?.message}
                {...register("disponibilite")}
              />
              <Input
                label="Rayon d'intervention (km)"
                type="number"
                placeholder="50"
                error={errors.rayon_intervention?.message}
                {...register("rayon_intervention")}
              />
            </div>

            <Separator />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Spécialités</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {specialites.map((s) => (
                  <Badge key={s} variant="info" className="flex items-center gap-1">
                    {s}
                    <button
                      type="button"
                      onClick={() => setSpecialites(specialites.filter((x) => x !== s))}
                      className="ml-1 hover:text-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select
                  options={SPECIALITES_MECANICIEN.filter((s) => !specialites.includes(s)).map((s) => ({
                    value: s,
                    label: s,
                  }))}
                  value={newSpecialite}
                  onChange={(e) => setNewSpecialite(e.target.value)}
                  placeholder="Sélectionner..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpecialite}
                  disabled={!newSpecialite}
                  className="min-h-[44px]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {certifications.map((c) => (
                  <Badge key={c} variant="success" className="flex items-center gap-1">
                    {c}
                    <button
                      type="button"
                      onClick={() => setCertifications(certifications.filter((x) => x !== c))}
                      className="ml-1 hover:text-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Ajouter une certification..."
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCertification();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCertification}
                  disabled={!newCertification}
                  className="min-h-[44px]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <Textarea
              label="Bio / Description"
              placeholder="Décrivez votre expertise..."
              rows={4}
              {...register("bio")}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending || profileUpdateMutation.isPending}
                className="w-full sm:w-auto min-h-[44px]"
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
