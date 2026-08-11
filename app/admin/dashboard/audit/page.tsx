"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { ScrollText } from "lucide-react";
import { cn } from "@/lib/cn";

const AUDIT_ACTIONS: Record<string, string> = {
  REGISTER: "Inscription",
  UPDATE_PROFILE: "Mise à jour profil",
  UPDATE_PROFILE_PHOTO: "Photo de profil",
  DELETE_PROFILE_PHOTO: "Suppression photo",
  ADD_TRUCK: "Ajout camion",
  UPDATE_TRUCK: "Mise à jour camion",
  DELETE_TRUCK: "Suppression camion",
  ADD_TRUCK_PHOTO: "Photo camion",
  DELETE_TRUCK_PHOTO: "Suppression photo camion",
  SET_TRUCK_MAIN_PHOTO: "Photo principale camion",
  PUBLISH_TRUCK: "Publication camion",
  UNPUBLISH_TRUCK: "Dépublication camion",
  UPLOAD_DOCUMENT: "Upload document",
  UPDATE_USER_STATUS: "Statut utilisateur",
};

const ACTION_VARIANT: Record<string, "info" | "default" | "warning" | "destructive" | "success"> = {
  REGISTER: "info",
  UPDATE_PROFILE: "default",
  UPDATE_PROFILE_PHOTO: "success",
  DELETE_PROFILE_PHOTO: "destructive",
  ADD_TRUCK: "info",
  UPDATE_TRUCK: "default",
  DELETE_TRUCK: "destructive",
  ADD_TRUCK_PHOTO: "success",
  DELETE_TRUCK_PHOTO: "destructive",
  SET_TRUCK_MAIN_PHOTO: "warning",
  PUBLISH_TRUCK: "success",
  UNPUBLISH_TRUCK: "warning",
  UPLOAD_DOCUMENT: "success",
  UPDATE_USER_STATUS: "warning",
};

function formatAction(action: string): string {
  return AUDIT_ACTIONS[action] ?? action.replace(/_/g, " ").toLowerCase();
}

function formatTarget(targetType?: string | null, targetId?: string | null): string {
  if (!targetType) return "—";
  const label = targetType.replace(/_/g, " ").toLowerCase();
  return targetId ? `${label} · ${targetId.slice(0, 8)}` : label;
}

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState("");
  const limit = 10;

  const { data: logs, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "audit", page, filterAction],
    queryFn: () =>
      adminService.getAudit({
        skip: (page - 1) * limit,
        limit,
        action: filterAction || undefined,
      }),
  });

  const totalPages = logs ? Math.max(1, Math.ceil(logs.length / limit)) : 1;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg">
            <ScrollText className="h-6 w-6 text-slate-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Journal d'audit</h1>
            <p className="text-gray-500">Historique des actions critiques sur la plateforme</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            options={[
              { value: "", label: "Toutes les actions" },
              ...Object.entries(AUDIT_ACTIONS).map(([v, l]) => ({ value: v, label: l })),
            ]}
            value={filterAction}
            onChange={(e) => {
              setFilterAction(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto"
          />
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            Actualiser
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : logs && logs.length > 0 ? (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                <span className="col-span-3">Action</span>
                <span className="col-span-3">Cible</span>
                <span className="col-span-4">Détails</span>
                <span className="col-span-2 text-right">Date</span>
              </div>
              <div className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 items-start"
                  >
                    <div className="col-span-3">
                      <Badge variant={ACTION_VARIANT[log.action] || "default"}>
                        {formatAction(log.action)}
                      </Badge>
                    </div>
                    <span className="col-span-3 text-sm text-gray-600">
                      {formatTarget(log.target_type, log.target_id)}
                    </span>
                    <div className="col-span-4">
                      {log.details && Object.keys(log.details).length > 0 ? (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-700 hover:underline font-medium">
                            Voir les détails
                          </summary>
                          <pre
                            className={cn(
                              "mt-1 p-2 bg-gray-50 rounded-md overflow-x-auto",
                              "text-[11px] leading-relaxed text-gray-700 whitespace-pre-wrap break-words"
                            )}
                          >
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                    <span className="col-span-2 text-xs text-gray-500 md:text-right">
                      {log.created_at ? formatDateTime(log.created_at) : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <Card>
          <CardContent className="p-10 text-center text-sm text-gray-500">
            Aucune entrée d'audit trouvée.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
