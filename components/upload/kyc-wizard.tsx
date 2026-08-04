"use client";

import { useEffect, useMemo, useRef, useState, type ElementType } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { cn } from "@/lib/cn";
import {
  LogOut,
  ShieldCheck,
  UploadCloud,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  FileText,
  PartyPopper,
} from "lucide-react";
import {
  validateDocumentFile,
  type ZoneDocumentStatus,
} from "@/components/upload/document-upload";

export interface KycDocOption {
  value: string;
  label: string;
}

export interface KycStep {
  id: string;
  label: string;
  description?: string;
  /** Types de documents acceptés pour cette étape (menu déroulant si > 1). */
  docTypes: KycDocOption[];
  /** Type utilisé pour l'upload (par défaut le premier). */
  defaultType?: string;
  /** false pour le justificatif mécanicien (upload sans champ type_document). */
  sendTypeField?: boolean;
}

export interface KycWizardProps {
  roleLabel: string;
  title: string;
  subtitle?: string;
  steps: KycStep[];
  getDocStatus: (docType: string) => ZoneDocumentStatus | undefined;
  onUpload: (formData: FormData) => Promise<unknown>;
  onUploaded?: () => void;
  onLogout: () => void | Promise<void>;
  isLoggingOut?: boolean;
  loading?: boolean;
}

const STEP_ICONS: Record<string, ElementType> = {
  permis: FileText,
  cni: ShieldCheck,
  passeport: ShieldCheck,
  casier: FileText,
  rccm: FileText,
  patente: FileText,
  photo_identite: FileText,
  diplome: FileText,
  justificatif: FileText,
};

function getErrorMessage(err: unknown): string {
  const e = err as {
    response?: { status?: number; data?: { detail?: string } };
    message?: string;
  };
  if (e?.response?.status === 401) return "Session expirée. Veuillez vous reconnecter.";
  return e?.response?.data?.detail || e?.message || "Erreur lors de l'envoi du document";
}

