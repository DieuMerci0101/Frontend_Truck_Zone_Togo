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
  Clock,
  ChevronRight,
  FileText,
  ArrowRight,
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

const BRAND = "#E59E00";

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
  const contentRef = useRef<HTMLDivElement>(null);
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

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

  // ── Dossier entièrement transmis : carte de résumé + récapitulatif ──
  if (allSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <Header roleLabel={roleLabel} onLogout={onLogout} isLoggingOut={isLoggingOut} />

          <Hero
            title={title}
            subtitle={subtitle}
            completed={steps.length}
            total={steps.length}
            onAction={scrollToContent}
            actionLabel="Voir mon dossier"
          />

          <div ref={contentRef} className="mt-8 scroll-mt-6">
            {/* Carte de résumé */}
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-white text-green-600 shadow-sm shrink-0">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Votre dossier a été transmis avec succès.
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Nos équipes procèdent à la vérification sous 24h à 48h.
                  </p>
                  <p className="text-xs text-slate-500 mt-3">
                    Vous recevrez un e-mail dès l&apos;activation de votre compte. Cette
                    page se met à jour automatiquement.
                  </p>
                </div>
              </div>
            </div>

            {/* Récapitulatif des documents transmis */}
            <h3 className="mt-8 mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Récapitulatif de vos documents
            </h3>
            <div className="space-y-4">
              {steps.map((step) =>
                step.docTypes
                  .filter((opt) => submittedTypes.has(opt.value))
                  .map((opt) => (
                    <StepSummaryCard
                      key={opt.value}
                      step={step}
                      docLabel={opt.label}
                      status={getDocStatus(opt.value)}
                    />
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Déroulé du wizard ──
  const step = steps[currentStep];
  const stepIndex = currentStep;
  const completedCount = steps.filter((_, i) => isStepComplete(i)).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Header roleLabel={roleLabel} onLogout={onLogout} isLoggingOut={isLoggingOut} />

        <Hero
          title={title}
          subtitle={subtitle}
          completed={completedCount}
          total={steps.length}
          onAction={scrollToContent}
          actionLabel="Commencer la vérification"
        />

        <div ref={contentRef} className="mt-8 scroll-mt-6">
          {/* Progression */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">
                Étape {stepIndex + 1} sur {steps.length}
              </span>
              <span className="text-sm font-semibold" style={{ color: BRAND }}>
                {progress}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden ring-1 ring-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: BRAND }}
              />
            </div>
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
                        ? "bg-green-50 border-green-200 text-green-700"
                        : complete
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : active
                        ? "bg-white border-amber-400 text-slate-900 shadow-sm"
                        : "bg-white border-slate-200 text-slate-400"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {i + 1}. {s.label}
                  </button>
                  {i < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-slate-300 mx-1" />
                  )}
                </li>
              );
            })}
          </ol>

          {/* Carte de l'étape active */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-5">
              <div className="p-2 rounded-xl bg-slate-100 shrink-0">
                <ShieldCheck className="h-5 w-5" style={{ color: BRAND }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {step.label}
                </h2>
                {step.description && (
                  <p className="text-sm text-slate-500 mt-1">{step.description}</p>
                )}
              </div>
            </div>

            {step.docTypes.length > 1 && (
              <label className="block mb-4">
                <span className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Type de document
                </span>
                <select
                  value={effectiveType(step)}
                  onChange={(e) => handleSelectType(step, e.target.value)}
                  disabled={uploading}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
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
              <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                Motif du rejet :{" "}
                {getDocStatus(effectiveType(step))?.commentaire_admin || "document non conforme"}.
                Veuillez soumettre un nouveau fichier.
              </p>
            )}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Formats acceptés : PDF, JPG, PNG — Max 10 Mo par fichier
          </p>
        </div>
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
    <header className="flex items-center justify-between gap-3">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm ring-1 ring-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo1.jpeg" alt="Togo Truck Connect" className="h-8 w-auto object-contain" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 leading-tight">Togo Truck Connect</p>
          <p className="text-[11px] font-semibold" style={{ color: BRAND }}>
            {roleLabel}
          </p>
        </div>
      </Link>
      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-500 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-colors min-h-[36px] disabled:opacity-50"
      >
        <LogOut className="h-3.5 w-3.5" />
        {isLoggingOut ? "Déconnexion…" : "Se déconnecter"}
      </button>
    </header>
  );
}

