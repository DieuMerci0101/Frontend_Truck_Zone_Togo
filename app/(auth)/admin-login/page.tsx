"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/auth-provider";

const adminLoginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin, isAuthenticated, isLoading, user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated && String(user?.role).toLowerCase() === "admin") {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, isLoading, user, router]);

  const onSubmit = async (data: AdminLoginForm) => {
    try {
      await adminLogin(data);
    } catch (err: any) {
      toast.error(err.message || "Erreur de connexion");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Espace Administrateur</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Connectez-vous pour gérer la plateforme
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Email administrateur
          </label>
          <input
            type="email"
            placeholder="admin@togotruckconnect.com"
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

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Mot de passe
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className={`w-full px-4 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
              errors.password ? "border-red-400" : "border-slate-200"
            }`}
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

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

      <div className="mt-5 sm:mt-6 text-center space-y-3">
        <Link
          href="/login"
          className="text-xs sm:text-sm text-amber-600 hover:text-amber-800 font-medium"
        >
          Retour à la connexion
        </Link>
        <p className="text-xs text-slate-400">
          Accès réservé aux administrateurs autorisés
        </p>
      </div>
    </motion.div>
  );
}
