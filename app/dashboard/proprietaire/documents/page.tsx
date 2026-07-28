"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { chauffeurService } from "@/services/chauffeur.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { STATUT_DOCUMENT, TYPE_DOCUMENT } from "@/constants";
import { FileText, Upload, CheckCircle, XCircle, Clock, Shield } from "lucide-react";

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

const REQUIRED_DOCS = [
  { type: "cni", label: "Carte Nationale d'Identité", description: "Pièce d'identité officielle en cours de validité" },
  { type: "permis", label: "Permis de conduire", description: "Permis de conduire valide pour la catégorie C ou CE" },
  { type: "certificat", label: "Certificat médical", description: "Certificat d'aptitude médicale de conduite" },
  { type: "assurance", label: "Assurance véhicule", description: "Attestation d'assurance du véhicule" },
];

export default function ProprietaireDocumentsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedType, setSelectedType] = useState("permis");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: documents, isLoading } = useQuery({
    queryKey: ["proprietaire", "documents"],
    queryFn: () => chauffeurService.getDocuments(),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => chauffeurService.uploadDocument(formData),
    onSuccess: () => {
      toast.success("Document envoyé avec succès");
      queryClient.invalidateQueries({ queryKey: ["proprietaire", "documents"] });
      setUploadDialog(false);
      setSelectedFile(null);
      setSelectedType("permis");
    },
    onError: () => toast.error("Erreur lors de l'envoi du document"),
  });

  const handleUpload = () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("type_document", selectedType);
    uploadMutation.mutate(formData);
  };

  const getDocStatus = (type: string) => {
    return documents?.find((d) => d.type_document === type);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes documents</h1>
            <p className="text-gray-500">Gérez vos documents officiels</p>
          </div>
        </div>
        <Button onClick={() => setUploadDialog(true)} className="w-full sm:w-auto min-h-[44px]">
          <Upload className="h-4 w-4 mr-2" />
          Uploader un document
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {REQUIRED_DOCS.map((doc) => {
          const existing = getDocStatus(doc.type);
          const StatusIcon = existing ? (statusIcon[existing.statut] || Clock) : Clock;
          return (
            <Card key={doc.type} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{doc.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{doc.description}</p>
                  </div>
                </div>
                {existing ? (
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[existing.statut] || "info"}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {STATUT_DOCUMENT[existing.statut as keyof typeof STATUT_DOCUMENT] || existing.statut}
                    </Badge>
                    <span className="text-xs text-gray-400">{formatDate(existing.created_at)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Non soumis
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {documents && documents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Documents soumis</h2>
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
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={statusVariant[doc.statut] || "info"}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {STATUT_DOCUMENT[doc.statut as keyof typeof STATUT_DOCUMENT] || doc.statut}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={uploadDialog}
        onClose={() => { setUploadDialog(false); setSelectedFile(null); }}
        title="Uploader un document"
      >
        <div className="space-y-4 p-1">
          <Select
            label="Type de document"
            options={Object.entries(TYPE_DOCUMENT).map(([v, l]) => ({ value: v, label: l }))}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fichier</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 min-h-[44px]"
            />
            {selectedFile && (
              <p className="text-sm text-gray-500 mt-1 truncate">{selectedFile.name}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setUploadDialog(false)} className="w-full sm:w-auto min-h-[44px]">
              Annuler
            </Button>
            <Button onClick={handleUpload} loading={uploadMutation.isPending} disabled={!selectedFile} className="w-full sm:w-auto min-h-[44px]">
              <Upload className="h-4 w-4 mr-2" />
              Envoyer
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
