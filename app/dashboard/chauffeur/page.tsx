"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { dashboardService } from "@/services/dashboard.service";
import { chauffeurService } from "@/services/chauffeur.service";
import { incidentService } from "@/services/incident.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Briefcase,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  Truck,
  Wrench,
  Circle,
  Clock,
  CheckCircle2,
  Bell,
  Inbox,
  Send,
  ShieldCheck,
} from "lucide-react";
import type { DisponibiliteChauffeur } from "@/types";

const statusConfig: Record<
  DisponibiliteChauffeur,
  { label: string; color: string; bg: string; description: string }
> = {
  disponible: {
    label: "Disponible",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    description: "Visible par les propriétaires dans les recherches",
  },
  en_mission: {
    label: "En mission",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    description: "En cours de mission actuelle",
  },
  indisponible: {
    label: "Indisponible",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    description: "Non visible par les propriétaires",
  },
};

const candidatureLabel: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  acceptee: { label: "Candidature acceptée", icon: CheckCircle2, className: "text-emerald-600 bg-emerald-50" },
  refusee: { label: "Candidature non retenue", icon: AlertTriangle, className: "text-red-600 bg-red-50" },
  en_attente: { label: "Candidature en attente", icon: Clock, className: "text-amber-600 bg-amber-50" },
};

