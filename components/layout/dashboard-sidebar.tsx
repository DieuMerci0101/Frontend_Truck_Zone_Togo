"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
    { label: "Paramètres", href: "/dashboard/parametres", icon: Settings },
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
    { label: "Paramètres", href: "/dashboard/parametres", icon: Settings },
  ],
  mecanicien: [
    { label: "Dashboard", href: "/dashboard/mecanicien", icon: LayoutDashboard },
    { label: "Profil", href: "/dashboard/mecanicien/profil", icon: User },
    { label: "Spécialités", href: "/dashboard/mecanicien/specialites", icon: Wrench },
    { label: "Assistance", href: "/dashboard/mecanicien/assistance", icon: Headphones },
    { label: "Messagerie", href: "/dashboard/chat", icon: MessageSquare },
    { label: "Localisation", href: "/dashboard/mecanicien/profil", icon: MapPin },
    { label: "Paramètres", href: "/dashboard/parametres", icon: Settings },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Utilisateurs", href: "/dashboard/admin/utilisateurs", icon: Users },
    { label: "Documents", href: "/dashboard/admin/documents", icon: FileText },
    { label: "Incidents", href: "/dashboard/admin/incidents", icon: AlertTriangle },
    { label: "Assistance", href: "/dashboard/admin/assistance", icon: Headphones },
    { label: "Notifications", href: "/dashboard/admin/notifications", icon: BarChart3 },
    { label: "Statistiques", href: "/dashboard/admin", icon: BarChart3 },
    { label: "Paramètres", href: "/dashboard/parametres", icon: Settings },
  ],
};

interface DashboardSidebarProps {
  user: { id: string; nom_complet: string; email: string; role: UserRole; photo_profil?: string | null } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ user, isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const role = user?.role || "chauffeur";
  const items = menuByRole[role];

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    onClose();
    logout();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-blue-400" />
          <span className="text-xl font-bold text-white">TTC</span>
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
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar src={user?.photo_profil || null} name={user?.nom_complet || ""} size="sm" />
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
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 max-w-[85vw] bg-gray-900 z-50 lg:hidden overflow-y-auto"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <LogoutModal
        open={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