function Hero({
  title,
  subtitle,
  completed,
  total,
  onAction,
  actionLabel,
}: {
  title: string;
  subtitle?: string;
  completed: number;
  total: number;
  onAction: () => void;
  actionLabel: string;
}) {
  const progress = Math.round((completed / total) * 100);
  return (
    <section className="mt-6">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm grid md:grid-cols-2">
        {/* Visuel */}
        <div className="relative min-h-[220px] md:min-h-[300px] bg-slate-900 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/image 1.jpg"
            alt="Camion poids lourd en mission"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: BRAND }} />
            Sécurité et confiance vérifiées
          </div>
        </div>

        {/* Texte */}
        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700 self-start">
            <Clock className="h-3 w-3" />
            Vérification de votre compte
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mt-4 mb-3">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed mb-6 max-w-md">
            {subtitle}
          </p>
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white transition-colors w-full sm:w-auto min-h-[44px]"
            style={{ backgroundColor: BRAND }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#C98A00")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="mt-5 flex items-center gap-2">
            <div className="h-1.5 flex-1 max-w-[180px] rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: BRAND }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-600">
              {completed}/{total} documents
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status?: ZoneDocumentStatus }) {
  if (status?.statut === "valide") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Validé
      </span>
    );
  }
  if (status?.statut === "en_attente") {
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
          <Clock className="h-3.5 w-3.5" />
          Reçu
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
          <RefreshCw className="h-3.5 w-3.5" />
          En cours de révision
        </span>
      </span>
    );
  }
  if (status?.statut === "rejete") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
        <RefreshCw className="h-3.5 w-3.5" />
        Rejeté
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
      Non soumis
    </span>
  );
}

function StepSummaryCard({
  step,
  docLabel,
  status,
}: {
  step: KycStep;
  docLabel: string;
  status?: ZoneDocumentStatus;
}) {
  const Icon = STEP_ICONS[step.docTypes[0]?.value] || FileText;
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-slate-100 shrink-0">
          <Icon className="h-5 w-5" style={{ color: BRAND }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{step.label}</p>
              {docLabel !== step.label && (
                <p className="text-xs text-slate-500">{docLabel}</p>
              )}
            </div>
            <StatusBadge status={status} />
          </div>
          {status?.statut === "rejete" && (
            <p className="text-xs text-red-600 mt-2 font-medium">
              Motif : {status.commentaire_admin || "document non conforme"} — veuillez renvoyer
              le document.
            </p>
          )}
          {status?.statut === "en_attente" && (
            <p className="text-xs text-slate-500 mt-2">
              Document transmis, en attente de validation par l&apos;administrateur.
            </p>
          )}
        </div>
      </div>
    </div>
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
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
        {status.statut === "valide" ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
        ) : (
          <Clock className="h-5 w-5 text-blue-600 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900">
              {status.statut === "valide" ? "Document validé" : "Document transmis"}
            </p>
            <StatusBadge status={status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
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
        "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors min-h-[120px] flex flex-col items-center justify-center",
        uploading
          ? "border-amber-400 bg-amber-50"
          : "border-slate-300 hover:border-amber-400 hover:bg-amber-50/50"
      )}
    >
      {uploading ? (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <RefreshCw className="h-4 w-4 animate-spin" style={{ color: BRAND }} />
          Envoi en cours...
        </div>
      ) : (
        <>
          <UploadCloud className="h-8 w-8 mx-auto mb-2" style={{ color: BRAND }} />
          <p className="text-sm font-semibold text-slate-800">
            {label ? `Téléverser ${label.toLowerCase()}` : "Téléverser le document"}
          </p>
          <p className="text-xs text-slate-500 mt-1">JPG, PNG ou PDF — max 10 Mo</p>
        </>
      )}
    </div>
  );
}