export default function ChauffeurDashboard() {
  const { user } = useAuth();
  const [showAllResponses, setShowAllResponses] = useState(false);

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => dashboardService.getOverview(),
    retry: false,
    refetchInterval: 15000,
  });

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["chauffeur", "profile"],
    queryFn: () => chauffeurService.getMyProfile(),
    retry: false,
    refetchInterval: 15000,
  });

  const { data: documents, isLoading: loadingDocs } = useQuery({
    queryKey: ["chauffeur", "documents"],
    queryFn: () => chauffeurService.getDocuments(),
  });

  const { data: incidents, isLoading: loadingIncidents } = useQuery({
    queryKey: ["chauffeur", "incidents"],
    queryFn: () => incidentService.list({ limit: 50 }),
  });

  const currentStatus = profile?.disponibilite || "disponible";
  const statusInfo = statusConfig[currentStatus];
  const verifPending =
    !overview?.is_verified &&
    (overview?.statut_verification === "pending_upload" ||
      overview?.statut_verification === "pending_approval");

  const statCards = [
    {
      title: "Notifications non lues",
      value: loadingOverview ? null : overview?.notifications_non_lues ?? 0,
      icon: Bell,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/dashboard/parametres/notifications",
      alert: (overview?.notifications_non_lues ?? 0) > 0,
    },
    {
      title: "Nouveaux messages",
      value: loadingOverview ? null : overview?.messages_non_lus ?? 0,
      icon: Inbox,
      color: "text-slate-700",
      bg: "bg-slate-100",
      href: "/dashboard/chat",
      alert: (overview?.messages_non_lus ?? 0) > 0,
    },
    {
      title: "Candidatures en attente",
      value: loadingOverview ? null : overview?.candidatures_en_attente ?? 0,
      icon: Send,
      color: "text-slate-700",
      bg: "bg-slate-50",
      href: "/dashboard/chauffeur/offres",
      alert: (overview?.candidatures_en_attente ?? 0) > 0,
    },
    {
      title: "Interventions en cours",
      value: loadingOverview ? null : overview?.interventions_actives ?? 0,
      icon: Wrench,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/dashboard/chauffeur/assistance",
      alert: (overview?.interventions_actives ?? 0) > 0,
    },
  ];

  const reponses = overview?.dernieres_reponses_candidatures ?? [];
  const reponsesShown = showAllResponses ? reponses : reponses.slice(0, 3);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.nom_complet?.split(" ")[0] || "Chauffeur"}
          </h1>
          <p className="text-gray-500 mt-1">Voici ce qui vous attend aujourd&apos;hui</p>
        </div>
        <Link href="/dashboard/chauffeur/offres" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto min-h-[44px]">
            <Briefcase className="h-4 w-4 mr-2" />
            Voir les offres
          </Button>
        </Link>
      </div>

      {/* Vérification du compte */}
      {verifPending && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <p className="text-sm text-amber-900 flex-1">
            Votre compte est en attente de vérification. Une fois approuvé, vous
            pourrez postuler et être visible par les propriétaires.
          </p>
          <Link href="/dashboard/verification" className="shrink-0">
            <Button variant="secondary" size="sm" className="w-full sm:w-auto min-h-[40px]">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Vérifier mon compte
            </Button>
          </Link>
        </div>
      )}

      {/* Statut de disponibilité */}
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <span
          className={`h-2.5 w-2.5 rounded-full shrink-0 ${
            currentStatus === "disponible"
              ? "bg-emerald-500"
              : currentStatus === "en_mission"
              ? "bg-red-500"
              : "bg-slate-400"
          }`}
        />
        <p className="text-sm text-amber-900">
          Statut : <strong>{statusInfo.label}</strong> —{" "}
          {statusInfo.description}. Changez-le à tout moment depuis l&apos;icône
          de disponibilité dans la barre supérieure.
        </p>
      </div>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statCards.map((card) => (
          <Link key={card.title} href={card.href} className="block">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">{card.title}</p>
                    {card.value === null ? (
                      <Skeleton className="h-6 sm:h-7 w-10 mt-1" />
                    ) : (
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{card.value}</p>
                    )}
                  </div>
                  <div className={`p-2 sm:p-2.5 rounded-xl ${card.bg}`}>
                    <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
                  </div>
                </div>
                {card.alert && (
                  <p className="text-[11px] mt-2 text-amber-700 font-medium">
                    À traiter dès maintenant
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Réponses aux candidatures */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Mes candidatures</CardTitle>
            <Link
              href="/dashboard/chauffeur/offres"
              className="text-sm text-amber-600 font-medium hover:underline"
            >
              Voir les offres
            </Link>
          </CardHeader>
          <CardContent>
            {reponses.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune réponse pour l&apos;instant</p>
                <p className="text-xs mt-1">Vos candidatures et leurs réponses apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reponsesShown.map((c) => {
                  const cfg = candidatureLabel[c.statut] || candidatureLabel.en_attente;
                  return (
                    <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <span className={`p-2 rounded-xl shrink-0 ${cfg.className}`}>
                        <cfg.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{cfg.label}</p>
                        <p className="text-xs text-gray-500 truncate">
                          Offre : {c.offre_titre || "—"}
                        </p>
                      </div>
                      <Link
                        href="/dashboard/chat"
                        className="text-amber-600 hover:underline text-xs shrink-0 flex items-center gap-1"
                      >
                        Discuter <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  );
                })}
                {reponses.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-slate-600"
                    onClick={() => setShowAllResponses((v) => !v)}
                  >
                    {showAllResponses ? "Réduire" : `Afficher tout (${reponses.length})`}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incidents && incidents.length > 0 ? (
                incidents.slice(0, 3).map((inc) => (
                  <div key={inc.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{inc.type_incident}</p>
                      <p className="text-xs text-gray-500">{inc.description.slice(0, 60)}...</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Truck className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune activité récente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              href: "/dashboard/chauffeur/offres",
              icon: Briefcase,
              label: "Voir les offres disponibles",
              bg: "bg-slate-50 hover:bg-slate-100",
            },
            {
              href: "/dashboard/chauffeur/assistance",
              icon: Wrench,
              label: "Demander une assistance mécanique",
              bg: "bg-amber-50 hover:bg-amber-100",
            },
            {
              href: "/dashboard/chauffeur/incidents",
              icon: AlertTriangle,
              label: "Déclarer un incident",
              bg: "bg-amber-50 hover:bg-amber-100",
            },
            {
              href: "/dashboard/chat",
              icon: MessageSquare,
              label: "Consulter la messagerie",
              bg: "bg-slate-50 hover:bg-slate-100",
            },
            {
              href: "/dashboard/chauffeur/documents",
              icon: FileText,
              label: "Gérer mes documents",
              bg: "bg-slate-50 hover:bg-slate-100",
            },
            {
              href: "/dashboard/chauffeur/camions",
              icon: Truck,
              label: "Mes camions",
              bg: "bg-slate-50 hover:bg-slate-100",
            },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="block">
              <div className={`flex items-center justify-between p-3 rounded-lg ${a.bg} transition-colors min-h-[44px]`}>
                <div className="flex items-center gap-3">
                  <a.icon className="h-5 w-5 text-slate-700 shrink-0" />
                  <span className="text-sm font-medium">{a.label}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-700 shrink-0" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
