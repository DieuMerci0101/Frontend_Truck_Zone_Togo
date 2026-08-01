"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { proprietaireService } from "@/services/proprietaire.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { STATUT_DOCUMENT, TYPE_DOCUMENT } from "@/constants";
import { DocumentUpload, type DocumentZone } from "@/components/upload/document-upload";
import {
  FileText, CheckCircle, XCircle, Clock, Shield, Building,
} from "lucide-react";

const statusVariant: Record<string, "success" | "destructive" | "warning" | "info"> = {
  valide: "success",
  rejete: "destructive",
  en_attente: "warning",
};

const statusIcon: Record<string, React.ElementType> = {
  valide: CheckCircle,
  rejete: XCircle,
  en_attente: Clock,
};

const REQUIRED_DOCS: DocumentZone[] = [
  { key: "cni", label: "Pièce d'identité", description: "Carte nationale d'identité en cours de validité" },
  { key: "certificat", label: "Carte grise / Registre de commerce", description: "Preuve d'immatriculation de votre entreprise ou véhicule" },
];

export default function ProprietaireDocumentsPage() {
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ["proprietaire", "documents"],
    queryFn: () => proprietaireService.getDocuments(),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => proprietaireService.uploadDocument(formData),
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || err.message || "Erreur lors de l'envoi du document");
    },
  });

  const getDocStatus = (type: string) => {
    return documents?.find((d) => d.type_document === type);
  };

  const allValidated = REQUIRED_DOCS.every((doc) => {
    const existing = getDocStatus(doc.key);
    return existing && existing.statut === "valide";
  });

  const allSubmitted = REQUIRED_DOCS.every((doc) => {
    const existing = getDocStatus(doc.key);
    return !!existing;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg">
            <Building className="h-6 w-6 text-slate-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes documents</h1>
            <p className="text-gray-500">Gérez vos documents officiels</p>
          </div>
        </div>
      </div>

      {!allSubmitted && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Documents requis</p>
                <p className="text-xs text-amber-700 mt-1">
                  Pour accéder à toutes les fonctionnalités, veuillez soumettre vos 2 documents obligatoires. Un administrateur validera votre dossier.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {allSubmitted && !allValidated && (
        <Card className="border-amber-200 bg-amber-100/60">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Toutes vos pièces ont été transmises
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Votre compte est en cours d&apos;examen par l&apos;administration.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {allValidated && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm font-semibold text-green-800">
                Tous vos documents sont validés. Votre compte est vérifié !
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : (
        <DocumentUpload
          zones={REQUIRED_DOCS}
          getStatus={(key) => {
            const d = getDocStatus(key);
            return d
              ? { statut: d.statut, commentaire_admin: d.commentaire_admin, fichier_url: d.fichier_url, created_at: d.created_at }
              : undefined;
          }}
          onUpload={(formData) => uploadMutation.mutateAsync(formData)}
          onUploaded={() => queryClient.invalidateQueries({ queryKey: ["proprietaire", "documents"] })}
        />
      )}

      {documents && documents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Historique</h2>
          {documents.map((doc) => {
            const StatusIcon = statusIcon[doc.statut] || Clock;
            return (
              <Card key={doc.id}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                        <FileText className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">
                          {TYPE_DOCUMENT[doc.type_document as keyof typeof TYPE_DOCUMENT] || doc.type_document}
                        </p>
                        <p className="text-sm text-gray-500">
                          Ajouté le {formatDate(doc.created_at)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={statusVariant[doc.statut] || "info"}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {STATUT_DOCUMENT[doc.statut as keyof typeof STATUT_DOCUMENT] || doc.statut}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {documents && documents.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["proprietaire", "documents"] })} className="min-h-[44px]">
            <Clock className="h-4 w-4 mr-2" /> Actualiser
          </Button>
        </div>
      )}
    </div>
  );
}
