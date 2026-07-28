"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { STATUT_INCIDENT, GRAVITE_INCIDENT } from "@/constants";
import { AlertTriangle } from "lucide-react";

const statutBadge: Record<string, "warning" | "info" | "success" | "default"> = {
  declare: "warning",
  en_cours: "info",
  traite: "success",
  cloture: "default",
};

const graviteColor: Record<string, string> = {
  Faible: "text-green-600",
  Moyenne: "text-yellow-600",
  Grave: "text-orange-600",
  Mortel: "text-red-600",
};

export default function AdminIncidentsPage() {
  const [filterStatut, setFilterStatut] = useState("");

  const { data: incidents, isLoading } = useQuery({
    queryKey: ["admin", "incidents", filterStatut],
    queryFn: () =>
      adminService.getIncidents({
        statut: filterStatut || undefined,
        limit: 50,
      }),
  });

  const totalIncidents = incidents?.length || 0;
  const enCours = incidents?.filter((i) => i.statut === "en_cours").length || 0;
  const graves = incidents?.filter((i) => i.gravite === "Grave" || i.gravite === "Mortel").length || 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Suivi des incidents</h1>
            <p className="text-gray-500">Consultez et gérez les incidents signalés</p>
          </div>
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
            <p className="text-sm text-gray-500">Total incidents</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalIncidents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-gray-500">En cours</p>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{enCours}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm text-gray-500">Graves / Mortels</p>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">{graves}</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : incidents && incidents.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {incidents.map((inc) => (
            <Card key={inc.id}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{inc.type_incident}</h3>
                      <Badge variant={statutBadge[inc.statut] || "info"}>
                        {STATUT_INCIDENT[inc.statut as keyof typeof STATUT_INCIDENT] || inc.statut}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{inc.description}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-sm text-gray-500">
                      <span className={graviteColor[inc.gravite] || "text-gray-600"}>
                        Gravité: {inc.gravite}
                      </span>
                      <span>{formatDate(inc.date_incident)}</span>
                      {inc.victimes && (
                        <span className="text-red-600 font-medium">
                          {inc.nombre_victimes} victime(s)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucun incident trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
