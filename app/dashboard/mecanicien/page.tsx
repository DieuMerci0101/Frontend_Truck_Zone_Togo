"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { mecanicienService } from "@/services/mecanicien.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUT_ASSISTANCE } from "@/constants";
import { Headphones, Wrench, ArrowRight, Clock, CheckCircle } from "lucide-react";

const statutBadge: Record<string, "warning" | "info" | "success" | "default"> = {
  en_attente: "warning",
  assignee: "info",
  en_cours: "success",
  terminee: "default",
};

export default function MecanicienDashboard() {
  const { user } = useAuth();

  const { data: demandes, isLoading } = useQuery({
    queryKey: ["mecanicien", "demandes"],
    queryFn: () => mecanicienService.getMyDemandes(),
  });

  const enCours = demandes?.filter((d) => d.statut === "en_cours" || d.statut === "assignee") || [];
  const terminees = demandes?.filter((d) => d.statut === "terminee") || [];

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En cours</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-12 mt-1" />
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{enCours.length}</p>
                )}
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Terminées</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-12 mt-1" />
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{terminees.length}</p>
                )}
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-100">
                <CheckCircle className="h-5 w-5 text-slate-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-12 mt-1" />
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{demandes?.length ?? 0}</p>
                )}
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50">
                <Headphones className="h-5 w-5 text-slate-700" />
              </div>
            </div>
          </CardContent>
        </Card>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
