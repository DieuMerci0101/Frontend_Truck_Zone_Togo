"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminService } from "@/services/admin.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, getRoleLabel } from "@/lib/utils";
import { ROLES } from "@/constants";
import { Users, Search } from "lucide-react";
import type { User } from "@/types";

const roleBadge: Record<string, "info" | "default" | "warning" | "destructive"> = {
  chauffeur: "info",
  proprietaire: "default",
  mecanicien: "warning",
  admin: "destructive",
};

export default function AdminUtilisateursPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filterRole, setFilterRole] = useState("");
  const limit = 10;

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users", page, filterRole],
    queryFn: () =>
      adminService.getUsers({
        skip: (page - 1) * limit,
        limit,
        role: filterRole || undefined,
      }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminService.toggleUserStatus(id),
    onSuccess: (data) => {
      toast.success(data.message || "Statut mis à jour");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const totalPages = users ? Math.ceil(users.length / limit) : 1;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg">
            <Users className="h-6 w-6 text-slate-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
            <p className="text-gray-500">Gérez les comptes utilisateurs</p>
          </div>
        </div>
        <Select
          options={[
            { value: "", label: "Tous les rôles" },
            ...Object.entries(ROLES).map(([v, l]) => ({ value: v, label: l })),
          ]}
          value={filterRole}
          onChange={(e) => {
            setFilterRole(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-auto"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : users && users.length > 0 ? (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="hidden sm:grid grid-cols-6 gap-4 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
              <span className="col-span-2">Utilisateur</span>
              <span>Email</span>
              <span>Rôle</span>
              <span>Statut</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-1 sm:grid-cols-6 gap-2 sm:gap-4 px-4 py-3 items-center"
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <Avatar name={user.nom_complet} size="sm" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {user.nom_complet}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 truncate hidden sm:block">{user.email}</span>
                  <div className="hidden sm:block">
                    <Badge variant={roleBadge[user.role] || "info"}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                  <div className="hidden sm:block">
                    <Badge variant={user.is_active ? "success" : "destructive"}>
                      {user.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  <div className="flex sm:justify-end">
                    <Button
                      variant={user.is_active ? "destructive" : "default"}
                      size="sm"
                      loading={toggleMutation.isPending}
                      onClick={() => toggleMutation.mutate(user.id)}
                      className="min-h-[44px]"
                    >
                      {user.is_active ? "Désactiver" : "Activer"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