export function KycWizard({
  roleLabel,
  title,
  subtitle,
  steps,
  getDocStatus,
  onUpload,
  onUploaded,
  onLogout,
  isLoggingOut,
  loading,
}: KycWizardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingType, setPendingType] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  // Un type est "soumis" dès qu'un document existe pour lui.
  const submittedTypes = useMemo(() => {
    const set = new Set<string>();
    for (const step of steps) {
      for (const opt of step.docTypes) {
        if (getDocStatus(opt.value)) set.add(opt.value);
      }
    }
    return set;
  }, [steps, getDocStatus]);

  const isStepComplete = (index: number) => {
    const step = steps[index];
    return step.docTypes.some((opt) => submittedTypes.has(opt.value));
  };

  const isStepValidated = (index: number) => {
    const step = steps[index];
    return step.docTypes.some((opt) => getDocStatus(opt.value)?.statut === "valide");
  };

  const allSubmitted = steps.every((_, i) => isStepComplete(i));

  // Position initiale : premier groupe incomplet, sinon tout soumis.
  useEffect(() => {
    const firstIncomplete = steps.findIndex((_, i) => !isStepComplete(i));
    if (firstIncomplete >= 0) setCurrentStep(firstIncomplete);
  }, [steps.length]);

  const handleSelectType = (step: KycStep, value: string) => {
    setSelectedTypes((prev) => ({ ...prev, [step.id]: value }));
  };

  const effectiveType = (step: KycStep) =>
    selectedTypes[step.id] || step.docTypes[0]?.value || "";

  const handleZoneClick = (step: KycStep) => {
    if (uploading) return;
    setPendingType(step.docTypes.length > 1 ? effectiveType(step) : step.docTypes[0]?.value || "");
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const type = pendingType;
    e.target.value = "";
    if (!file || !type) return;

    const validationError = validateDocumentFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const step = steps.find((s) => s.docTypes.some((o) => o.value === type));
    const fd = new FormData();
    if (step?.sendTypeField !== false) fd.append("type_document", type);
    fd.append("file", file);

    setUploading(true);
    try {
      await onUpload(fd);
      toast.success("Document envoyé pour validation");
      onUploaded?.();
      const stepIndex = steps.findIndex((s) => s.docTypes.some((o) => o.value === type));
      if (stepIndex >= 0 && stepIndex === currentStep) {
        setTimeout(() => {
          const next = steps.findIndex((_, i) => i > stepIndex && !isStepComplete(i));
          if (next >= 0) setCurrentStep(next);
        }, 600);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      setPendingType(null);
    }
  };

  // ── Écran de succès : tout le dossier a été soumis ──
  if (allSubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Header roleLabel={roleLabel} onLogout={onLogout} isLoggingOut={isLoggingOut} />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 text-center">
            <div className="inline-flex p-4 rounded-full bg-amber-500/10 mb-5">
              <PartyPopper className="h-10 w-10 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Dossier soumis avec succès !
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
              Votre compte est actuellement en attente de validation par
              l&apos;administrateur. Vous recevrez un e-mail dès l&apos;activation.
            </p>
            <div className="flex items-center justify-center gap-2 text-amber-400 text-sm mb-8">
              <Clock className="h-4 w-4" />
              Statut : en attente de validation
            </div>
            <button
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors min-h-[44px] disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Déconnexion…" : "Se déconnecter"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const step = steps[currentStep];
  const stepIndex = currentStep;
  const completedCount = steps.filter((_, i) => isStepComplete(i)).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="min-h-screen bg-slate-950 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Header roleLabel={roleLabel} onLogout={onLogout} isLoggingOut={isLoggingOut} />

        {/* Progression */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">
              Étape {stepIndex + 1} sur {steps.length}
            </span>
            <span className="text-sm font-semibold text-amber-400">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* En-tête du wizard */}
        <div className="mb-6 text-center">
          <div className="inline-flex p-3 rounded-full bg-amber-500/10 mb-4">
            <ShieldCheck className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">{subtitle}</p>
        </div>

        {/* Étapes (fil d'Ariane) */}
        <ol className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => {
            const complete = isStepComplete(i);
            const validated = isStepValidated(i);
            const active = i === stepIndex;
            const Icon = STEP_ICONS[s.docTypes[0]?.value] || FileText;
            return (
              <li key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => !uploading && setCurrentStep(i)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border",
                    validated
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : complete
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : active
                      ? "bg-slate-800 border-amber-500/50 text-white"
                      : "bg-slate-800/50 border-slate-700 text-slate-400"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {i + 1}. {s.label}
                </button>
                {i < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-slate-600 mx-1" />
                )}
              </li>
            );
          })}
        </ol>

        {/* Carte de l'étape active */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-5">
            <div className="p-2 rounded-lg bg-slate-800 shrink-0">
              <ShieldCheck className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {step.label}
              </h2>
              {step.description && (
                <p className="text-sm text-slate-400 mt-1">{step.description}</p>
              )}
            </div>
          </div>

          {step.docTypes.length > 1 && (
            <label className="block mb-4">
              <span className="block text-sm font-semibold text-slate-300 mb-1.5">
                Type de document
              </span>
              <select
                value={effectiveType(step)}
                onChange={(e) => handleSelectType(step, e.target.value)}
                disabled={uploading}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              >
                {step.docTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <UploadZone
            key={`${step.id}-${effectiveType(step)}`}
            status={getDocStatus(effectiveType(step))}
            uploading={uploading}
            onSelect={() => handleZoneClick(step)}
            label={step.docTypes.length > 1 ? undefined : step.label}
          />

          {getDocStatus(effectiveType(step))?.statut === "rejete" && (
            <p className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              Motif du rejet :{" "}
              {getDocStatus(effectiveType(step))?.commentaire_admin || "document non conforme"}.
              Veuillez soumettre un nouveau fichier.
            </p>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Formats acceptés : PDF, JPG, PNG — Max 10 Mo par fichier
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,image/*,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

function Header({
  roleLabel,
  onLogout,
  isLoggingOut,
}: {
  roleLabel: string;
  onLogout: () => void | Promise<void>;
  isLoggingOut?: boolean;
}) {
  return (
    <header className="flex items-center justify-between gap-3 mb-8">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo1.jpeg" alt="Togo Truck Connect" className="h-8 w-auto object-contain" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white leading-tight">Togo Truck Connect</p>
          <p className="text-[11px] text-amber-400">{roleLabel}</p>
        </div>
      </Link>
      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors min-h-[40px] disabled:opacity-50"
      >
        <LogOut className="h-4 w-4" />
        {isLoggingOut ? "Déconnexion…" : "Se déconnecter"}
      </button>
    </header>
  );
}

function UploadZone({
  status,
  uploading,
  onSelect,
  label,
}: {
  status?: ZoneDocumentStatus;
  uploading: boolean;
  onSelect: () => void;
  label?: string;
}) {
  if (status?.statut === "en_attente" || status?.statut === "valide") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-3 border text-sm",
          status.statut === "valide"
            ? "bg-green-500/10 border-green-500/30 text-green-400"
            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
        )}
      >
        {status.statut === "valide" ? (
          <CheckCircle2 className="h-5 w-5 shrink-0" />
        ) : (
          <Clock className="h-5 w-5 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="font-semibold">
            {status.statut === "valide" ? "Document validé" : "Document soumis"}
          </p>
          <p className="text-xs opacity-80">
            {status.statut === "valide"
              ? "Aucune action requise."
              : "En attente de validation par l'administrateur."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      className={cn(
        "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors min-h-[120px] flex flex-col items-center justify-center",
        uploading
          ? "border-amber-500 bg-amber-500/5"
          : "border-slate-700 hover:border-amber-500 hover:bg-amber-500/5"
      )}
    >
      {uploading ? (
        <div className="flex items-center gap-2 text-sm text-amber-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Envoi en cours...
        </div>
      ) : (
        <>
          <UploadCloud className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">
            {label ? `Téléverser ${label.toLowerCase()}` : "Téléverser le document"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            JPG, PNG ou PDF — max 10 Mo
          </p>
        </>
      )}
    </div>
  );
}
