"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { authService } from "@/services/auth.service";
import {
  removeToken,
  removeUser,
  removeRefreshToken,
  removeTokenCookie,
  removeUserCookie,
} from "@/lib/auth";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";
import {
  LayoutDashboard,
  FileCheck2,
  Headphones,
  AlertTriangle,
  Users,
  Bell,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Vérification des documents (KYC)", href: "/admin/dashboard/documents", icon: FileCheck2 },
  { label: "Assistances mécaniques", href: "/admin/dashboard/assistance", icon: Headphones },
  { label: "Gestion des incidents", href: "/admin/dashboard/incidents", icon: AlertTriangle },
  { label: "Utilisateurs", href: "/admin/dashboard/utilisateurs", icon: Users },
  { label: "Notifications", href: "/admin/dashboard/notifications", icon: Bell },
  { label: "Profil", href: "/admin/dashboard/profil", icon: UserIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLogin = pathname === "/admin/login";

  // Garde-fou côté client (le middleware protège déjà /admin côté serveur).
  useEffect(() => {
    if (isLogin || isLoading) return;
    if (!user || String(user.role).toLowerCase() !== "admin") {
      router.replace("/admin/login");
    }
  }, [user, isLoading, isLogin, router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    removeToken();
    removeUser();
    removeRefreshToken();
    removeTokenCookie();
    removeUserCookie();
    router.replace("/");
  };

  if (isLogin) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-9 h-9 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo1.jpeg" alt="Togo Truck Connect" className="h-7 w-auto object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">Togo Truck Connect</p>
            <p className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Espace Admin
            </p>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
                isActive
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar src={user?.photo_profil || null} name={user?.nom_complet || "Admin"} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.nom_complet || "Administrateur"}
            </p>
            <p className="text-[11px] font-semibold text-amber-400">Administrateur</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors min-h-[44px]"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 min-h-screen fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Sidebar mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 left-0 w-64 max-w-[85vw] bg-slate-900 z-50 transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Barre d'en-tête */}
        <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between gap-3 px-4 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-600 hover:bg-gray-100"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-bold text-slate-900 truncate">
                Dashboard Administrateur
              </p>
              <p className="text-xs text-slate-500 hidden sm:block">
                Gestion complète de la plateforme Togo Truck Connect
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-slate-900 truncate max-w-[180px]">
                {user?.nom_complet || "Administrateur"}
              </p>
              <p className="text-[11px] font-semibold text-amber-600">Administrateur</p>
            </div>
            <Avatar src={user?.photo_profil || null} name={user?.nom_complet || "Admin"} size="sm" />
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-colors min-h-[36px]"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </header>

        <main className="p-3 sm:p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
