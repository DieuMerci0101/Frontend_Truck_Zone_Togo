"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/auth-provider";
import { chauffeurService } from "@/services/chauffeur.service";
import { proprietaireService } from "@/services/proprietaire.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUT_DOCUMENT } from "@/constants";
import { Shield, Upload, CheckCircle, XCircle, Clock, FileText, RefreshCw, AlertCircle, Image, File } from "lucide-react";
import type { Document as DocType, UserRole } from "@/types";

const DOCS_BY_ROLE: Record<string, { key: string; label: string }[]> = {
  chauffeur: [
    { key: "permis", label: "Permis de conduire" },
    { key: "cni", label: "Carte Nationale d'Identité" },
    { key: "certificat", label: "Certificat médical" },
    { key: "assurance", label: "Attestation d'assurance" },
  ],
  proprietaire: [
    { key: "cni", label: "Carte Nationale d'Identité" },
    { key: "certificat", label: "Registre du commerce / Immatriculation" },
  ],
};

function FilePreview({ file }: { file: File }) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-amber-50 border border-amber-200">
      {preview ? (
        <img src={preview} alt="Aperçu" className="h-12 w-12 object-cover rounded border border-amber-200 shrink-0" />
      ) : (
        <div className="h-12 w-12 flex items-center justify-center rounded bg-amber-100 shrink-0">
          <File className="h-6 w-6 text-amber-600" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
        <p className="text-xs text-gray-500">
          {(file.size / (1024 * 1024)).toFixed(1)} Mo
        </p>
      </div>
    </div>
  );
}

export default function VerificationPage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ type: string; file: File } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    mutationFn: ({ type, file }: { type: string; file: File }) => {
      const fd = new FormData();
      fd.append("type_document", type);
      fd.append("file", file);
      return service.uploadDocument(fd);
    },
    onSuccess: () => {
      toast.success("Document envoyé pour validation");
      queryClient.invalidateQueries({ queryKey: [isChauffeur ? "chauffeur" : "proprietaire", "documents"] });
      setUploadingFor(null);
      setSelectedFile(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Erreur lors de l'upload");
      setUploadingFor(null);
      setSelectedFile(null);
    },
  });

  const handleFileSelect = (type: string) => {
    setUploadingFor(type);
    setSelectedFile(null);
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingFor) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 10 Mo");
      setUploadingFor(null);
      e.target.value = "";
      return;
    }
    setSelectedFile({ type: uploadingFor, file });
    uploadMutation.mutate({ type: uploadingFor, file });
    e.target.value = "";
  };

  const getDocStatus = (type: string): DocType | undefined => {
    return documents?.find((d) => d.type_document === type);
  };

  const allValidated = requiredDocs.every((doc) => {
    const d = getDocStatus(doc.key);
    return d?.statut === "valide";
  });

  const anyRejected = requiredDocs.some((doc) => {
    const d = getDocStatus(doc.key);
    return d?.statut === "rejete";
  });

  const statusIcon = (statut?: string) => {
    switch (statut) {
      case "valide": return <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />;
      case "rejete": return <XCircle className="h-5 w-5 text-red-500 shrink-0" />;
      default: return <Clock className="h-5 w-5 text-amber-500 shrink-0" />;
    }
  };

  const statusBadge = (statut?: string) => {
    switch (statut) {
      case "valide": return <Badge variant="success">Validé</Badge>;
      case "rejete": return <Badge variant="destructive">Rejeté</Badge>;
      case "en_attente": return <Badge variant="warning">En attente</Badge>;
      default: return <Badge variant="outline">Non soumis</Badge>;
    }
  };

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
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
              <p className="text-sm text-green-700">
                Tous vos documents sont validés ! Redirection en cours...
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
            {requiredDocs.map((doc) => {
              const existing = getDocStatus(doc.key);
              const canUpload = !existing || existing.statut === "rejete";
              return (
                <div
                  key={doc.key}
                  className="flex flex-col gap-3 p-4 rounded-lg border border-gray-200 bg-white"
                >
                  <div className="flex items-start gap-3">
                    {statusIcon(existing?.statut)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{doc.label}</p>
                      <p className="text-xs text-gray-500">
                        {existing?.fichier_url
                          ? `Soumis le ${new Date(existing.created_at).toLocaleDateString("fr-FR")}`
                          : "Non soumis"}
                      </p>
                      {existing?.commentaire_admin && existing.statut === "rejete" && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                          Motif : {existing.commentaire_admin}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {statusBadge(existing?.statut)}
                    </div>
                  </div>

                  {uploadingFor === doc.key && selectedFile && (
                    <FilePreview file={selectedFile.file} />
                  )}

                  {uploadMutation.isPending && uploadingFor === doc.key && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </div>
                  )}

                  {canUpload && (
                    <Button
                      variant={existing?.statut === "rejete" ? "destructive" : "outline"}
                      onClick={() => handleFileSelect(doc.key)}
                      loading={uploadMutation.isPending && uploadingFor === doc.key}
                      disabled={uploadMutation.isPending}
                      className="w-full min-h-[48px] text-sm sm:text-base"
                    >
                      <Upload className="h-5 w-5 mr-2 shrink-0" />
                      {existing?.statut === "rejete"
                        ? "Renvoyer le document"
                        : "Téléverser depuis l'appareil / la galerie"}
                    </Button>
                  )}

                  {existing?.statut === "en_attente" && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                      <Clock className="h-4 w-4 shrink-0" />
                      En attente de validation par l&apos;administrateur
                    </div>
                  )}

                  {existing?.statut === "valide" && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      Document validé
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => refetch()} className="min-h-[44px]">
            <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
          </Button>
        </div>
      </div>
    </div>
  );
}
