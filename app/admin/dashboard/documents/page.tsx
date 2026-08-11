"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminService, type AdminVerificationItem } from "@/services/admin.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { API_URL } from "@/constants";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/utils";
import {
  FileText,
  Check,
  X,
  ShieldCheck,
  ShieldX,
  Clock,
  ExternalLink,
  Download,
  FolderOpen,
  Truck,
  Building2,
  Wrench,
  Users,
} from "lucide-react";
import type { VerificationStatusUser } from "@/types";

type RoleTab = "tous" | "chauffeur" | "proprietaire" | "mecanicien";

const ROLE_TABS: { id: RoleTab; label: string; icon: React.ElementType }[] = [
  { id: "tous", label: "Tous", icon: Users },
  { id: "chauffeur", label: "Chauffeurs", icon: Truck },
  { id: "proprietaire", label: "Propriétaires de camions", icon: Building2 },
  { id: "mecanicien", label: "Mécaniciens", icon: Wrench },
];

const STATUT_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "en_attente", label: "En attente" },
  { value: "valide", label: "Validé" },
  { value: "rejete", label: "Rejeté" },
];

// "En attente" regroupe les dossiers incomplets (pending_upload) et
// les dossiers soumis en attente de décision (pending_approval).
const STATUT_TO_BACKEND: Record<string, string | undefined> = {
  "": undefined,
  en_attente: "pending_upload,pending_approval",
  valide: "approved",
  rejete: "rejected",
};

const DOC_LABELS: Record<string, string> = {
  permis: "Permis de conduire",
  cni: "Pièce d'identité (CNI)",
  passeport: "Passeport",
  certificat: "Attestation de capacité",
  assurance: "Certificat médical",
  casier: "Casier judiciaire",
  rccm: "Registre de commerce (RCCM)",
  patente: "Patente",
  diplome: "Diplôme",
  photo_identite: "Photo d'identité",
  justificatif: "Justificatif / Diplôme",
};

const ROLE_LABELS: Record<string, string> = {
  chauffeur: "Chauffeur",
  proprietaire: "Propriétaire de camions",
  mecanicien: "Mécanicien",
};

function statusBadge(status?: VerificationStatusUser) {
  switch (status) {
    case "approved":
      return <Badge variant="success"><ShieldCheck className="h-3 w-3 mr-1" />Validé</Badge>;
    case "rejected":
      return <Badge variant="destructive"><ShieldX className="h-3 w-3 mr-1" />Rejeté</Badge>;
    case "pending_approval":
      return <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
    default:
      return <Badge variant="outline">Dossier incomplet</Badge>;
  }
}

function resolveFileUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
  return url;
}

function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|webp|gif)$/i.test(url.split("?")[0]);
}

function DocThumb({ url, label }: { url: string | null; label: string }) {
  const resolved = resolveFileUrl(url);
  if (resolved && isImageUrl(resolved)) {
    return (
      <img
        src={resolved}
        alt={label}
        className="h-16 w-16 rounded-md object-cover border border-gray-200 bg-white"
      />
    );
  }
  return (
    <div className="h-16 w-16 rounded-md border border-gray-200 bg-white flex items-center justify-center">
      <FileText className="h-7 w-7 text-gray-400" />
    </div>
  );
}

function docBadge(role: string, statut?: string) {
  if (role === "mecanicien") {
    return statusBadge(statut as VerificationStatusUser);
  }
  const variant = statut === "valide" ? "success" : statut === "rejete" ? "destructive" : "warning";
  const label = statut === "valide" ? "Validé" : statut === "rejete" ? "Rejeté" : "En attente";
  return <Badge variant={variant} className="shrink-0 ml-2">{label}</Badge>;
}

