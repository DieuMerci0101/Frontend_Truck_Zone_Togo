"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { chauffeurService } from "@/services/chauffeur.service";
import { incidentService } from "@/services/incident.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import {
  FileText,
  Briefcase,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  Truck,
  Wrench,
  ToggleLeft,
  Circle,
  Clock,
} from "lucide-react";
import type { DisponibiliteChauffeur } from "@/types";

const statusConfig: Record<
  DisponibiliteChauffeur,
  { label: string; color: string; bg: string; icon: React.ElementType; description: string }
> = {
  disponible: {
    label: "Disponible",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    icon: Circle,
    description: "Visible par les propriétaires dans les recherches",
  },
  en_mission: {
    label: "En mission",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    icon: Clock,
    description: "En cours de mission actuelle",
  },
  indisponible: {
    label: "Indisponible",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: AlertTriangle,
    description: "Non visible par les propriétaires",
  },
};

export default function ChauffeurDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  const { data: myDemandes } = useQuery({
    queryKey: ["chauffeur", "mes-demandes"],
    queryFn: () => chauffeurService.getMesDemandes(),
    retry: false,
  });

  const updateStatutMutation = useMutation({
    mutationFn: (statut: DisponibiliteChauffeur) =>
      chauffeurService.updateStatut({ disponibilite: statut }),
    onSuccess: (data) => {
      toast.success(data.message || "Disponibilité mise à jour");
      queryClient.invalidateQueries({ queryKey: ["chauffeur", "profile"] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      toast.error(e?.response?.data?.detail || e?.message || "Erreur lors de la mise à jour du statut");
    },
  });

  const currentStatus = profile?.disponibilite || "disponible";
  const statusInfo = statusConfig[currentStatus];

  const statCards = [
    {
      title: "Documents",
      value: loadingDocs ? null : documents?.length ?? 0,
      icon: FileText,
      color: "text-slate-700",
      bg: "bg-slate-50",
    },
    {
      title: "Incidents",
      value: loadingIncidents ? null : incidents?.length ?? 0,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Demandes",
      value: myDemandes?.length ?? 0,
      icon: Wrench,
      color: "text-slate-700",
      bg: "bg-slate-100",
    },
    {
      title: "Messagerie",
      value: null,
      icon: MessageSquare,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.nom_complet?.split(" ")[0] || "Chauffeur"}
          </h1>
          <p className="text-gray-500 mt-1">
            Voici un résumé de votre activité
          </p>
        </div>
        <Link href="/dashboard/chauffeur/offres" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto min-h-[44px]">
            <Briefcase className="h-4 w-4 mr-2" />
            Voir les offres
          </Button>
        </Link>
      </div>

      {/* Status Toggle Card */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ToggleLeft className="h-5 w-5 text-slate-700" />
            Ma disponibilité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            {(Object.keys(statusConfig) as DisponibiliteChauffeur[]).map((key) => {
              const config = statusConfig[key];
              const Icon = config.icon;
              const isActive = currentStatus === key;
              return (
                <button
                  key={key}
                  onClick={() => updateStatutMutation.mutate(key)}
                  disabled={updateStatutMutation.isPending}
                  className={`flex-1 flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[60px] ${
                    isActive
                      ? `${config.bg} ${config.color} border-current shadow-sm`
                      : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? config.color : ""}`} />
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${isActive ? config.color : ""}`}>
                      {config.label}
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">{config.description}</p>
                  </div>
                  {isActive && (
                    <Badge variant="success" className="ml-auto text-xs">
                      Actif
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2 sm:mt-3">
            Un statut <strong>Disponible</strong> rend votre profil visible immédiatement par les propriétaires dans leurs recherches.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statCards.map((card) => (
          <Card key={card.title}>
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
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/chauffeur/offres" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors min-h-[44px]">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-slate-700 shrink-0" />
                  <span className="text-sm font-medium">Voir les offres disponibles</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-700 shrink-0" />
              </div>
            </Link>
            <Link href="/dashboard/chauffeur/assistance" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors min-h-[44px]">
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-amber-600 shrink-0" />
                  <span className="text-sm font-medium">Demander une assistance mécanique</span>
                </div>
                <ArrowRight className="h-4 w-4 text-amber-600 shrink-0" />
              </div>
            </Link>
            <Link href="/dashboard/chauffeur/incidents" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors min-h-[44px]">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                  <span className="text-sm font-medium">Déclarer un incident</span>
                </div>
                <ArrowRight className="h-4 w-4 text-amber-600 shrink-0" />
              </div>
            </Link>
            <Link href="/dashboard/chat" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors min-h-[44px]">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-slate-700 shrink-0" />
                  <span className="text-sm font-medium">Consulter la messagerie</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-700 shrink-0" />
              </div>
            </Link>
            <Link href="/dashboard/chauffeur/documents" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors min-h-[44px]">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-700 shrink-0" />
                  <span className="text-sm font-medium">Gérer mes documents</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-700 shrink-0" />
              </div>
            </Link>
          </CardContent>
        </Card>

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
    </div>
  );
}
