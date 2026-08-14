"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getRoleLabel } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { LogoutModal } from "@/components/ui/logout-modal";
import {
  LayoutDashboard,
  User,
  FileText,
  ToggleLeft,
  MessageSquare,
  Briefcase,
  AlertTriangle,
  Bell,
  Settings,
  Truck,
  Users,
  Wrench,
  Headphones,
  MapPin,
  BarChart3,
  LogOut,
  X,
} from "lucide-react";
import type { UserRole } from "@/types";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const menuByRole: Record<UserRole, MenuItem[]> = {
  chauffeur: [
    { label: "Dashboard", href: "/dashboard/chauffeur", icon: LayoutDashboard },
    { label: "Profil", href: "/dashboard/chauffeur/profil", icon: User },
    { label: "Camions publics", href: "/dashboard/chauffeur/camions-publics", icon: Truck },
    { label: "Documents", href: "/dashboard/chauffeur/documents", icon: FileText },
    { label: "Messagerie", href: "/dashboard/chat", icon: MessageSquare },
    { label: "Offres", href: "/dashboard/chauffeur/offres", icon: Briefcase },
    { label: "Assistance", href: "/dashboard/chauffeur/assistance", icon: Headphones },
    { label: "Incidents", href: "/dashboard/chauffeur/incidents", icon: AlertTriangle },
    { label: "Notifications", href: "/dashboard/parametres/notifications", icon: Bell },
  ],
  proprietaire: [
    { label: "Dashboard", href: "/dashboard/proprietaire", icon: LayoutDashboard },
    { label: "Profil", href: "/dashboard/proprietaire/profil", icon: User },
    { label: "Camions", href: "/dashboard/proprietaire/camions", icon: Truck },
    { label: "Offres", href: "/dashboard/proprietaire/offres", icon: Briefcase },
    { label: "Chauffeurs", href: "/dashboard/proprietaire/chauffeurs", icon: Users },
    { label: "Documents", href: "/dashboard/proprietaire/documents", icon: FileText },
    { label: "Messagerie", href: "/dashboard/chat", icon: MessageSquare },
    { label: "Assistance", href: "/dashboard/proprietaire/assistance", icon: Headphones },
    { label: "Incidents", href: "/dashboard/proprietaire/incidents", icon: AlertTriangle },
    { label: "Notifications", href: "/dashboard/parametres/notifications", icon: Bell },
  ],
  mecanicien: [
    { label: "Dashboard", href: "/dashboard/mecanicien", icon: LayoutDashboard },
    { label: "Profil", href: "/dashboard/mecanicien/profil", icon: User },
    { label: "Spécialités", href: "/dashboard/mecanicien/specialites", icon: Wrench },
    { label: "Assistance", href: "/dashboard/mecanicien/assistance", icon: Headphones },
    { label: "Messagerie", href: "/dashboard/chat", icon: MessageSquare },
    { label: "Localisation", href: "/dashboard/mecanicien/localisation", icon: MapPin },
    { label: "Notifications", href: "/dashboard/parametres/notifications", icon: Bell },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Utilisateurs", href: "/admin/dashboard/utilisateurs", icon: Users },
    { label: "Documents", href: "/admin/dashboard/documents", icon: FileText },
    { label: "Incidents", href: "/admin/dashboard/incidents", icon: AlertTriangle },
    { label: "Assistance", href: "/admin/dashboard/assistance", icon: Headphones },
    { label: "Notifications", href: "/admin/dashboard/notifications", icon: BarChart3 },
    { label: "Statistiques", href: "/admin/dashboard", icon: BarChart3 },
    { label: "Profil", href: "/admin/dashboard/profil", icon: User },
  ],
};

interface DashboardSidebarProps {
  user: { id: string; nom_complet: string; email: string; role: UserRole; photo_profil?: string | null; photo_profil_version?: number } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ user, isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const role = String(user?.role || "chauffeur").toLowerCase() as UserRole;
  const items = menuByRole[role] || menuByRole.chauffeur;

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    onClose();
    logout();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden">
            <img src="/logo1.jpeg" alt="Togo Truck Connect" className="h-6 w-auto object-contain" />
          </div>
          <span className="text-lg font-bold text-white">TTC</span>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <ScrollArea className="flex-1 py-3" maxHeight="calc(100vh - 160px)">
        <nav className="space-y-1 px-3">
          {items.map((item) => {
            const isActive =
              item.href === `/dashboard/${role}`
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                  <item.icon className="h-5 w-5 shrink-0 text-gray-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar src={user?.photo_profil || null} name={user?.nom_complet || ""} size="sm" version={user?.photo_profil_version} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.nom_complet || "Utilisateur"}
            </p>
            <Badge variant="info" className="mt-0.5 text-[10px]">
              {getRoleLabel(role)}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLogoutModal(true)}
          className="w-full text-gray-400 hover:text-white hover:bg-gray-800 justify-start min-h-[44px]"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-gray-900 min-h-screen fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 w-64 max-w-[85vw] bg-gray-900 z-50 transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      <LogoutModal
        open={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
