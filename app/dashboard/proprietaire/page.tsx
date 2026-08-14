"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { dashboardService } from "@/services/dashboard.service";
import { proprietaireService } from "@/services/proprietaire.service";
import { chauffeurService } from "@/services/chauffeur.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { formatMoney } from "@/lib/utils";
import { DISPONIBILITE_CHAUFFEUR } from "@/constants";
import {
  Truck,
  Briefcase,
  PlusCircle,
  ArrowRight,
  Users,
  Bell,
  Inbox,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import type { DisponibiliteChauffeur } from "@/types";

const statutBadge: Record<DisponibiliteChauffeur, "success" | "warning" | "destructive"> = {
  disponible: "success",
  en_mission: "warning",
  indisponible: "destructive",
};

const candStatutBadge: Record<string, "success" | "warning" | "destructive" | "default"> = {
  en_attente: "warning",
  acceptee: "success",
  refusee: "destructive",
};

const candStatutLabel: Record<string, string> = {
  en_attente: "En attente",
  acceptee: "Acceptée",
  refusee: "Non retenue",
};

export default function ProprietaireDashboard() {
  const { user } = useAuth();

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => dashboardService.getOverview(),
    retry: false,
    refetchInterval: 15000,
  });

  const { data: camions, isLoading: loadingCamions } = useQuery({
    queryKey: ["proprietaire", "camions"],
    queryFn: () => proprietaireService.getMyCamions(),
  });

  const { data: offres, isLoading: loadingOffres } = useQuery({
    queryKey: ["proprietaire", "offres"],
    queryFn: () => proprietaireService.getMyOffres(),
  });

  const { data: chauffeurs, isLoading: loadingChauffeurs } = useQuery({
    queryKey: ["proprietaire", "chauffeurs-live"],
    queryFn: () => chauffeurService.list({ limit: 50 }),
    refetchInterval: 15000,
  });

  const visibleChauffeurs =
    chauffeurs?.filter(
      (c) => c.user?.is_active !== false && c.disponibilite !== "indisponible"
    ) ?? [];

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
      title: "Candidatures à traiter",
      value: loadingOverview ? null : overview?.candidatures_recues_en_attente ?? 0,
      icon: UserCheck,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/dashboard/proprietaire/offres",
      alert: (overview?.candidatures_recues_en_attente ?? 0) > 0,
    },
    {
      title: "Offres actives",
      value: loadingOverview ? null : overview?.offres_actives ?? 0,
      icon: Briefcase,
      color: "text-slate-700",
      bg: "bg-slate-50",
      href: "/dashboard/proprietaire/offres",
      alert: false,
    },
  ];

  const dernieresCand = overview?.dernieres_candidatures_recues ?? [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.nom_complet?.split(" ")[0] || "Propriétaire"}
          </h1>
          <p className="text-gray-500 mt-1">
            Voici l&apos;activité de vos offres et camions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/dashboard/proprietaire/camions" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto min-h-[44px]">
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter un camion
            </Button>
          </Link>
          <Link href="/dashboard/proprietaire/offres" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto min-h-[44px]">
              <Briefcase className="h-4 w-4 mr-2" />
              Publier une offre
            </Button>
          </Link>
        </div>
      </div>

      {/* Vérification du compte */}
      {verifPending && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <p className="text-sm text-amber-900 flex-1">
            Votre compte est en attente de vérification. Une fois approuvé, vos
            offres seront visibles par les chauffeurs.
          </p>
          <Link href="/dashboard/verification" className="shrink-0">
            <Button variant="secondary" size="sm" className="w-full sm:w-auto min-h-[40px]">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Vérifier mon compte
            </Button>
          </Link>
        </div>
      )}

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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg">Dernières candidatures reçues</CardTitle>
          <Link href="/dashboard/proprietaire/offres">
            <Button variant="outline" size="sm" className="min-h-[44px] text-xs">
              Gérer les candidatures
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {dernieresCand.length > 0 ? (
            <div className="space-y-3">
              {dernieresCand.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="p-2 rounded-xl bg-amber-50 shrink-0">
                      <Users className="h-4 w-4 text-amber-600" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {c.chauffeur_nom || "Chauffeur"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        Postule à : {c.offre_titre || "—"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={candStatutBadge[c.statut] || "default"} className="shrink-0">
                    {candStatutLabel[c.statut] || c.statut}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune candidature pour l&apos;instant</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg">Chauffeurs disponibles en temps réel</CardTitle>
          <Link href="/dashboard/proprietaire/chauffeurs">
            <Button variant="outline" size="sm" className="min-h-[44px] text-xs">
              Rechercher des chauffeurs
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loadingChauffeurs ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : visibleChauffeurs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleChauffeurs.slice(0, 6).map((chauffeur) => (
                <div
                  key={chauffeur.id}
                  className="flex flex-col p-3 rounded-lg bg-gray-50 min-h-[120px]"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={chauffeur.user?.photo_profil || null}
                      name={chauffeur.user?.nom_complet || "Chauffeur"}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {chauffeur.user?.nom_complet || "Chauffeur"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        Permis {chauffeur.categorie_permis} · {chauffeur.annees_experience} an(s)
                      </p>
                    </div>
                    <Badge variant={statutBadge[chauffeur.disponibilite] || "default"} className="shrink-0">
                      {DISPONIBILITE_CHAUFFEUR[chauffeur.disponibilite] || chauffeur.disponibilite}
                    </Badge>
                  </div>
                  <Link
                    href={`/chauffeurs/${chauffeur.id}`}
                    className="mt-auto pt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 min-h-[36px]"
                  >
                    Voir plus
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun chauffeur disponible actuellement</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Offres récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {offres && offres.length > 0 ? (
              <div className="space-y-3">
                {offres.slice(0, 4).map((offre) => (
                  <div key={offre.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 min-h-[44px]">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{offre.titre}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {formatMoney(offre.salaire_propose)} · {offre.zone_travail}
                      </p>
                    </div>
                    <Badge variant={offre.statut === "active" ? "success" : "secondary"} className="shrink-0">
                      {offre.statut === "active" ? "Active" : offre.statut}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune offre</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/proprietaire/camions" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors min-h-[44px]">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-slate-700 shrink-0" />
                  <span className="text-sm font-medium">Gérer mes camions</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-700 shrink-0" />
              </div>
            </Link>
            <Link href="/dashboard/proprietaire/offres" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors min-h-[44px]">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-amber-600 shrink-0" />
                  <span className="text-sm font-medium">Publier une offre</span>
                </div>
                <ArrowRight className="h-4 w-4 text-amber-600 shrink-0" />
              </div>
            </Link>
            <Link href="/dashboard/proprietaire/chauffeurs" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors min-h-[44px]">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-amber-600 shrink-0" />
                  <span className="text-sm font-medium">Rechercher des chauffeurs</span>
                </div>
                <ArrowRight className="h-4 w-4 text-amber-600 shrink-0" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
