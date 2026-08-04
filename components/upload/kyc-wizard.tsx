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

// ── Fond immersif : photo transport + carte "smoky glass" ─────────────────
function Background() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* Photo du secteur transport (voile très sombre) */}
      <img
        src="/images/image 1.jpg"
        alt=""
        className="h-full w-full object-cover opacity-[0.16]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/80 to-slate-950" />

      {/* Carte routière stylisée (routes + nœuds) */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.28]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1200 800"
      >
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-50 150 C 180 120, 260 320, 500 300 S 880 260, 1250 330" stroke="#E59E00" strokeWidth="1.5" opacity="0.5" />
          <path d="M-50 320 C 220 290, 340 520, 620 490 S 980 460, 1250 520" stroke="#38bdf8" strokeWidth="1" opacity="0.35" />
          <path d="M150 -50 C 130 160, 420 260, 390 520 S 320 680, 350 850" stroke="#E59E00" strokeWidth="1" opacity="0.35" />
          <path d="M470 -50 C 450 180, 700 300, 680 540 S 640 700, 660 850" stroke="#38bdf8" strokeWidth="1.2" opacity="0.4" />
          <path d="M820 -50 C 800 140, 1040 260, 1010 480 S 960 680, 980 850" stroke="#E59E00" strokeWidth="1" opacity="0.3" />
          <path d="M-50 620 C 180 600, 300 760, 560 740 S 900 700, 1250 750" stroke="#38bdf8" strokeWidth="1" opacity="0.3" />
        </g>
        <g fill="#E59E00" opacity="0.6">
          <circle cx="500" cy="300" r="5" />
          <circle cx="620" cy="490" r="4" />
          <circle cx="390" cy="520" r="4" />
          <circle cx="680" cy="540" r="5" />
          <circle cx="1010" cy="480" r="4" />
        </g>
        <g fill="#38bdf8" opacity="0.5">
          <circle cx="560" cy="740" r="4" />
          <circle cx="660" cy="850" r="3.5" />
          <circle cx="350" cy="850" r="3.5" />
        </g>
      </svg>

      {/* Halos flous "smoky glass" */}
      <div className="absolute -top-40 -right-32 h-[480px] w-[480px] rounded-full bg-brand/20 blur-3xl" />
      <div className="absolute top-1/3 -left-40 h-[420px] w-[420px] rounded-full bg-sky-500/15 blur-3xl" />
      <div className="absolute -bottom-40 right-1/4 h-[420px] w-[420px] rounded-full bg-brand/15 blur-3xl" />
    </div>
  );
}

function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-2xl shadow-black/40",
        className
      )}
    >
      {children}
    </div>
  );
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
      <div className="relative min-h-screen bg-slate-950 text-white">
        <Background />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <Header roleLabel={roleLabel} onLogout={onLogout} isLoggingOut={isLoggingOut} />
            <GlassCard className="p-8 sm:p-10 text-center">
              <div className="relative inline-flex p-4 rounded-full bg-brand/15 border border-brand/30 mb-5">
                <PartyPopper className="h-10 w-10 text-brand" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Dossier soumis avec succès !
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                Votre compte est actuellement en attente de validation par
                l&apos;administrateur. Vous recevrez un e-mail dès l&apos;activation.
              </p>
              <div className="flex items-center justify-center gap-2 text-brand text-sm mb-8">
                <Clock className="h-4 w-4" />
                Statut : en attente de validation
              </div>
              <button
                type="button"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/15 bg-white/5 text-slate-100 hover:bg-white/10 transition-colors min-h-[44px] disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Déconnexion…" : "Se déconnecter"}
              </button>
            </GlassCard>
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
    <div className="relative min-h-screen bg-slate-950 text-white">
      <Background />
      <div className="relative z-10 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Header roleLabel={roleLabel} onLogout={onLogout} isLoggingOut={isLoggingOut} />

          {/* Progression */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">
                Étape {stepIndex + 1} sur {steps.length}
              </span>
              <span className="text-sm font-semibold text-brand">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden ring-1 ring-white/5">
              <div
                className="h-full rounded-full bg-brand shadow-[0_0_12px_rgba(229,158,0,0.7)] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* En-tête du wizard */}
          <div className="mb-6 text-center">
            <div className="inline-flex p-3 rounded-full bg-brand/15 border border-brand/30 mb-4">
              <ShieldCheck className="h-8 w-8 text-brand" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{title}</h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">{subtitle}</p>
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
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border backdrop-blur-md",
                      validated
                        ? "bg-green-500/10 border-green-400/30 text-green-400"
                        : complete
                        ? "bg-brand/10 border-brand/40 text-brand"
                        : active
                        ? "bg-white/10 border-brand/50 text-white shadow-[0_0_16px_rgba(229,158,0,0.25)]"
                        : "bg-white/[0.04] border-white/10 text-slate-400"
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
          <GlassCard className="p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-5">
              <div className="p-2 rounded-xl bg-white/10 ring-1 ring-white/10 shrink-0">
                <ShieldCheck className="h-5 w-5 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {step.label}
                </h2>
                {step.description && (
                  <p className="text-sm text-slate-300 mt-1">{step.description}</p>
                )}
              </div>
            </div>

            {step.docTypes.length > 1 && (
              <label className="block mb-4">
                <span className="block text-sm font-semibold text-slate-200 mb-1.5">
                  Type de document
                </span>
                <select
                  value={effectiveType(step)}
                  onChange={(e) => handleSelectType(step, e.target.value)}
                  disabled={uploading}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50"
                >
                  {step.docTypes.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900">
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
              <p className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                Motif du rejet :{" "}
                {getDocStatus(effectiveType(step))?.commentaire_admin || "document non conforme"}.
                Veuillez soumettre un nouveau fichier.
              </p>
            )}
          </GlassCard>

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
    <header className="flex items-center justify-between gap-3 mb-8">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-black/30 ring-1 ring-white/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo1.jpeg" alt="Togo Truck Connect" className="h-8 w-auto object-contain" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white leading-tight">Togo Truck Connect</p>
          <p className="text-[11px] text-brand">{roleLabel}</p>
        </div>
      </Link>
      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand/40 bg-brand/10 text-sm text-amber-100 hover:bg-brand/20 hover:border-brand transition-colors min-h-[40px] disabled:opacity-50"
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
          "flex items-center gap-3 rounded-2xl px-4 py-3 border text-sm backdrop-blur-md",
          status.statut === "valide"
            ? "bg-green-500/10 border-green-400/30 text-green-400"
            : "bg-brand/10 border-brand/40 text-brand"
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
        "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all min-h-[120px] flex flex-col items-center justify-center backdrop-blur-md",
        uploading
          ? "border-brand bg-brand/10"
          : "border-white/20 hover:border-brand hover:bg-brand/10"
      )}
    >
      {uploading ? (
        <div className="flex items-center gap-2 text-sm text-brand">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Envoi en cours...
        </div>
      ) : (
        <>
          <UploadCloud className="h-8 w-8 text-brand mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">
            {label ? `Téléverser ${label.toLowerCase()}` : "Téléverser le document"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            JPG, PNG ou PDF — max 10 Mo
          </p>
        </>
      )}
    </div>
  );
}
