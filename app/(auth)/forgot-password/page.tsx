"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { authService } from "@/services/auth.service";

const forgotSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    try {
      await authService.forgotPassword(data);
      sessionStorage.setItem("reset_email", data.email);
      setEmailSent(true);
      toast.success("Un code OTP a été envoyé à votre email");
      setTimeout(() => {
        router.push("/verify-otp");
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mot de passe oublié</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Entrez votre email pour recevoir un code de réinitialisation
        </p>
      </div>

      {emailSent ? (
        <div className="text-center py-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Code envoyé !</h2>
          <p className="text-sm text-slate-500">
            Un code de réinitialisation a été envoyé à votre email.<br/>
            Redirection vers la page de vérification...
          </p>
          <div className="mt-4">
            <div className="w-8 h-8 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin mx-auto" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              className={`w-full px-4 py-3.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
                errors.email ? "border-red-400" : "border-slate-200"
              }`}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>
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
              "Envoyer le code OTP"
            )}
          </button>
        </form>
      )}

      <div className="mt-5 sm:mt-6 text-center space-y-3">
        <Link
          href="/login"
          className="text-sm text-amber-600 hover:text-amber-800 font-medium"
        >
          Retour à la connexion
        </Link>
        <div>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-600 font-medium"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
