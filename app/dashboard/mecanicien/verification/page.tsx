"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/auth-provider";
import { mecanicienService } from "@/services/mecanicien.service";
import { authService } from "@/services/auth.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  setToken,
  setTokenCookie,
  setUserCookie,
  getUser,
} from "@/lib/auth";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import type { VerificationStatusMecanicien } from "@/types";
import { DocumentUpload, type DocumentZone } from "@/components/upload/document-upload";

const ZONES: DocumentZone[] = [
  {
    key: "justificatif",
    label: "Justificatif / Diplôme",
    description: "Attestation, diplôme ou certificat prouvant votre qualification de mécanicien",
  },
];

export default function MechanicVerificationPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: verification, isLoading, refetch } = useQuery({
    queryKey: ["mecanicien", "verification"],
    queryFn: () => mecanicienService.getVerification(),
    refetchInterval: 8000,
  });

  const status: VerificationStatusMecanicien = verification?.verification_status || "pending_upload";

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

  useEffect(() => {
    if (verification?.verification_status === "approved") {
      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
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

  const StatusBadge = ({ value }: { value: VerificationStatusMecanicien }) => {
    switch (value) {
      case "approved": return <Badge variant="success">Validé</Badge>;
      case "rejected": return <Badge variant="destructive">Rejeté</Badge>;
      case "pending_approval": return <Badge variant="warning">En attente de validation</Badge>;
      default: return <Badge variant="outline">Justificatif requis</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
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
          <h1 className="text-2xl font-bold text-gray-900">Vérification de votre compte mécanicien</h1>
          <p className="text-gray-500 mt-2">
            Pour accéder à l&apos;ensemble des fonctionnalités du tableau de bord, vous devez fournir un justificatif
            (attestation, diplôme ou certificat).
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Statut de votre justificatif
              <StatusBadge value={status} />
            </CardTitle>
            <CardDescription>
              Formats acceptés : PDF, JPG, PNG — Max 10 Mo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "pending_approval" && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-700">
                    Votre document a été soumis avec succès.
                  </p>
                  <p className="text-sm text-amber-700">
                    Votre compte est actuellement en attente de confirmation par l&apos;administrateur.
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Vous serez redirigé automatiquement dès validation.
                  </p>
                </div>
              </div>
            )}

            {status === "approved" && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-700">
                    Compte validé !
                  </p>
                  <p className="text-sm text-green-700">
                    Accès complet activé. Redirection en cours...
                  </p>
                </div>
              </div>
            )}

            {status === "rejected" && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Votre justificatif a été rejeté.
                  </p>
                  <p className="text-sm text-red-700">
                    Veuillez soumettre un nouveau document conforme (attestation, diplôme ou certificat).
                  </p>
                </div>
              </div>
            )}

            {(status === "pending_upload" || status === "rejected") && (
              <DocumentUpload
                zones={ZONES}
                getStatus={() => undefined}
                onUpload={(formData) => uploadMutation.mutateAsync(formData)}
                onUploaded={() => queryClient.invalidateQueries({ queryKey: ["mecanicien", "verification"] })}
                sendTypeField={false}
              />
            )}

            {status === "pending_approval" && verification?.proof_document_url && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-sm text-slate-700">Justificatif soumis</span>
                <Badge variant="outline">En attente</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => refetch()} className="min-h-[44px]">
            <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
          </Button>
          <Button variant="ghost" onClick={() => router.push("/dashboard/mecanicien")} className="min-h-[44px]">
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    </div>
  );
}
