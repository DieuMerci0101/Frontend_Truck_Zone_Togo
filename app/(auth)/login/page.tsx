"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Truck, Eye, EyeOff, ArrowLeft } from "lucide-react";
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
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">
            Togo Truck Connect
          </span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Bonjour !
        </h1>
        <p className="text-gray-500">
          Connectez-vous pour accéder à votre espace
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Adresse email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              placeholder="votre@email.com"
              className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm ${
                errors.email ? "border-red-400" : "border-gray-200"
              }`}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">
              Mot de passe
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full pl-12 pr-12 py-3.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm ${
                errors.password ? "border-red-400" : "border-gray-200"
              }`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
          className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 min-h-[44px]"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              Se connecter
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">OU</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-800 font-bold"
          >
            Créer un compte gratuit
          </Link>
        </p>
      </div>

      {/* Admin Link */}
      <div className="mt-4 text-center">
        <Link
          href="/admin-login"
          className="text-xs text-gray-400 hover:text-gray-600 font-medium inline-flex items-center gap-1"
        >
          <Lock className="h-3 w-3" />
          Espace administrateur
        </Link>
      </div>

      {/* Back to Home */}
      <div className="mt-4 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 font-medium"
        >
          <ArrowLeft className="h-3 w-3" />
          Retour à l&apos;accueil
        </Link>
      </div>
    </motion.div>
  );
}
