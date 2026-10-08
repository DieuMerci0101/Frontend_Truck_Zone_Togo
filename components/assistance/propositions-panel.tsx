"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Link from "next/link";
import { Check, MapPin, MessageCircle, Phone, User, X } from "lucide-react";

import { chauffeurService } from "@/services/chauffeur.service";
import { proprietaireService } from "@/services/proprietaire.service";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUT_PROPOSITION, STATUT_PROPOSITION_COURT } from "@/constants";
import type { Assistance, PropositionAssistance, StatutProposition } from "@/types";

type Proposer = "chauffeur" | "proprietaire";

const statutBadge: Record<StatutProposition, "warning" | "success" | "destructive"> = {
  en_attente: "warning",
  accepte: "success",
  refuse: "destructive",
};

interface PropositionsPanelProps {
  demande: Assistance;
  role: Proposer;
  /** Rafraîchit la liste des demandes du parent (après acceptation/rejet). */
  onRefresh?: () => void;
}

/**
 * Liste des mécaniciens ayant proposé leur assistance pour UNE demande.
 * Côté CHAUFFEUR (ou propriétaire) uniquement : chaque mécanicien peut être
 * accepté (sélectionné) ou rejeté. Une seule acceptation possible par demande.
 */
export function PropositionsPanel({ demande, role, onRefresh }: PropositionsPanelProps) {
  const queryClient = useQueryClient();

  const { data: propositions, isLoading } = useQuery({
    queryKey: ["propositions", demande.id],
    queryFn: () =>
      role === "chauffeur"
        ? chauffeurService.getPropositions(demande.id)
        : proprietaireService.getPropositions(demande.id),
    // Tant que le chauffeur n'a pas choisi, on surveille les nouvelles propositions.
    refetchInterval: demande.statut === "en_attente" ? 10000 : false,
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["propositions", demande.id] });
    queryClient.invalidateQueries({ queryKey: ["chauffeur", "mes-demandes"] });
    queryClient.invalidateQueries({ queryKey: ["proprietaire", "assistance"] });
    queryClient.invalidateQueries({ queryKey: ["mecanicien"] });
    onRefresh?.();
  };

  const accepterMutation = useMutation({
    mutationFn: (mecanicienId: string) =>
      role === "chauffeur"
        ? chauffeurService.accepterProposition(demande.id, mecanicienId)
        : proprietaireService.accepterProposition(demande.id, mecanicienId),
    onSuccess: () => {
      toast.success("Mécanicien sélectionné — les autres propositions ont été rejetées");
      refreshAll();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (err instanceof Error ? err.message : "");
      toast.error(msg || "Impossible de sélectionner ce mécanicien");
      refreshAll();
    },
  });

  const rejeterMutation = useMutation({
    mutationFn: (mecanicienId: string) =>
      role === "chauffeur"
        ? chauffeurService.rejeterProposition(demande.id, mecanicienId)
        : proprietaireService.rejeterProposition(demande.id, mecanicienId),
    onSuccess: () => {
      toast.success("Proposition rejetée");
      refreshAll();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (err instanceof Error ? err.message : "");
      toast.error(msg || "Impossible de rejeter cette proposition");
      refreshAll();
    },
  });

  const selectionne = demande.statut !== "en_attente";
  const items: PropositionAssistance[] = propositions ?? demande.propositions ?? [];
  const enAttente = items.filter((p) => p.statut === "en_attente").length;

  return (
    <div className="space-y-4">
      {/* ── Statut général de la demande ── */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Statut général
        </p>
        <p className="mt-1 text-sm font-semibold text-gray-900">
          {selectionne
            ? "MÉCANICIEN SÉLECTIONNÉ"
            : "EN ATTENTE DE SÉLECTION DU CHAUFFEUR"}
        </p>
        {!selectionne && (
          <p className="mt-1 text-xs text-gray-500">
            {enAttente === 0
              ? "Aucun mécanicien n'a encore proposé son assistance. La demande reste en attente."
              : `${enAttente} mécanicien${enAttente > 1 ? "s" : ""} en attente de votre choix.`}
          </p>
        )}
      </div>

      {/* ── Liste des mécaniciens intéressés ── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">
          Les mécaniciens proches de votre position ont été notifiés. Ils apparaîtront
          ici dès qu&apos;ils proposeront leur assistance.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border p-4 ${
                p.statut === "accepte"
                  ? "border-green-300 bg-green-50"
                  : p.statut === "refuse"
                    ? "border-gray-200 bg-gray-50 opacity-70"
                    : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <Avatar src={p.photo_profil} name={p.nom_complet} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{p.nom_complet}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {p.distance_km != null ? `${p.distance_km} km du lieu de la panne` : "Distance non calculable"}
                      </p>
                    </div>
                    <Badge variant={statutBadge[p.statut]} className="shrink-0 text-[10px]">
                      {STATUT_PROPOSITION_COURT[p.statut]}
                    </Badge>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(p.specialites ?? []).slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700"
                      >
                        {s}
                      </span>
                    ))}
                    {p.annees_experience > 0 && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        {p.annees_experience} ans d&apos;expérience
                      </span>
                    )}
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                      {p.tarification}
                    </span>
                  </div>

                  {/* Téléphone : uniquement après acceptation (respect des règles existantes). */}
                  {p.statut === "accepte" && p.telephone && (
                    <a
                      href={`tel:${p.telephone}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" /> {p.telephone}
                    </a>
                  )}

                  {/* ── Actions du chauffeur ── */}
                  {!selectionne && p.statut === "en_attente" && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 min-h-[40px] bg-green-600 hover:bg-green-700"
                        loading={accepterMutation.isPending}
                        onClick={() => accepterMutation.mutate(p.mecanicien_id)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Accepter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 min-h-[40px] text-red-600 border-red-200 hover:bg-red-50"
                        loading={rejeterMutation.isPending}
                        onClick={() => rejeterMutation.mutate(p.mecanicien_id)}
                      >
                        <X className="h-4 w-4 mr-1" /> Rejeter
                      </Button>
                    </div>
                  )}

                  {p.statut === "accepte" && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-green-700 flex items-center gap-1">
                        <User className="h-4 w-4" /> Mécanicien sélectionné
                      </p>
                      <Link
                        href="/dashboard/chat"
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Ouvrir la conversation
                      </Link>
                    </div>
                  )}

                  {p.statut === "refuse" && (
                    <p className="mt-2 text-xs text-gray-500">
                      Proposition non retenue par le chauffeur.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Légende des statuts */}
      <div className="rounded-lg border border-dashed border-gray-200 p-3 text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-600">Signification des statuts</p>
        {Object.entries(STATUT_PROPOSITION).map(([k, v]) => (
          <p key={k}>
            • {STATUT_PROPOSITION_COURT[k as keyof typeof STATUT_PROPOSITION_COURT]} — {v}
          </p>
        ))}
      </div>
    </div>
  );
}

export default PropositionsPanel;
