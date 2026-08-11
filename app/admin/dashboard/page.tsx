"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminService, type AdminVerificationItem } from "@/services/admin.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import {
  Users,
  UserCheck,
  Truck,
  Wrench,
  Shield,
  FolderOpen,
  Check,
  X,
  Clock,
  ArrowRight,
} from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  chauffeur: "Chauffeur",
  proprietaire: "Propriétaire de camions",
  mecanicien: "Mécanicien",
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [rejectItem, setRejectItem] = useState<AdminVerificationItem | null>(null);
  const [rejectMotif, setRejectMotif] = useState("");
  // État de chargement CIBLÉ : identifie l'utilisateur ET l'action en cours.
  // Un seul bouton de la liste affiche le spinner (et non toute la liste).
  const [actionLoading, setActionLoading] = useState<{
    userId: string;
    action: "approve" | "reject";
  } | null>(null);

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminService.getStats(),
  });

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["admin", "users", "recent"],
    queryFn: () => adminService.getUsers({ limit: 5 }),
  });

  const { data: pending, isLoading: loadingPending } = useQuery({
    queryKey: ["admin", "verifications", "pending"],
    queryFn: () =>
      adminService.getVerifications({
        statut: "pending_upload,pending_approval",
        limit: 5,
      }),
  });

  const approveMutation = useMutation({
    mutationFn: async (item: AdminVerificationItem) => {
      const docs = (item.documents || []).filter((d) => d.fichier_url);
      if (item.role === "mecanicien") {
        await adminService.decideVerification(item.user_id, "approved");
      } else {
        await Promise.all(docs.map((d) => adminService.approveDocument(d.id)));
      }
      return { message: "ok" };
    },
    onMutate: (item) => setActionLoading({ userId: item.user_id, action: "approve" }),
    onSettled: () => setActionLoading(null),
    onSuccess: () => {
      toast.success("Dossier validé");
      queryClient.invalidateQueries({ queryKey: ["admin", "verifications"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erreur lors de la validation");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ item, motif }: { item: AdminVerificationItem; motif: string }) => {
      const docs = (item.documents || []).filter((d) => d.fichier_url);
      if (item.role === "mecanicien") {
        await adminService.decideVerification(item.user_id, "rejected", motif);
      } else {
        await Promise.all(docs.map((d) => adminService.rejectDocument(d.id, motif)));
      }
      return { message: "ok" };
    },
    onMutate: ({ item }) => setActionLoading({ userId: item.user_id, action: "reject" }),
    onSettled: () => setActionLoading(null),
    onSuccess: () => {
      toast.success("Dossier rejeté");
      queryClient.invalidateQueries({ queryKey: ["admin", "verifications"] });
      setRejectItem(null);
      setRejectMotif("");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erreur lors du rejet");
    },
  });

  const handleConfirmReject = () => {
    if (!rejectItem || !rejectMotif.trim()) return;
    rejectMutation.mutate({ item: rejectItem, motif: rejectMotif.trim() });
  };

  const statCards = [
    {
      title: "Total utilisateurs",
      value: stats?.total_utilisateurs,
      icon: Users,
      color: "text-slate-700",
      bg: "bg-slate-50",
    },
    {
      title: "Chauffeurs",
      value: stats?.chauffeurs,
      icon: UserCheck,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Propriétaires",
      value: stats?.proprietaires,
      icon: Truck,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Mécaniciens",
      value: stats?.mecaniciens,
      icon: Wrench,
      color: "text-slate-700",
      bg: "bg-slate-100",
    },
    {
      title: "Admins",
      value: stats?.admins,
      icon: Shield,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Camions",
      value: stats?.camions,
      icon: Truck,
      color: "text-slate-700",
      bg: "bg-slate-100",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrateur</h1>
        <p className="text-gray-500 mt-1">Vue d&apos;ensemble de la plateforme</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
                  { label: "Chauffeurs", value: stats?.chauffeurs || 0, color: "bg-amber-500" },
                  { label: "Propriétaires", value: stats?.proprietaires || 0, color: "bg-amber-600" },
                  { label: "Mécaniciens", value: stats?.mecaniciens || 0, color: "bg-slate-600" },
                  { label: "Admins", value: stats?.admins || 0, color: "bg-slate-400" },
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
                        u.is_active ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-800"
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

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-slate-700" />
              <CardTitle className="text-lg">Dossiers KYC en attente</CardTitle>
              {!loadingPending && (pending?.length ?? 0) > 0 && (
                <Badge variant="warning">{pending?.length}</Badge>
              )}
            </div>
            <Link
              href="/admin/dashboard/documents"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-amber-800 min-h-[44px] px-2"
            >
              Voir tous les dossiers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loadingPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : pending && pending.length > 0 ? (
            <div className="space-y-3">
              {pending.map((item) => {
                const isApproving =
                  actionLoading?.userId === item.user_id && actionLoading?.action === "approve";
                const isRejecting =
                  actionLoading?.userId === item.user_id && actionLoading?.action === "reject";
                const isRowDisabled = actionLoading?.userId === item.user_id;
                return (
                <div
                  key={item.user_id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {item.nom_complet || "Inconnu"}
                      </p>
                      <Badge variant="info">{ROLE_LABELS[item.role] || item.role}</Badge>
                      <Badge variant="warning">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.soumis_le ? `Soumis le ${formatDate(item.soumis_le)}` : "En attente"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{item.email || "—"}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(item)}
                      loading={isApproving}
                      disabled={isRowDisabled && !isApproving}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Valider
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setRejectItem(item);
                        setRejectMotif("");
                      }}
                      loading={isRejecting}
                      disabled={isRowDisabled && !isRejecting}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Rejeter
                    </Button>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">
              Aucun dossier en attente
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!rejectItem} onClose={() => { setRejectItem(null); setRejectMotif(""); }} title="Rejeter le dossier">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Veuillez indiquer le motif du rejet. Un email sera envoyé à l&apos;utilisateur.
          </p>
          <Textarea
            placeholder="Motif du rejet..."
            value={rejectMotif}
            onChange={(e) => setRejectMotif(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => { setRejectItem(null); setRejectMotif(""); }}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              loading={rejectMutation.isPending}
              disabled={!rejectMotif.trim()}
            >
              Confirmer le rejet
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
