"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/auth-provider";
import { mecanicienService } from "@/services/mecanicien.service";
import { authService } from "@/services/auth.service";
import { KycWizard, type KycStep } from "@/components/upload/kyc-wizard";
import { setToken, setRefreshToken, getRefreshToken, setTokenCookie, setUserCookie, getUser } from "@/lib/auth";

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
        typeof window !== "undefined" ? getRefreshToken() : null;
      (async () => {
        try {
          if (refreshToken) {
            const data = await authService.refresh(refreshToken);
            setToken(data.access_token);
            setTokenCookie(data.access_token);
            setRefreshToken(data.refresh_token);
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white shadow-sm p-8 animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded-lg bg-slate-200" />
              <div className="h-3 w-1/3 rounded-lg bg-slate-100" />
            </div>
          </div>
          <div className="h-8 w-2/3 rounded-lg bg-slate-200 mb-4" />
          <div className="h-16 w-full rounded-2xl bg-slate-100" />
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
