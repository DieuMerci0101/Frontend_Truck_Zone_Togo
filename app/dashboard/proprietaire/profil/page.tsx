"use client";

import { useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/auth-provider";
import { proprietaireService } from "@/services/proprietaire.service";
import { profileService } from "@/services/profile.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { TYPE_ACTIVITE } from "@/constants";
import { Save, Building, Camera } from "lucide-react";

const profileSchema = z.object({
  nom_complet: z.string().min(2, "Le nom complet est requis"),
  telephone: z.string().min(8, "Le téléphone est requis"),
  date_naissance: z.string().optional(),
  lieu_naissance: z.string().optional(),
  adresse_personnelle: z.string().optional(),
  nom_entreprise: z.string().min(1, "Le nom est requis"),
  type_activite: z.string().min(1, "Le type d'activité est requis"),
  adresse: z.string().min(1, "L'adresse est requise"),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProprietaireProfilPage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["proprietaire", "profile"],
    queryFn: () => proprietaireService.getMyProfile(),
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
          adresse_personnelle: user?.adresse || "",
          nom_entreprise: profile.nom_entreprise || "",
          type_activite: profile.type_activite || "",
          adresse: profile.adresse || "",
          bio: user?.bio || profile.bio || "",
        }
      : undefined,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => proprietaireService.createProfile(data),
    onSuccess: () => {
      toast.success("Profil créé avec succès");
      queryClient.invalidateQueries({ queryKey: ["proprietaire", "profile"] });
    },
    onError: () => toast.error("Erreur lors de la création du profil"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => proprietaireService.updateProfile(data),
    onSuccess: () => {
      toast.success("Profil mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["proprietaire", "profile"] });
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
    const { nom_complet, telephone, date_naissance, lieu_naissance, adresse_personnelle, ...proprietaireData } = data;
    profileUpdateMutation.mutate({ nom_complet, telephone, date_naissance, lieu_naissance, adresse: adresse_personnelle, bio: proprietaireData.bio });
    if (profile) {
      updateMutation.mutate(proprietaireData);
    } else {
      createMutation.mutate(proprietaireData);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {[1, 2, 3].map((i) => (
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
          <Building className="h-6 w-6 text-blue-600" />
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
          <CardDescription>Vos coordonnées et informations professionnelles</CardDescription>
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
              label="Adresse personnelle"
              placeholder="Votre adresse complète"
              {...register("adresse_personnelle")}
            />

            <Separator />

            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Entreprise</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nom de l'entreprise"
                placeholder="Mon entreprise SARL"
                error={errors.nom_entreprise?.message}
                {...register("nom_entreprise")}
              />
              <Select
                label="Type d'activité"
                options={Object.entries(TYPE_ACTIVITE).map(([v, l]) => ({
                  value: v,
                  label: l,
                }))}
                error={errors.type_activite?.message}
                {...register("type_activite")}
              />
            </div>

            <Input
              label="Adresse"
              placeholder="Lomé, Togo"
              error={errors.adresse?.message}
              {...register("adresse")}
            />

            <Textarea
              label="Bio / Description"
              placeholder="Décrivez votre entreprise..."
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
