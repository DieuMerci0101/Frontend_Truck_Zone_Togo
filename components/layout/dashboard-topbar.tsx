"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogoutModal } from "@/components/ui/logout-modal";
import { notificationService } from "@/services/notification.service";
import { getRoleLabel } from "@/lib/utils";
import { Menu, Bell, ChevronDown, LogOut, User } from "lucide-react";

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

export function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ["notifications", "non-lues"],
    queryFn: () => notificationService.getNonLues(),
    refetchInterval: 30000,
  });

  const unreadCount = notifData?.non_lues || 0;

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
            <Link href="/dashboard/chat">
              <Button variant="ghost" size="icon" className="relative min-w-[44px] min-h-[44px]">
                <Bell className="h-5 w-5 text-gray-500" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </Link>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px]"
              >
                <Avatar src={user?.photo_profil || null} name={user?.nom_complet || ""} size="sm" />
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
