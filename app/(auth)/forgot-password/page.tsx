"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Truck, KeyRound } from "lucide-react";
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
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <KeyRound className="h-7 w-7 text-blue-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mot de passe oublié</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Entrez votre email pour recevoir un code de réinitialisation
        </p>
      </div>

      {emailSent ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Code envoyé !</h2>
          <p className="text-sm text-gray-500">
            Un code de réinitialisation a été envoyé à votre email.<br/>
            Redirection vers la page de vérification...
          </p>
          <div className="mt-4">
            <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse email</label>
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
              <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>
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
                <Mail className="h-5 w-5" />
                Envoyer le code OTP
              </>
            )}
          </button>
        </form>
      )}

      <div className="mt-5 sm:mt-6 text-center space-y-3">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
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