export default function AdminDocumentsPage() {
  const queryClient = useQueryClient();
  const [roleTab, setRoleTab] = useState<RoleTab>("tous");
  const [filterStatut, setFilterStatut] = useState("");
  const [limit, setLimit] = useState(12);
  const [rejectItem, setRejectItem] = useState<AdminVerificationItem | null>(null);
  const [rejectMotif, setRejectMotif] = useState("");
  // État de chargement CIBLÉ par utilisateur + action : seul le bouton cliqué
  // affiche le spinner (les autres cartes restent actives).
  const [actionLoading, setActionLoading] = useState<{
    userId: string;
    action: "approve" | "reject";
  } | null>(null);

  const backendStatut = STATUT_TO_BACKEND[filterStatut];

  const { data: verifications, isLoading } = useQuery({
    queryKey: ["admin", "verifications", roleTab, filterStatut, limit],
    queryFn: () =>
      adminService.getVerifications({
        statut: backendStatut || undefined,
        role: roleTab === "tous" ? undefined : roleTab,
        skip: 0,
        limit,
      }),
  });

  const decideMutation = useMutation({
    mutationFn: ({ userId, statut, motif }: { userId: string; statut: "approved" | "rejected"; motif?: string }) =>
      adminService.decideVerification(userId, statut, motif),
    onMutate: (vars) => setActionLoading({ userId: vars.userId, action: vars.statut === "approved" ? "approve" : "reject" }),
    onSettled: () => setActionLoading(null),
    onSuccess: () => {
      toast.success("Décision enregistrée. Le dossier reste consultable dans l'historique.");
      queryClient.invalidateQueries({ queryKey: ["admin", "verifications"] });
      setRejectItem(null);
      setRejectMotif("");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erreur lors de la décision");
    },
  });

  const handleApprove = (item: AdminVerificationItem) => {
    decideMutation.mutate({ userId: item.user_id, statut: "approved" });
  };

  const handleReject = () => {
    if (!rejectItem || !rejectMotif.trim()) {
      toast.error("Veuillez saisir un motif de rejet");
      return;
    }
    decideMutation.mutate({ userId: rejectItem.user_id, statut: "rejected", motif: rejectMotif.trim() });
  };

  const canDecide = (status?: VerificationStatusUser) =>
    !status || status === "pending_upload" || status === "pending_approval" || status === "rejected";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg">
            <FolderOpen className="h-6 w-6 text-slate-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-500">
              Validez ou rejetez les dossiers des chauffeurs, propriétaires de camions et mécaniciens
            </p>
          </div>
        </div>
        <select
          value={filterStatut}
          onChange={(e) => {
            setFilterStatut(e.target.value);
            setLimit(12);
          }}
          className="w-full sm:w-auto rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        >
          {STATUT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Onglets par rôle */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrer par rôle">
        {ROLE_TABS.map((tab) => {
          const isActive = roleTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setRoleTab(tab.id);
                setLimit(12);
              }}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors border min-h-[44px]",
                isActive
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      ) : verifications && verifications.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
            {verifications.map((item) => {
              const decidable = canDecide(item.verification_status);
              const isApproving =
                actionLoading?.userId === item.user_id && actionLoading?.action === "approve";
              const isRejecting =
                actionLoading?.userId === item.user_id && actionLoading?.action === "reject";
              const isRowDisabled = actionLoading?.userId === item.user_id;
              return (
                <Card key={item.user_id} className="flex flex-col">
                  <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={item.photo_profil}
                        name={item.nom_complet || item.email || ""}
                        size="lg"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-900 text-base truncate">
                            {item.nom_complet || "Inconnu"}
                          </h3>
                          {statusBadge(item.verification_status)}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{item.email || "—"}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <Badge variant="info">
                            {ROLE_LABELS[item.role] || item.role}
                          </Badge>
                          {item.soumis_le && (
                            <span className="text-xs text-gray-500">
                              Soumis le {formatDate(item.soumis_le)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {decidable && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleApprove(item)}
                          loading={isApproving}
                          disabled={isRowDisabled && !isApproving}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Valider
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => {
                            setRejectItem(item);
                            setRejectMotif("");
                          }}
                          loading={isRejecting}
                          disabled={isRowDisabled && !isRejecting}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    )}

                    <div className="grid gap-2">
                      {(item.required_documents || []).map((type) => {
                        const docs = item.documents || [];
                        const doc = docs.find((d) => d.type_document === type);
                        const missing = (item.missing_documents || []).includes(type);
                        const fileUrl = doc?.fichier_url || null;
                        return (
                          <div
                            key={type}
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50"
                          >
                            <DocThumb url={fileUrl} label={DOC_LABELS[type] || type} />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm">
                                {DOC_LABELS[type] || type}
                              </p>
                              {missing && <p className="text-xs text-red-600">Non soumis</p>}
                              {doc?.statut === "rejete" && doc.commentaire_admin && (
                                <p className="text-xs text-red-600 truncate">
                                  Motif : {doc.commentaire_admin}
                                </p>
                              )}
                              {fileUrl && (
                                <div className="flex gap-2 mt-1">
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-amber-800"
                                  >
                                    <ExternalLink className="h-3 w-3" /> Voir
                                  </a>
                                  <a
                                    href={fileUrl}
                                    download
                                    className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-amber-800"
                                  >
                                    <Download className="h-3 w-3" /> Télécharger
                                  </a>
                                </div>
                              )}
                            </div>
                            {missing ? (
                              <Badge variant="destructive" className="shrink-0 ml-2">Manquant</Badge>
                            ) : (
                              docBadge(item.role, doc?.statut)
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {item.verification_status === "rejected" && item.verification_reject_motif && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                        <ShieldX className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">
                          <span className="font-semibold">Motif du rejet : </span>
                          {item.verification_reject_motif}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {verifications.length >= limit && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setLimit((l) => l + 12)} className="min-h-[44px]">
                Charger plus
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucun dossier trouvé</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!rejectItem} onClose={() => { setRejectItem(null); setRejectMotif(""); }} title="Rejeter le dossier">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Veuillez indiquer le motif du rejet. Un email sera envoyé à l&apos;utilisateur avec cette information.
          </p>
          <Textarea
            placeholder="Motif du rejet..."
            value={rejectMotif}
            onChange={(e) => setRejectMotif(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => { setRejectItem(null); setRejectMotif(""); }}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleReject} loading={decideMutation.isPending} disabled={!rejectMotif.trim()}>
              Confirmer le rejet
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
