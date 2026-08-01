"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { proprietaireService } from "@/services/proprietaire.service";
import { chauffeurService } from "@/services/chauffeur.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { formatMoney } from "@/lib/utils";
import { TYPE_CONTRAT } from "@/constants";
import { DISPONIBILITE_CHAUFFEUR } from "@/constants";
import {
  Truck,
  Briefcase,
  PlusCircle,
  ArrowRight,
  Users,
} from "lucide-react";
import type { DisponibiliteChauffeur } from "@/types";

const statutBadge: Record<DisponibiliteChauffeur, "success" | "warning" | "destructive"> = {
  disponible: "success",
  en_mission: "warning",
  indisponible: "destructive",
};

export default function ProprietaireDashboard() {
  const { user } = useAuth();

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

  const statCards = [
    {
      title: "Camions",
      value: loadingCamions ? null : camions?.length ?? 0,
      icon: Truck,
      color: "text-slate-700",
      bg: "bg-slate-50",
    },
    {
      title: "Offres actives",
      value: loadingOffres
        ? null
        : offres?.filter((o) => o.statut === "active").length ?? 0,
      icon: Briefcase,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Total offres",
      value: loadingOffres ? null : offres?.length ?? 0,
      icon: Briefcase,
      color: "text-slate-700",
      bg: "bg-slate-100",
    },
    {
      title: "Chauffeurs disponibles",
      value: loadingChauffeurs ? null : visibleChauffeurs.length,
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.nom_complet?.split(" ")[0] || "Propriétaire"}
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez vos camions et offres
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  {card.value === null ? (
                    <Skeleton className="h-7 w-12 mt-1" />
                  ) : (
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{card.value}</p>
                  )}
                </div>
                <div className={`p-2.5 sm:p-3 rounded-xl ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                    <Badge variant="success" className="shrink-0">Active</Badge>
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
