"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import BackButton from "@/components/ui/back-button";
import { Eye, EyeOff, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/auth-provider";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
    } catch (err: any) {
      toast.error(err.message || "Erreur de connexion");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Bonjour !
        </h1>
        <p className="text-slate-500">
          Connectez-vous pour accéder à votre espace
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Adresse email
          </label>
          <input
            type="email"
            placeholder="votre@email.com"
            className={`w-full px-4 py-3.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
              errors.email ? "border-red-400" : "border-slate-200"
            }`}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">
              Mot de passe
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-amber-600 hover:text-amber-800 font-medium"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full px-4 pr-12 py-3.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
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
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-900 text-white py-3.5 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          ) : (
            "Se connecter"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium">OU</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-sm text-slate-500">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="text-amber-600 hover:text-amber-800 font-bold"
          >
            Créer un compte gratuit
          </Link>
        </p>
      </div>

      {/* Admin Link */}
      <div className="mt-4">
        <Link
          href="/admin-login"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg border-2 border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors min-h-[44px]"
        >
          <Shield className="h-4 w-4 text-amber-600" />
          Espace administrateur
        </Link>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          Réservé à l&apos;administration de la plateforme
        </p>
      </div>

      {/* Back to Home */}
      <div className="mt-4 text-center">
        <BackButton
          fallback="/"
          label="Retour à l'accueil"
          className="text-xs text-slate-400 hover:text-slate-600 font-medium"
        />
      </div>
    </motion.div>
  );
}
