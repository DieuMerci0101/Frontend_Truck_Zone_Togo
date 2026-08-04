"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminService } from "@/services/admin.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { STATUT_INCIDENT } from "@/constants";
import { AlertTriangle, User, MapPin, CheckCircle } from "lucide-react";
import type { Incident } from "@/types";

const statutBadge: Record<string, "warning" | "info" | "success" | "default"> = {
  declare: "warning",
  en_cours: "info",
  traite: "success",
  cloture: "default",
};

const graviteColor: Record<string, string> = {
  Faible: "text-green-600",
  Moyenne: "text-amber-600",
  Grave: "text-amber-600",
  Mortel: "text-red-600",
};

export default function AdminIncidentsPage() {
  const queryClient = useQueryClient();
  const [filterStatut, setFilterStatut] = useState("");

  const { data: incidents, isLoading } = useQuery({
    queryKey: ["admin", "incidents", filterStatut],
    queryFn: () =>
      adminService.getIncidents({
        statut: filterStatut || undefined,
        limit: 50,
      }),
  });

  const clotureMutation = useMutation({
    mutationFn: (id: string) => adminService.updateIncidentStatut(id, "cloture"),
    onSuccess: () => {
      toast.success("Incident clôturé");
      queryClient.invalidateQueries({ queryKey: ["admin", "incidents"] });
    },
    onError: () => toast.error("Erreur lors de la clôture"),
  });

  const totalIncidents = incidents?.length || 0;
  const enCours = incidents?.filter((i) => i.statut === "en_cours" || i.statut === "declare").length || 0;
  const graves = incidents?.filter((i) => i.gravite === "Grave" || i.gravite === "Mortel").length || 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Incidents</h1>
          <p className="text-slate-500 mt-1">Consultez et gérez les incidents signalés</p>
        </div>
        <Select
          options={[
            { value: "", label: "Tous les statuts" },
            ...Object.entries(STATUT_INCIDENT).map(([v, l]) => ({ value: v, label: l })),
          ]}
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="w-full sm:w-auto"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">{totalIncidents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">En cours</p>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600">{enCours}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-slate-500">Graves / Mortels</p>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">{graves}</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-60" />
          ))}
        </div>
      ) : incidents && incidents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {incidents.map((inc: Incident) => (
            <Card key={inc.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge variant={statutBadge[inc.statut] || "info"}>
                    {STATUT_INCIDENT[inc.statut as keyof typeof STATUT_INCIDENT] || inc.statut}
                  </Badge>
                  <span className={`text-xs font-medium ${graviteColor[inc.gravite] || ""}`}>
                    {inc.gravite}
                  </span>
                </div>

                {inc.declarant_info && (
                  <div className="flex items-center gap-2 mb-3">
                    {inc.declarant_info.photo_profil ? (
                      <img
                        src={inc.declarant_info.photo_profil}
                        alt={inc.declarant_info.nom_complet}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-500" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {inc.declarant_info.nom_complet}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">
                        {inc.declarant_info.role === "chauffeur" ? "Chauffeur" :
                         inc.declarant_info.role === "proprietaire" ? "Propriétaire" :
                         inc.declarant_info.role}
                      </p>
                    </div>
                  </div>
                )}

                <h3 className="font-semibold text-slate-900 text-sm mb-1">{inc.type_incident}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 mb-3 flex-1">{inc.description}</p>

                <div className="text-xs text-slate-400 space-y-1 mb-3">
                  <p>{formatDateTime(inc.date_incident)}</p>
                  <p>Signalé le {formatDateTime(inc.created_at)}</p>
                  {inc.victimes && (
                    <p className="text-red-600 font-medium">{inc.nombre_victimes} victime(s)</p>
                  )}
                </div>

                {inc.localisation_lat && inc.localisation_lng && (
                  <a
                    href={`https://www.google.com/maps?q=${inc.localisation_lat},${inc.localisation_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-amber-800 mb-3"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Voir sur la carte
                  </a>
                )}

                {inc.statut !== "cloture" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-auto min-h-[44px]"
                    loading={clotureMutation.isPending}
                    onClick={() => clotureMutation.mutate(inc.id)}
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    Marquer comme Traité
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Aucun incident trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
