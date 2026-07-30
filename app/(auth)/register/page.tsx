"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/auth-provider";

const registerSchema = z
  .object({
    nom_complet: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Adresse email invalide"),
    telephone: z
      .string()
      .regex(/^\+228\d{8}$/, "Le numéro doit être au format +228XXXXXXXX"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirm_password: z.string(),
    role: z.enum(["chauffeur", "proprietaire", "mecanicien"], {
      message: "Veuillez sélectionner un rôle",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const ROLE_OPTIONS = [
  { value: "chauffeur" as const, label: "Chauffeur", desc: "Conduire & livrer" },
  { value: "proprietaire" as const, label: "Propriétaire", desc: "Gérer mes camions" },
  { value: "mecanicien" as const, label: "Mécanicien", desc: "Réparer & dépanner" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isAuthenticated, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      telephone: "+228",
    },
  });

  const watchedPassword = watch("password");
  const watchedConfirm = watch("confirm_password");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data);
    } catch (err: any) {
      toast.error(err.message || "Erreur d'inscription");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Créer un compte
        </h1>
        <p className="text-slate-500 text-sm">
          Rejoignez la communauté du transport routier au Togo
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Je suis... *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ROLE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="relative cursor-pointer"
              >
                <input
                  type="radio"
                  value={option.value}
                  className="peer sr-only"
                  {...register("role")}
                />
                <div className="flex flex-col items-center gap-1 p-3 border-2 border-slate-200 rounded-lg text-center hover:border-amber-300 transition-colors peer-checked:border-amber-600 peer-checked:bg-amber-50 min-h-[80px]">
                  <span className="text-xs font-bold text-slate-900">{option.label}</span>
                  <span className="text-[10px] text-slate-500 leading-tight">{option.desc}</span>
                </div>
              </label>
            ))}
          </div>
          {errors.role && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.role.message}
            </p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Nom complet
          </label>
          <input
            type="text"
            placeholder="Jean Dupont"
            className={`w-full px-4 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
              errors.nom_complet ? "border-red-400" : "border-slate-200"
            }`}
            {...register("nom_complet")}
          />
          {errors.nom_complet && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.nom_complet.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Adresse email
          </label>
          <input
            type="email"
            placeholder="votre@email.com"
            className={`w-full px-4 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
              errors.email ? "border-red-400" : "border-slate-200"
            }`}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Téléphone
          </label>
          <input
            type="tel"
            placeholder="+228 90 12 34 56"
            className={`w-full px-4 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
              errors.telephone ? "border-red-400" : "border-slate-200"
            }`}
            {...register("telephone")}
          />
          {errors.telephone && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.telephone.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full px-4 pr-12 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
                errors.password ? "border-red-400" : "border-slate-200"
              }`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">Minimum 8 caractères</p>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full px-4 pr-12 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
                errors.confirm_password
                  ? "border-red-400"
                  : watchedConfirm && watchedPassword === watchedConfirm
                  ? "border-green-400"
                  : "border-slate-200"
              }`}
              {...register("confirm_password")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {watchedConfirm && (
            <p className={`text-xs mt-1 font-medium ${
              watchedPassword === watchedConfirm ? "text-green-600" : "text-red-500"
            }`}>
              {watchedPassword === watchedConfirm
                ? "Les mots de passe correspondent"
                : "Les mots de passe ne correspondent pas"}
            </p>
          )}
          {errors.confirm_password && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.confirm_password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-900 text-white py-3.5 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] mt-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          ) : (
            "Créer mon compte"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-5 flex items-center gap-4">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium">OU</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-sm text-slate-500">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="text-amber-600 hover:text-amber-800 font-bold"
          >
            Se connecter
          </Link>
        </p>
      </div>

      {/* Back to Home */}
      <div className="mt-4 text-center">
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-slate-600 font-medium"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </motion.div>
  );
}
