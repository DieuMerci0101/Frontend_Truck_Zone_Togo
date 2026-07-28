"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, Truck, Wrench, Shield } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminService.getStats(),
  });

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["admin", "users", "recent"],
    queryFn: () => adminService.getUsers({ limit: 5 }),
  });

  const statCards = [
    {
      title: "Total utilisateurs",
      value: stats?.total_utilisateurs,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Chauffeurs",
      value: stats?.chauffeurs,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Propriétaires",
      value: stats?.proprietaires,
      icon: Truck,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Mécaniciens",
      value: stats?.mecaniciens,
      icon: Wrench,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Admins",
      value: stats?.admins,
      icon: Shield,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrateur</h1>
        <p className="text-gray-500 mt-1">Vue d&apos;ensemble de la plateforme</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 truncate">{card.title}</p>
                  {loadingStats ? (
                    <Skeleton className="h-7 w-12 mt-1" />
                  ) : (
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{card.value ?? 0}</p>
                  )}
                </div>
                <div className={`p-2 sm:p-2.5 rounded-xl ${card.bg} shrink-0`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistiques par rôle</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Chauffeurs", value: stats?.chauffeurs || 0, color: "bg-green-500" },
                  { label: "Propriétaires", value: stats?.proprietaires || 0, color: "bg-orange-500" },
                  { label: "Mécaniciens", value: stats?.mecaniciens || 0, color: "bg-purple-500" },
                  { label: "Admins", value: stats?.admins || 0, color: "bg-red-500" },
                ].map((item) => {
                  const maxVal = Math.max(
                    stats?.chauffeurs || 0,
                    stats?.proprietaires || 0,
                    stats?.mecaniciens || 0,
                    stats?.admins || 0,
                    1
                  );
                  const pct = (item.value / maxVal) * 100;
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{item.label}</span>
                        <span className="font-medium text-gray-900">{item.value}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Utilisateurs récents</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : users && users.length > 0 ? (
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 min-h-[44px]">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{u.nom_complet}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ml-2 ${
                        u.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {u.is_active ? "Actif" : "Inactif"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">Aucun utilisateur</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
