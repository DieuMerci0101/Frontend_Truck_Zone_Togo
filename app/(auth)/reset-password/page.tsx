"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "@/services/auth.service";

const resetSchema = z
  .object({
    new_password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
      .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  });

type ResetForm = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const watchedPassword = watch("new_password");
  const watchedConfirm = watch("confirm_password");

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }
  }, [email, router]);

  const onSubmit = async (data: ResetForm) => {
    const otpCode = sessionStorage.getItem("reset_otp");
    if (!otpCode) {
      toast.error("Session expirée. Recommencez depuis le début.");
      router.push("/forgot-password");
      return;
    }

    try {
      await authService.resetPassword({
        email,
        code: otpCode,
        new_password: data.new_password,
      });
      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("reset_otp");
      toast.success("Mot de passe réinitialisé avec succès !");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Erreur de réinitialisation");
    }
  };

  if (!email) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Togo Truck Connect</span>
        </Link>
      </div>

      <div className="text-center mb-6 sm:mb-8">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-7 w-7 text-green-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Nouveau mot de passe</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Code vérifié ! Choisissez un nouveau mot de passe sécurisé
        </p>
        <p className="text-xs text-gray-400 mt-1">{email}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* New Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full pl-12 pr-12 py-3.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm ${
                errors.new_password ? "border-red-400" : "border-gray-200"
              }`}
              {...register("new_password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Minimum 8 caractères, 1 majuscule, 1 chiffre
          </p>
          {errors.new_password && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.new_password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full pl-12 pr-12 py-3.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm ${
                errors.confirm_password
                  ? "border-red-400"
                  : watchedConfirm && watchedPassword === watchedConfirm
                  ? "border-green-400"
                  : "border-gray-200"
              }`}
              {...register("confirm_password")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {watchedConfirm && (
            <p className={`text-xs mt-1 font-medium ${
              watchedPassword === watchedConfirm ? "text-green-600" : "text-red-500"
            }`}>
              {watchedPassword === watchedConfirm
                ? "✓ Les mots de passe correspondent"
                : "Les mots de passe ne correspondent pas"}
            </p>
          )}
          {errors.confirm_password && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.confirm_password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 min-h-[44px]"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle className="h-5 w-5" />
              Réinitialiser le mot de passe
            </>
          )}
        </button>
      </form>

      <div className="mt-5 sm:mt-6 text-center space-y-3">
        <Link
          href="/verify-otp"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la vérification
        </Link>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 font-medium"
          >
            <ArrowLeft className="h-3 w-3" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
