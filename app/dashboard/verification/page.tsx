"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/auth-provider";
import { chauffeurService } from "@/services/chauffeur.service";
import { proprietaireService } from "@/services/proprietaire.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, CheckCircle, AlertCircle, FileText, RefreshCw } from "lucide-react";
import type { UserRole } from "@/types";
import { DocumentUpload, type DocumentZone } from "@/components/upload/document-upload";

const DOCS_BY_ROLE: Record<string, DocumentZone[]> = {
  chauffeur: [
    { key: "permis", label: "Permis de conduire", description: "Permis valide pour la catégorie C ou CE" },
    { key: "cni", label: "Pièce d'identité", description: "Carte nationale d'identité en cours de validité" },
    { key: "certificat", label: "Attestation de capacité", description: "Attestation de capacité professionnelle" },
    { key: "assurance", label: "Certificat médical", description: "Certificat d'aptitude médicale de conduite" },
  ],
  proprietaire: [
    { key: "cni", label: "Pièce d'identité", description: "Carte nationale d'identité en cours de validité" },
    { key: "certificat", label: "Carte grise / Registre de commerce", description: "Preuve d'immatriculation de votre entreprise ou véhicule" },
  ],
};

export default function VerificationPage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const role = user?.role as UserRole;
  const requiredDocs = DOCS_BY_ROLE[role] || [];
  const isChauffeur = role === "chauffeur";

  const service = isChauffeur ? chauffeurService : proprietaireService;

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: [isChauffeur ? "chauffeur" : "proprietaire", "documents"],
    queryFn: () => service.getDocuments(),
    refetchInterval: 10000,
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => service.uploadDocument(formData),
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || err.message || "Erreur lors de l'upload");
    },
  });

  const getDocStatus = (key: string) => {
    const d = documents?.find((doc) => doc.type_document === key);
    return d
      ? { statut: d.statut, commentaire_admin: d.commentaire_admin, fichier_url: d.fichier_url, created_at: d.created_at }
      : undefined;
  };

  const allValidated = requiredDocs.every((doc) => {
    const d = getDocStatus(doc.key);
    return d?.statut === "valide";
  });

  const anyRejected = requiredDocs.some((doc) => {
    const d = getDocStatus(doc.key);
    return d?.statut === "rejete";
  });

  useEffect(() => {
    if (allValidated) {
      refreshUser();
    }
  }, [allValidated, refreshUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <div className="inline-flex p-3 bg-amber-100 rounded-full mb-4">
            <Shield className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Vérification de votre compte</h1>
          <p className="text-gray-500 mt-2">
            Pour accéder à l&apos;ensemble des fonctionnalités, vous devez soumettre vos documents pour validation.
          </p>
        </div>

        {anyRejected && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">
                Un ou plusieurs documents ont été rejetés. Veuillez consulter le motif ci-dessous et soumettre de nouveaux fichiers.
              </p>
            </CardContent>
          </Card>
        )}

        {allValidated && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">
                Tous vos documents sont validés !
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents requis
            </CardTitle>
            <CardDescription>
              Formats acceptés : PDF, JPG, PNG — Max 10 Mo par fichier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DocumentUpload
              zones={requiredDocs}
              getStatus={getDocStatus}
              onUpload={(formData) => uploadMutation.mutateAsync(formData)}
              onUploaded={() =>
                queryClient.invalidateQueries({ queryKey: [isChauffeur ? "chauffeur" : "proprietaire", "documents"] })
              }
            />
          </CardContent>
        </Card>

        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => refetch()} className="min-h-[44px]">
            <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
          </Button>
        </div>
      </div>
    </div>
  );
}
