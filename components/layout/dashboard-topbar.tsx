"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogoutModal } from "@/components/ui/logout-modal";
import { notificationService } from "@/services/notification.service";
import { getRoleLabel } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { AvailabilityDropdown } from "@/components/layout/availability-dropdown";
import {
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  User,
  MessageSquare,
  AlertTriangle,
  Wrench,
  FileText,
  Shield,
  CheckCheck,
  Inbox,
} from "lucide-react";
import type { TypeNotification } from "@/types";

interface DashboardTopbarProps {
  onMenuClick: () => void;
}

function getBreadcrumb(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length <= 1) return "Dashboard";
  const last = parts[parts.length - 1];
  const map: Record<string, string> = {
    chauffeur: "Chauffeur",
    proprietaire: "Propriétaire",
    mecanicien: "Mécanicien",
    admin: "Administrateur",
    profil: "Profil",
    documents: "Documents",
    offres: "Offres",
    incidents: "Incidents",
    camions: "Camions",
    chauffeurs: "Chauffeurs",
    assistance: "Assistance",
    specialites: "Spécialités",
    utilisateurs: "Utilisateurs",
    statistiques: "Statistiques",
    parametres: "Paramètres",
    chat: "Messagerie",
  };
  return map[last] || last.charAt(0).toUpperCase() + last.slice(1);
}

const typeIcon: Record<TypeNotification, React.ElementType> = {
  message: MessageSquare,
  incident: AlertTriangle,
  assistance: Wrench,
  document: FileText,
  systeme: Bell,
  admin: Shield,
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ["notifications", "non-lues"],
    queryFn: () => notificationService.getNonLues(),
    refetchInterval: 15000,
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications", "liste"],
    queryFn: () => notificationService.list({ limit: 10 }),
    refetchInterval: 15000,
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "non-lues"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "liste"] });
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "non-lues"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "liste"] });
    },
  });

  const unreadCount = notifData?.non_lues || 0;

  const openNotifications = () => {
    const next = !notifOpen;
    setNotifOpen(next);
    setDropdownOpen(false);
    if (next) {
      queryClient.invalidateQueries({ queryKey: ["notifications", "liste"] });
      if (unreadCount > 0) markAllMutation.mutate();
    }
  };

  const openNotification = (n: {
    id: string;
    lu: boolean;
    lien: string | null;
  }) => {
    if (!n.lu) markOneMutation.mutate(n.id);
    setNotifOpen(false);
    if (n.lien) router.push(n.lien);
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden min-w-[44px] min-h-[44px]"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-gray-900">
                {getBreadcrumb(pathname)}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-4">
            {String(user?.role || "").toLowerCase() === "chauffeur" && (
              <AvailabilityDropdown />
            )}
            <div className="relative">
              <button
                onClick={openNotifications}
                aria-label="Notifications"
                className="relative inline-flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px]"
              >
                <Bell className="h-5 w-5 text-gray-500" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotifOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-xl shadow-lg border border-gray-200 z-50 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">Notifications</p>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllMutation.mutate()}
                          className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium min-h-[36px]"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          Tout marquer comme lu
                        </button>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications && notifications.length > 0 ? (
                        notifications.map((n) => {
                          const Icon = typeIcon[n.type] || Bell;
                          return (
                            <button
                              key={n.id}
                              onClick={() => openNotification(n)}
                              className={cn(
                                "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors",
                                !n.lu && "bg-amber-50/60"
                              )}
                            >
                              <span
                                className={cn(
                                  "p-2 rounded-lg shrink-0",
                                  n.lu ? "bg-gray-100 text-gray-500" : "bg-amber-100 text-amber-600"
                                )}
                              >
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-medium text-gray-900">
                                  {n.titre}
                                  {!n.lu && (
                                    <span className="ml-2 inline-block h-2 w-2 rounded-full bg-amber-500" />
                                  )}
                                </span>
                                <span className="block text-xs text-gray-500 line-clamp-2 mt-0.5">
                                  {n.contenu}
                                </span>
                                <span className="block text-[11px] text-gray-400 mt-1">
                                  {timeAgo(n.created_at)}
                                </span>
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-center py-10 text-gray-400">
                          <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Aucune notification</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-100 px-4 py-2">
                      <Link
                        href="/dashboard/chat"
                        onClick={() => setNotifOpen(false)}
                        className="flex items-center justify-center gap-2 text-xs text-gray-600 hover:text-amber-600 font-medium min-h-[44px]"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Voir la messagerie
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px]"
              >
                <Avatar src={user?.photo_profil || null} name={user?.nom_complet || ""} size="sm" version={user?.photo_profil_version} />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {user?.nom_complet || "Utilisateur"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role ? getRoleLabel(user.role) : ""}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href={`/dashboard/${user?.role || "chauffeur"}/profil`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4" />
                      Mon profil
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <LogoutModal
        open={showLogoutModal}
        onConfirm={() => { setShowLogoutModal(false); logout(); }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
