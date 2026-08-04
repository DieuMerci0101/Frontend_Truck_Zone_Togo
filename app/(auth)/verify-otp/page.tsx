"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import BackButton from "@/components/ui/back-button";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "@/services/auth.service";
import { cn } from "@/lib/cn";

const otpSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  code: z
    .string()
    .length(6, "Le code doit contenir exactement 6 chiffres")
    .regex(/^\d+$/, "Le code ne doit contenir que des chiffres"),
});

type OtpForm = z.infer<typeof otpSchema>;

const OTP_LENGTH = 6;

export default function VerifyOtpPage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [resending, setResending] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
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

  useEffect(() => {
    setValue("code", digits.join(""), { shouldValidate: true });
  }, [digits, setValue]);

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }
    const last = cleaned.slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = last;
      return next;
    });
    // Avance automatique vers la case suivante.
    if (last && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  const resend = async () => {
    const email = getValues("email");
    if (!email) {
      toast.error("Veuillez renseigner votre email");
      return;
    }
    setResending(true);
    try {
      await authService.forgotPassword({ email });
      setDigits(Array(OTP_LENGTH).fill(""));
      toast.success("Un nouveau code OTP a été envoyé à votre email");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi du code");
    } finally {
      setResending(false);
    }
  };

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
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digits[i]}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                aria-label={`Chiffre ${i + 1}`}
                className={cn(
                  "w-11 h-12 sm:w-12 sm:h-14 bg-white border rounded-lg text-center text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors",
                  errors.code ? "border-red-400" : "border-slate-200"
                )}
              />
            ))}
          </div>
          {errors.code && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.code.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || digits.join("").length !== OTP_LENGTH}
          className="w-full bg-slate-900 text-white py-3.5 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          ) : (
            "Vérifier le code"
          )}
        </button>

        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="w-full inline-flex items-center justify-center gap-2 text-sm text-amber-600 hover:text-amber-800 font-medium py-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", resending && "animate-spin")} />
          {resending ? "Envoi en cours..." : "Renvoyer le code"}
        </button>
      </form>

      <div className="mt-3 sm:mt-4 text-center space-y-3">
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
