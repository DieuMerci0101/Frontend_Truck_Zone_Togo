"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, Truck } from "lucide-react";
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
          <ShieldCheck className="h-7 w-7 text-blue-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Vérification du code</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Entrez le code à 6 chiffres envoyé à votre email
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input
            type="email"
            placeholder="votre@email.com"
            className={`w-full px-4 py-3.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm ${
              errors.email ? "border-red-400" : "border-gray-200"
            }`}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Code OTP</label>
          <input
            placeholder="000000"
            maxLength={6}
            className={`w-full px-4 py-3.5 bg-white border rounded-xl text-sm text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm ${
              errors.code ? "border-red-400" : "border-gray-200"
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
          className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 min-h-[44px]"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ShieldCheck className="h-5 w-5" />
              Vérifier le code
            </>
          )}
        </button>
      </form>

      <div className="mt-5 sm:mt-6 text-center space-y-3">
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la récupération
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
