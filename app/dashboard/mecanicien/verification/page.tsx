"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/auth-provider";
import { mecanicienService } from "@/services/mecanicien.service";
import { authService } from "@/services/auth.service";
import { KycWizard, type KycStep } from "@/components/upload/kyc-wizard";
import { setToken, setTokenCookie, setUserCookie, getUser } from "@/lib/auth";

const STEPS: KycStep[] = [
  {
    id: "justificatif",
    label: "Diplôme, attestation ou certificat",
    description:
      "Document attestant de vos compétences en mécanique (attestation, diplôme ou certificat)",
    docTypes: [{ value: "justificatif", label: "Diplôme / Attestation / Certificat" }],
    sendTypeField: false,
  },
];

export default function MechanicVerificationPage() {
  const router = useRouter();
  const { refreshUser, logout, isLoggingOut } = useAuth();
  const queryClient = useQueryClient();

  const { data: verification, isLoading } = useQuery({
    queryKey: ["mecanicien", "verification"],
    queryFn: () => mecanicienService.getVerification(),
    refetchInterval: 8000,
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => mecanicienService.uploadProof(formData),
    onError: (err: any) => {
      if (err?.response?.status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        return;
      }
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          "Erreur lors de l'upload du justificatif. Vérifiez le format (JPG, PNG, PDF) et la taille (max 10 Mo)."
      );
    },
  });

  // Redirection automatique dès validation par l'administrateur.
  useEffect(() => {
    if (verification?.verification_status === "approved") {
      const refreshToken =
        typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
      (async () => {
        try {
          if (refreshToken) {
            const data = await authService.refresh(refreshToken);
            setToken(data.access_token);
            setTokenCookie(data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);
            const storedUser = getUser();
            if (storedUser) {
              setUserCookie({ ...storedUser, role: storedUser.role });
            }
          }
          await refreshUser();
          toast.success("Compte validé ! Accès complet activé.");
          router.replace("/dashboard/mecanicien");
        } catch {
          router.replace("/dashboard/mecanicien");
        }
      })();
    }
  }, [verification?.verification_status, refreshUser, router]);

  const status = verification?.verification_status || "pending_upload";

  const getDocStatus = () => {
    if (!verification?.proof_document_url) return undefined;
    return {
      statut:
        status === "approved"
          ? ("valide" as const)
          : status === "rejected"
          ? ("rejete" as const)
          : ("en_attente" as const),
      commentaire_admin: null,
      fichier_url: verification.proof_document_url,
      created_at: null,
    };
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute bottom-0 -left-24 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-8 animate-pulse">
          <div className="h-8 w-2/3 rounded-lg bg-white/10 mb-4" />
          <div className="h-16 w-full rounded-2xl bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <KycWizard
      roleLabel="Mécanicien"
      title="Vérification de votre compte"
      subtitle="Fournissez un justificatif de votre qualification en mécanique pour accéder à l'ensemble du tableau de bord."
      steps={STEPS}
      getDocStatus={getDocStatus}
      onUpload={(fd) => uploadMutation.mutateAsync(fd)}
      onUploaded={() =>
        queryClient.invalidateQueries({ queryKey: ["mecanicien", "verification"] })
      }
      onLogout={logout}
      isLoggingOut={isLoggingOut}
    />
  );
}
