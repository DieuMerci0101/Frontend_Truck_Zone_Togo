"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    if (!isLoading && isAuthenticated && user?.role === "admin") {
      router.replace("/dashboard/admin");
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
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="h-8 w-8 sm:h-9 sm:w-9 text-white" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Espace Administrateur</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Connectez-vous pour gérer la plateforme
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <Input
          label="Email administrateur"
          type="email"
          icon={Mail}
          placeholder="admin@togotruckconnect.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Mot de passe"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button
          type="submit"
          className="w-full min-h-[44px]"
          size="lg"
          loading={isSubmitting}
        >
          Se connecter
        </Button>
      </form>

      <div className="mt-5 sm:mt-6 text-center space-y-3">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>
        <p className="text-xs text-gray-400">
          Accès réservé aux administrateurs autorisés
        </p>
      </div>
    </motion.div>
  );
}
