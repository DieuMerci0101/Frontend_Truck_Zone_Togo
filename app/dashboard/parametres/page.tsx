"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/auth-provider";
import { authService } from "@/services/auth.service";
import { profileService } from "@/services/profile.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getRoleLabel } from "@/lib/utils";
import { Settings, Shield, User, Eye, EyeOff, Camera, Save, Trash2 } from "lucide-react";

const profileSchema = z.object({
  nom_complet: z.string().min(2, "Le nom complet est requis"),
  telephone: z.string().min(8, "Le téléphone est requis"),
  date_naissance: z.string().optional(),
  lieu_naissance: z.string().optional(),
  adresse: z.string().optional(),
  bio: z.string().optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    old_password: z.string().min(1, "L'ancien mot de passe est requis"),
    new_password: z.string().min(6, "Minimum 6 caractères"),
    confirm_new_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_new_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_new_password"],
  });
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ParametresPage() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register: regProfile,
    handleSubmit: submitProfile,
    formState: { errors: profErr },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      nom_complet: user?.nom_complet || "",
      telephone: user?.telephone || "",
      date_naissance: user?.date_naissance || "",
      lieu_naissance: user?.lieu_naissance || "",
      adresse: user?.adresse || "",
      bio: user?.bio || "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  const profileMutation = useMutation({
    mutationFn: (data: ProfileFormValues) => profileService.updateProfile(data),
    onSuccess: async () => {
      await refreshUser();
      toast.success("Profil mis à jour avec succès");
    },
    onError: () => toast.error("Erreur lors de la mise à jour du profil"),
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

  const passwordMutation = useMutation({
    mutationFn: (data: { old_password: string; new_password: string }) =>
      authService.changePassword(data),
    onSuccess: () => {
      toast.success("Mot de passe modifié avec succès");
      reset();
    },
    onError: () => toast.error("Erreur lors de la modification du mot de passe"),
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

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Settings className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-500">Gérez votre compte et vos préférences</p>
        </div>
      </div>

      {/* ═══ PHOTO DE PROFIL ═══ */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
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
            <div className="text-center sm:text-left flex-1">
              <p className="text-lg font-semibold text-gray-900">{user?.nom_complet}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <Badge variant="info" className="mt-1">{user?.role ? getRoleLabel(user.role) : ""}</Badge>
              <p className="text-xs text-gray-400 mt-1">Cliquez sur la photo pour changer — JPG, PNG ou WebP, max 5 Mo</p>
            </div>
            {user?.photo_profil && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => deletePhotoMutation.mutate()}
                loading={deletePhotoMutation.isPending}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 min-h-[44px]"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ═══ INFORMATIONS PERSONNELLES ═══ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations personnelles
          </CardTitle>
          <CardDescription>Vos informations de base et coordonnées</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitProfile((d) => profileMutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nom complet"
                placeholder="Votre nom complet"
                error={profErr.nom_complet?.message}
                {...regProfile("nom_complet")}
              />
              <Input
                label="Téléphone"
                placeholder="+228 90 12 34 56"
                error={profErr.telephone?.message}
                {...regProfile("telephone")}
              />
              <Input
                label="Date de naissance"
                type="date"
                {...regProfile("date_naissance")}
              />
              <Input
                label="Lieu de naissance"
                placeholder="Ex: Lomé, Togo"
                {...regProfile("lieu_naissance")}
              />
            </div>
            <Input
              label="Adresse"
              placeholder="Votre adresse complète"
              {...regProfile("adresse")}
            />
            <Textarea
              label="Bio / Description"
              placeholder="Décrivez-vous en quelques lignes..."
              rows={3}
              {...regProfile("bio")}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                loading={profileMutation.isPending}
                className="w-full sm:w-auto min-h-[44px]"
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ═══ STATUT DU COMPTE ═══ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Statut du compte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-sm text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Rôle</label>
              <Badge variant="info">{user?.role ? getRoleLabel(user.role) : ""}</Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Statut</label>
              <Badge variant={user?.is_active ? "success" : "destructive"}>
                {user?.is_active ? "Actif" : "Inactif"}
              </Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Vérifié</label>
              <Badge variant={user?.is_verified ? "success" : "warning"}>
                {user?.is_verified ? "Vérifié" : "Non vérifié"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══ CHANGER MOT DE PASSE ═══ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Changer le mot de passe
          </CardTitle>
          <CardDescription>Assurez-vous d&apos;utiliser un mot de passe fort</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => passwordMutation.mutate({ old_password: d.old_password, new_password: d.new_password }))} className="space-y-4">
            <div className="relative">
              <Input label="Mot de passe actuel" type={showOld ? "text" : "password"} placeholder="••••••••" error={errors.old_password?.message} {...register("old_password")} />
              <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center">
                {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <Input label="Nouveau mot de passe" type={showNew ? "text" : "password"} placeholder="••••••••" error={errors.new_password?.message} {...register("new_password")} />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <Input label="Confirmer le nouveau mot de passe" type={showConfirm ? "text" : "password"} placeholder="••••••••" error={errors.confirm_new_password?.message} {...register("confirm_new_password")} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={passwordMutation.isPending} className="w-full sm:w-auto min-h-[44px]">
                Modifier le mot de passe
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
