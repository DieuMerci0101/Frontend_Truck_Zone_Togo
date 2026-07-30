"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import BackButton from "@/components/ui/back-button";
import toast from "react-hot-toast";
import { authService } from "@/services/auth.service";

const otpSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  code: z
    .string()
    .length(6, "Le code doit contenir exactement 6 chiffres")
    .regex(/^\d+$/, "Le code ne doit contenir que des chiffres"),
});

type OtpForm = z.infer<typeof otpSchema>;

export default function VerifyOtpPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("reset_email");
    if (savedEmail) {
      setValue("email", savedEmail);
    }
  }, [setValue]);

  const onSubmit = async (data: OtpForm) => {
    try {
      await authService.verifyOtp(data);
      sessionStorage.setItem("reset_otp", data.code);
      toast.success("Code vérifié avec succès !");
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      toast.error(err.message || "Code incorrect");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Vérification du code</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Entrez le code à 6 chiffres envoyé à votre email
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
          <input
            type="email"
            readOnly
            tabIndex={-1}
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Code OTP</label>
          <input
            placeholder="000000"
            maxLength={6}
            className={`w-full px-4 py-3.5 bg-white border rounded-lg text-sm text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
              errors.code ? "border-red-400" : "border-slate-200"
            }`}
            {...register("code")}
          />
          {errors.code && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.code.message}</p>
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
            "Vérifier le code"
          )}
        </button>
      </form>

      <div className="mt-5 sm:mt-6 text-center space-y-3">
        <Link
          href="/forgot-password"
          className="text-sm text-amber-600 hover:text-amber-800 font-medium"
        >
          Retour à la récupération
        </Link>
        <div>
          <BackButton
            fallback="/"
            label="Retour à l'accueil"
            className="text-xs text-slate-400 hover:text-slate-600 font-medium"
          />
        </div>
      </div>
    </motion.div>
  );
}
