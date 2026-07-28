"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { mecanicienService } from "@/services/mecanicien.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { STATUT_ASSISTANCE, TYPE_PANNE, URGENCE } from "@/constants";
import { Headphones, ArrowRight, CheckCircle, Play } from "lucide-react";
import type { StatutAssistance } from "@/types";

const statutBadge: Record<string, "warning" | "info" | "success" | "default"> = {
  en_attente: "warning",
  assignee: "info",
  en_cours: "success",
  terminee: "default",
};

const urgenceColor: Record<string, string> = {
  Faible: "text-green-600",
  Moyenne: "text-yellow-600",
  Haute: "text-orange-600",
  Critique: "text-red-600",
};

const nextStatut: Record<string, StatutAssistance | null> = {
  assignee: "en_cours",
  en_cours: "terminee",
};

export default function MecanicienAssistancePage() {
  const queryClient = useQueryClient();

  const { data: demandes, isLoading } = useQuery({
    queryKey: ["mecanicien", "demandes"],
    queryFn: () => mecanicienService.getMyDemandes(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: StatutAssistance }) =>
      mecanicienService.updateAssistanceStatut(id, { statut }),
    onSuccess: () => {
      toast.success("Statut mis à jour");
      queryClient.invalidateQueries({ queryKey: ["mecanicien", "demandes"] });
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Headphones className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandes d&apos;assistance</h1>
          <p className="text-gray-500">Suivez et gérez les demandes qui vous sont assignées</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : demandes && demandes.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {demandes.map((demande) => {
            const next = nextStatut[demande.statut];
            return (
              <Card key={demande.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {TYPE_PANNE[demande.type_panne as keyof typeof TYPE_PANNE] ||
                            demande.type_panne}
                        </h3>
                        <Badge variant={statutBadge[demande.statut] || "info"}>
                          {STATUT_ASSISTANCE[demande.statut as keyof typeof STATUT_ASSISTANCE] ||
                            demande.statut}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {demande.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-sm">
                        <span className={urgenceColor[demande.urgence] || "text-gray-600"}>
                          Urgence: {demande.urgence}
                        </span>
                        <span className="text-gray-500">
                          Véhicule: {demande.vehicule_description}
                        </span>
                        <span className="text-gray-500">
                          {formatDate(demande.created_at)}
                        </span>
                      </div>
                    </div>
                    {next && (
                      <Button
                        size="sm"
                        variant={next === "terminee" ? "secondary" : "default"}
                        loading={updateMutation.isPending}
                        onClick={() =>
                          updateMutation.mutate({ id: demande.id, statut: next })
                        }
                        className="min-h-[44px] shrink-0"
                      >
                        {next === "en_cours" ? (
                          <>
                            <Play className="h-3.5 w-3.5 mr-1" />
                            Commencer
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Terminer
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Headphones className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune demande d&apos;assistance</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
