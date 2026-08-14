"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { dashboardService } from "@/services/dashboard.service";
import { mecanicienService } from "@/services/mecanicien.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUT_ASSISTANCE } from "@/constants";
import {
  Headphones,
  Wrench,
  ArrowRight,
  Clock,
  CheckCircle,
  Bell,
  Inbox,
  ShieldCheck,
  MapPin,
} from "lucide-react";

const statutBadge: Record<string, "warning" | "info" | "success" | "default"> = {
  en_attente: "warning",
  assignee: "info",
  en_cours: "success",
  terminee: "default",
};

export default function MecanicienDashboard() {
  const { user } = useAuth();

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => dashboardService.getOverview(),
    retry: false,
    refetchInterval: 15000,
  });

  const { data: demandes, isLoading } = useQuery({
    queryKey: ["mecanicien", "demandes"],
    queryFn: () => mecanicienService.getMyDemandes(),
    refetchInterval: 15000,
  });

  const enCours = demandes?.filter((d) => d.statut === "en_cours" || d.statut === "assignee") || [];
  const terminees = demandes?.filter((d) => d.statut === "terminee") || [];

  const verifPending =
    !overview?.is_verified &&
    (overview?.statut_verification === "pending_upload" ||
      overview?.statut_verification === "pending_approval");

  const statCards = [
    {
      title: "Demandes disponibles",
      value: loadingOverview ? null : overview?.demandes_disponibles ?? 0,
      icon: Headphones,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/dashboard/mecanicien/assistance",
      alert: (overview?.demandes_disponibles ?? 0) > 0,
    },
    {
      title: "Interventions en cours",
      value: loadingOverview ? null : overview?.interventions_actives ?? 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/dashboard/mecanicien/assistance",
      alert: (overview?.interventions_actives ?? 0) > 0,
    },
    {
      title: "Interventions terminées",
      value: loadingOverview ? null : overview?.interventions_terminees ?? 0,
      icon: CheckCircle,
      color: "text-slate-700",
      bg: "bg-slate-100",
      href: "/dashboard/mecanicien/assistance",
      alert: false,
    },
    {
      title: "Nouveaux messages",
      value: loadingOverview ? null : overview?.messages_non_lus ?? 0,
      icon: Inbox,
      color: "text-slate-700",
      bg: "bg-slate-50",
      href: "/dashboard/chat",
      alert: (overview?.messages_non_lus ?? 0) > 0,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.nom_complet?.split(" ")[0] || "Mécanicien"}
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez vos demandes d&apos;assistance
          </p>
        </div>
        <Link href="/dashboard/mecanicien/assistance" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto min-h-[44px]">
            <Headphones className="h-4 w-4 mr-2" />
            Voir les demandes
          </Button>
        </Link>
      </div>

      {/* Vérification du compte */}
      {verifPending && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <p className="text-sm text-amber-900 flex-1">
            Votre compte est en attente de vérification. Une fois approuvé, vous
            pourrez accepter des demandes d&apos;assistance.
          </p>
          <Link href="/dashboard/verification" className="shrink-0">
            <Button variant="secondary" size="sm" className="w-full sm:w-auto min-h-[40px]">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Vérifier mon compte
            </Button>
          </Link>
        </div>
      )}

      {/* Position GPS */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <span className="p-2 rounded-xl bg-amber-50 shrink-0">
          <MapPin className="h-4 w-4 text-amber-600" />
        </span>
        <p className="text-sm text-gray-700 flex-1">
          {overview?.position_active
            ? "Votre position est active : les chauffeurs vous trouvent plus facilement."
            : "Votre position GPS est désactivée. Activez-la pour recevoir des demandes près de vous."}
        </p>
        <Link href="/dashboard/mecanicien/profil" className="shrink-0">
          <Button variant="outline" size="sm" className="min-h-[40px]">
            Gérer
          </Button>
        </Link>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Demandes en cours</CardTitle>
          </CardHeader>
          <CardContent>
            {enCours.length > 0 ? (
              <div className="space-y-3">
                {enCours.slice(0, 4).map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 min-h-[44px]">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{d.type_panne}</p>
                      <p className="text-xs text-gray-500 truncate">{d.vehicule_description}</p>
                    </div>
                    <Badge variant={statutBadge[d.statut] || "info"} className="shrink-0">
                      {STATUT_ASSISTANCE[d.statut as keyof typeof STATUT_ASSISTANCE] || d.statut}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Headphones className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune demande en cours</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/mecanicien/assistance" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors min-h-[44px]">
                <div className="flex items-center gap-3">
                  <Headphones className="h-5 w-5 text-slate-700 shrink-0" />
                  <span className="text-sm font-medium">Voir les demandes d&apos;assistance</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-700 shrink-0" />
              </div>
            </Link>
            <Link href="/dashboard/mecanicien/profil" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors min-h-[44px]">
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-amber-600 shrink-0" />
                  <span className="text-sm font-medium">Gérer mes spécialités</span>
                </div>
                <ArrowRight className="h-4 w-4 text-amber-600 shrink-0" />
              </div>
            </Link>
            <Link href="/dashboard/parametres/notifications" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors min-h-[44px]">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-amber-600 shrink-0" />
                  <span className="text-sm font-medium">Consulter mes notifications</span>
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
