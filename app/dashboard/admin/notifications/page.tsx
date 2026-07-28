"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";
import { Bell, Check, CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  destinataire_id: string;
  titre: string;
  contenu: string;
  type: string;
  lu: boolean;
  lien: string | null;
  created_at: string;
}

const typeVariant: Record<string, "info" | "warning" | "success" | "destructive"> = {
  message: "info",
  incident: "destructive",
  assistance: "warning",
  document: "success",
  systeme: "info",
  admin: "info",
};

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const [filterLu, setFilterLu] = useState<string>("");

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["admin", "notifications", filterLu],
    queryFn: async () => {
      let url = "/api/notifications/?limit=50";
      if (filterLu === "non_lues") url += "&non_lues_seulement=true";
      return api.get<Notification[]>(url);
    },
  });

  const { data: nonLuesData } = useQuery({
    queryKey: ["admin", "notifications", "non-lues"],
    queryFn: async () => {
      return api.get<{ non_lues: number }>("/api/notifications/non-lues");
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (notifId: string) => {
      await api.put(`/api/notifications/${notifId}/lu`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.put("/api/notifications/tout-lu");
    },
    onSuccess: () => {
      toast.success("Toutes les notifications marquées comme lues");
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500">
              {nonLuesData ? `${nonLuesData.non_lues} non lue(s)` : "Gérez vos notifications"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterLu}
            onChange={(e) => setFilterLu(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]"
          >
            <option value="">Toutes</option>
            <option value="non_lues">Non lues</option>
          </select>
          {nonLuesData && nonLuesData.non_lues > 0 && (
            <Button onClick={() => markAllReadMutation.mutate()} className="min-h-[44px]">
              <CheckCheck className="h-4 w-4 mr-2" />
              Tout marquer lu
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className={`${!n.lu ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${!n.lu ? 'text-gray-900' : 'text-gray-700'}`}>
                        {n.titre}
                      </p>
                      <Badge variant={typeVariant[n.type] || "info"} className="text-[10px]">
                        {n.type}
                      </Badge>
                      {!n.lu && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{n.contenu}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(n.created_at)}</p>
                  </div>
                  {!n.lu && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markReadMutation.mutate(n.id)}
                      className="shrink-0 min-h-[36px]"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {filterLu === "non_lues" ? "Aucune notification non lue" : "Aucune notification"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
