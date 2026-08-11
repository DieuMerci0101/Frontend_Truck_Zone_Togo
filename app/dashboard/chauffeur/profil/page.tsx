"use client";

import { useState, useRef } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/auth-provider";
import { chauffeurService } from "@/services/chauffeur.service";
import { authService } from "@/services/auth.service";
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
import { getRoleLabel } from "@/lib/utils";
import { CATEGORIES_PERMIS, DISPONIBILITE_CHAUFFEUR, TYPE_TRANSPORT, ZONES_CIRCULATION } from "@/constants";
import { X, Plus, Save, User, Camera, Trash2, Shield, Eye, EyeOff, Settings, Mail } from "lucide-react";

const profileSchema = z.object({
  nom_complet: z.string().min(2, "Le nom complet est requis"),
  telephone: z.string().min(8, "Le téléphone est requis").regex(/^\+?[0-9\s]{8,20}$/, "Le format du téléphone est invalide. Exemple : +228 90 12 34 56"),
  date_naissance: z.string().optional(),
  lieu_naissance: z.string().optional(),
  adresse: z.string().optional(),
  numero_permis: z.string().min(1, "Le numéro de permis est requis"),
  categorie_permis: z.enum(["C", "CE", "D"]),
  annees_experience: z.coerce.number().min(0, "Minimum 0"),
  disponibilite: z.enum(["disponible", "en_mission", "indisponible"]).default("disponible"),
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

export default function ChauffeurProfilPage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [typesTransport, setTypesTransport] = useState<string[]>([]);
  const [zonesCirculation, setZonesCirculation] = useState<string[]>([]);
  const [newTransport, setNewTransport] = useState("");
  const [newZone, setNewZone] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["chauffeur", "profile"],
    queryFn: () => chauffeurService.getMyProfile(),
    retry: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileFormValues>,
    values: profile
      ? {
          nom_complet: user?.nom_complet || "",
          telephone: user?.telephone || "",
          date_naissance: user?.date_naissance || "",
          lieu_naissance: user?.lieu_naissance || "",
          adresse: user?.adresse || "",
          numero_permis: profile.numero_permis || "",
          categorie_permis: profile.categorie_permis || "C",
          annees_experience: profile.annees_experience || 0,
          disponibilite: profile.disponibilite || "disponible",
          bio: user?.bio || profile.bio || "",
        }
      : undefined,
  });

  const {
    register: regPwd,
    handleSubmit: submitPwd,
    reset: resetPwd,
    formState: { errors: pwdErr },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  const createMutation = useMutation({
    mutationFn: (data: any) => chauffeurService.createProfile(data),
    onSuccess: () => {
      toast.success("Profil créé avec succès");
      queryClient.invalidateQueries({ queryKey: ["chauffeur", "profile"] });
    },
    onError: () => toast.error("Erreur lors de la création du profil"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => chauffeurService.updateProfile(data),
    onSuccess: () => {
      toast.success("Profil mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["chauffeur", "profile"] });
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

  const passwordMutation = useMutation({
    mutationFn: (data: { old_password: string; new_password: string }) =>
      authService.changePassword(data),
    onSuccess: () => {
      toast.success("Mot de passe modifié avec succès");
      resetPwd();
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

  const onSubmit = (data: ProfileFormValues) => {
    const { nom_complet, telephone, date_naissance, lieu_naissance, adresse, bio, ...chauffeurData } = data;
    profileUpdateMutation.mutate({ nom_complet, telephone, date_naissance, lieu_naissance, adresse, bio });
    const payload = {
      ...chauffeurData,
      types_transport: typesTransport,
      zones_circulation: zonesCirculation,
    };
    if (profile) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const addTransport = () => {
    if (newTransport && !typesTransport.includes(newTransport)) {
      setTypesTransport([...typesTransport, newTransport]);
      setNewTransport("");
    }
  };
  const removeTransport = (val: string) => setTypesTransport(typesTransport.filter((t) => t !== val));
  const addZone = () => {
    if (newZone && !zonesCirculation.includes(newZone)) {
      setZonesCirculation([...zonesCirculation, newZone]);
      setNewZone("");
    }
  };
  const removeZone = (val: string) => setZonesCirculation(zonesCirculation.filter((z) => z !== val));

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card><CardContent className="p-4 sm:p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 rounded-lg">
          <User className="h-6 w-6 text-slate-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
          <p className="text-gray-500">Gérez toutes vos informations en un seul endroit</p>
        </div>
      </div>

      {/* Photo & Rôle */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar
                src={user?.photo_profil || null}
                name={user?.nom_complet || ""}
                size="lg"
                className="h-20 w-20 sm:h-24 sm:w-24 text-2xl"
                version={user?.photo_profil_version}
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
              <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1"><Mail className="h-3.5 w-3.5" />{user?.email}</p>
              <Badge variant="info" className="mt-1">{user?.role ? getRoleLabel(user.role) : ""}</Badge>
              <p className="text-xs text-gray-400 mt-1">Cliquez sur la photo pour changer — JPG, PNG ou WebP, max 5 Mo</p>
            </div>
            {user?.photo_profil && (
              <Button
                variant="outline" size="sm"
                onClick={() => deletePhotoMutation.mutate()}
                loading={deletePhotoMutation.isPending}
                className="text-red-600 border-red-200 hover:bg-red-50 min-h-[44px]"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Supprimer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statut du compte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Statut du compte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-sm text-gray-900 truncate">{user?.email}</p>
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

      {/* Formulaire informations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations personnelles
          </CardTitle>
          <CardDescription>Vos coordonnées et informations professionnelles</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nom complet" placeholder="Votre nom complet" error={errors.nom_complet?.message} {...register("nom_complet")} />
              <Input label="Téléphone" placeholder="+228 90 12 34 56" error={errors.telephone?.message} {...register("telephone")} />
              <Input label="Date de naissance" type="date" {...register("date_naissance")} />
              <Input label="Lieu de naissance" placeholder="Ex: Lomé, Togo" {...register("lieu_naissance")} />
            </div>
            <Input label="Adresse" placeholder="Votre adresse complète" {...register("adresse")} />

            <Separator />
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Profil chauffeur</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Numéro de permis" placeholder="Ex: TG-123456" error={errors.numero_permis?.message} {...register("numero_permis")} />
              <Select label="Catégorie de permis" error={errors.categorie_permis?.message} options={CATEGORIES_PERMIS.map((c) => ({ value: c, label: c }))} {...register("categorie_permis")} />
              <Input label="Années d'expérience" type="number" placeholder="0" error={errors.annees_experience?.message} {...register("annees_experience")} />
              <Select label="Disponibilité" error={errors.disponibilite?.message} options={Object.entries(DISPONIBILITE_CHAUFFEUR).map(([v, l]) => ({ value: v, label: l }))} {...register("disponibilite")} />
            </div>

            <Separator />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Types de transport</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {typesTransport.map((t) => (
                  <Badge key={t} variant="info" className="flex items-center gap-1">
                    {t}
                    <button type="button" onClick={() => removeTransport(t)} className="ml-1 hover:text-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select options={TYPE_TRANSPORT.filter((t) => !typesTransport.includes(t)).map((t) => ({ value: t, label: t }))} value={newTransport} onChange={(e) => setNewTransport(e.target.value)} placeholder="Sélectionner..." className="flex-1" />
                <Button type="button" variant="outline" size="sm" onClick={addTransport} disabled={!newTransport} className="min-h-[44px]"><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zones de circulation</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {zonesCirculation.map((z) => (
                  <Badge key={z} variant="success" className="flex items-center gap-1">
                    {z}
                    <button type="button" onClick={() => removeZone(z)} className="ml-1 hover:text-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select options={ZONES_CIRCULATION.filter((z) => !zonesCirculation.includes(z)).map((z) => ({ value: z, label: z }))} value={newZone} onChange={(e) => setNewZone(e.target.value)} placeholder="Sélectionner..." className="flex-1" />
                <Button type="button" variant="outline" size="sm" onClick={addZone} disabled={!newZone} className="min-h-[44px]"><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            <Separator />
            <Textarea label="Bio / Description" placeholder="Décrivez votre expérience et vos compétences..." rows={4} {...register("bio")} />

            <div className="flex justify-end">
              <Button type="submit" loading={createMutation.isPending || updateMutation.isPending || profileUpdateMutation.isPending} className="w-full sm:w-auto min-h-[44px]">
                <Save className="h-4 w-4 mr-2" /> Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Changer le mot de passe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Changer le mot de passe
          </CardTitle>
          <CardDescription>Assurez-vous d&apos;utiliser un mot de passe fort</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitPwd((d) => passwordMutation.mutate({ old_password: d.old_password, new_password: d.new_password }))} className="space-y-4 max-w-md" autoComplete="off">
            <div className="relative">
              <Input label="Mot de passe actuel" type={showOld ? "text" : "password"} placeholder="••••••••" error={pwdErr.old_password?.message} {...regPwd("old_password")} />
              <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center">
                {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <Input label="Nouveau mot de passe" type={showNew ? "text" : "password"} placeholder="••••••••" error={pwdErr.new_password?.message} {...regPwd("new_password")} />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <Input label="Confirmer le nouveau mot de passe" type={showConfirm ? "text" : "password"} placeholder="••••••••" error={pwdErr.confirm_new_password?.message} {...regPwd("confirm_new_password")} />
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