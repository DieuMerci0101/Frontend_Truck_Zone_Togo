"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Upload,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/cn";

export interface DocumentZone {
  key: string;
  label: string;
  description?: string;
}

export interface ZoneDocumentStatus {
  statut?: string;
  commentaire_admin?: string | null;
  fichier_url?: string | null;
  created_at?: string | null;
}

export const UPLOAD_MAX_SIZE = 10 * 1024 * 1024; // 10 Mo
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"];
const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

/**
 * Valide un fichier côté client (format + taille).
 * Retourne le message d'erreur, ou null si le fichier est accepté.
 */
export function validateDocumentFile(file: File): string | null {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const mime = (file.type || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_MIME.includes(mime)) {
    return "Format non supporté. Veuillez importer une image JPG/PNG ou un fichier PDF.";
  }
  if (file.size > UPLOAD_MAX_SIZE) {
    return "Le fichier est trop lourd. La taille maximale autorisée est de 10 Mo.";
  }
  return null;
}

function getErrorMessage(err: unknown): string {
  const e = err as {
    response?: { status?: number; data?: { detail?: string } };
    message?: string;
  };
  if (e?.response?.status === 401) {
    return "Session expirée. Veuillez vous reconnecter.";
  }
  return e?.response?.data?.detail || e?.message || "Erreur lors de l'envoi du document";
}

const STATUS_META: Record<
  string,
  { label: string; variant: "success" | "destructive" | "warning" | "outline"; icon: React.ElementType }
> = {
  en_attente: { label: "En attente de validation", variant: "warning", icon: Clock },
  valide: { label: "Validé", variant: "success", icon: CheckCircle },
  rejete: { label: "Rejeté", variant: "destructive", icon: XCircle },
};

export function canUploadFor(status: ZoneDocumentStatus | undefined): boolean {
  return !status || status.statut === "rejete";
}

interface DocumentUploadProps {
  zones: DocumentZone[];
  getStatus: (key: string) => ZoneDocumentStatus | undefined;
  onUpload: (formData: FormData) => Promise<unknown>;
  onUploaded?: () => void;
  /** Si true (défaut), ajoute "type_document" au FormData. À false pour le justificatif mécanicien. */
  sendTypeField?: boolean;
  disabled?: boolean;
}

export function DocumentUpload({
  zones,
  getStatus,
  onUpload,
  onUploaded,
  sendTypeField = true,
  disabled = false,
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingZoneRef = useRef<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const handleZoneClick = (key: string) => {
    if (disabled || uploadingKey) return;
    pendingZoneRef.current = key;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const key = pendingZoneRef.current;
    e.target.value = "";
    if (!file || !key) return;

    const error = validateDocumentFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    const fd = new FormData();
    if (sendTypeField) fd.append("type_document", key);
    fd.append("file", file);

    setUploadingKey(key);
    try {
      await onUpload(fd);
      toast.success("Document envoyé pour validation");
      onUploaded?.();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingKey(null);
      pendingZoneRef.current = null;
    }
  };

  return (
    <div className="space-y-4">
      {zones.map((zone) => {
        const status = getStatus(zone.key);
        const meta = status ? STATUS_META[status.statut || ""] : undefined;
        const canUpload = canUploadFor(status);
        const isUploading = uploadingKey === zone.key;

        return (
          <div key={zone.key} className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-gray-900 text-sm">{zone.label}</p>
                  {meta ? (
                    <Badge variant={meta.variant}>
                      <meta.icon className="h-3 w-3 mr-1" />
                      {meta.label}
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <XCircle className="h-3 w-3 mr-1" />
                      Non soumis
                    </Badge>
                  )}
                </div>
                {zone.description && (
                  <p className="text-xs text-gray-500 mt-1">{zone.description}</p>
                )}
                {status?.statut === "rejete" && status.commentaire_admin && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    Motif : {status.commentaire_admin}
                  </p>
                )}
                {status?.statut === "en_attente" && (
                  <p className="text-xs text-amber-600 mt-1">
                    Document soumis, en attente de validation par l&apos;administrateur
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              {canUpload ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleZoneClick(zone.key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleZoneClick(zone.key);
                  }}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-colors min-h-[72px] flex flex-col items-center justify-center",
                    isUploading
                      ? "border-amber-500 bg-amber-50"
                      : "border-slate-300 hover:border-amber-500 hover:bg-amber-50/50"
                  )}
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-800">
                        {status?.statut === "rejete"
                          ? "Renvoyer le document"
                          : "Téléverser depuis l'appareil / la galerie"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        JPG, PNG ou PDF — max 10 Mo
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  Document {status?.statut === "valide" ? "validé" : "transmis"} — aucune action requise
                </div>
              )}
            </div>
          </div>
        );
      })}

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,image/*,application/pdf"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
