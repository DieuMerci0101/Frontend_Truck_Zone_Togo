"use client";

import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuth } from "@/providers/auth-provider";
import { chauffeurService } from "@/services/chauffeur.service";
import { proprietaireService } from "@/services/proprietaire.service";
import {
  KycWizard,
  type KycStep,
  type KycWizardProps,
} from "@/components/upload/kyc-wizard";
import { ROLES } from "@/constants";
import type { UserRole } from "@/types";

const STEPS_BY_ROLE: Record<string, KycStep[]> = {
  chauffeur: [
    {
      id: "permis",
      label: "Permis de conduire",
      description: "Permis valide pour la catégorie C ou CE",
      docTypes: [{ value: "permis", label: "Permis de conduire" }],
    },
    {
      id: "identite",
      label: "Pièce d'identité",
      description: "Carte nationale d'identité ou passeport en cours de validité",
      docTypes: [
        { value: "cni", label: "Carte Nationale d'Identité (CNI)" },
        { value: "passeport", label: "Passeport" },
      ],
    },
    {
      id: "casier",
      label: "Document professionnel complémentaire",
      description: "Casier judiciaire ou certificat professionnel",
      docTypes: [{ value: "casier", label: "Casier judiciaire / Certificat" }],
    },
    {
      id: "photo",
      label: "Photo d'identité",
      description: "Photo d'identité récente ou justificatif final",
      docTypes: [{ value: "photo_identite", label: "Photo d'identité" }],
    },
  ],
  proprietaire: [
    {
      id: "entreprise",
      label: "Preuve de l'entreprise",
      description: "Registre de commerce (RCCM) ou patente de votre entreprise",
      docTypes: [
        { value: "rccm", label: "Registre de commerce (RCCM)" },
        { value: "patente", label: "Patente" },
      ],
    },
    {
      id: "identite",
      label: "Pièce d'identité",
      description: "Carte nationale d'identité ou passeport en cours de validité",
      docTypes: [
        { value: "cni", label: "Carte Nationale d'Identité (CNI)" },
        { value: "passeport", label: "Passeport" },
      ],
    },
  ],
};

export default function VerificationPage() {
  const { user, refreshUser, logout, isLoggingOut } = useAuth();
  const queryClient = useQueryClient();

  const role = user?.role as UserRole;
  const steps = STEPS_BY_ROLE[role] || [];
  const isChauffeur = role === "chauffeur";

  const service = isChauffeur ? chauffeurService : proprietaireService;

  const { data: documents, isLoading } = useQuery({
    queryKey: [isChauffeur ? "chauffeur" : "proprietaire", "documents"],
    queryFn: () => service.getDocuments(),
    refetchInterval: 10000,
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => service.uploadDocument(formData),
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          "Erreur lors de l'envoi du document"
      );
    },
  });

  const getDocStatus: KycWizardProps["getDocStatus"] = (docType) => {
    const d = documents?.find((doc) => doc.type_document === docType);
    return d
      ? {
          statut: d.statut,
          commentaire_admin: d.commentaire_admin,
          fichier_url: d.fichier_url,
          created_at: d.created_at,
        }
      : undefined;
  };

  const allValidated = useMemo(
    () =>
      steps.every((step) =>
        step.docTypes.some((opt) => getDocStatus(opt.value)?.statut === "valide")
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [documents, steps]
  );

  useEffect(() => {
    if (allValidated) refreshUser();
  }, [allValidated, refreshUser]);

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute bottom-0 -left-24 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-8 animate-pulse">
          <div className="h-8 w-2/3 rounded-lg bg-white/10 mb-4" />
          <div className="h-16 w-full rounded-2xl bg-white/10 mb-3" />
          <div className="h-16 w-full rounded-2xl bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <KycWizard
      roleLabel={ROLES[role] || "Compte"}
      title="Vérification de votre compte"
      subtitle="Pour accéder à l'ensemble des fonctionnalités, soumettez les documents requis. Chaque document est examiné par un administrateur."
      steps={steps}
      getDocStatus={getDocStatus}
      onUpload={(fd) => uploadMutation.mutateAsync(fd)}
      onUploaded={() =>
        queryClient.invalidateQueries({
          queryKey: [isChauffeur ? "chauffeur" : "proprietaire", "documents"],
        })
      }
      onLogout={logout}
      isLoggingOut={isLoggingOut}
    />
  );
}
