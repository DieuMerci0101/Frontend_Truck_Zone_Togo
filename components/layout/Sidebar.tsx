"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getRoleLabel } from "@/lib/utils";

const menuItems: Record<string, { label: string; href: string }[]> = {
  chauffeur: [
    { label: "Tableau de bord", href: "/dashboard/chauffeur" },
    { label: "Mon profil", href: "/dashboard/chauffeur/profil" },
    { label: "Mes documents", href: "/dashboard/chauffeur/documents" },
    { label: "Offres disponibles", href: "/dashboard/chauffeur/offres" },
    { label: "Incidents", href: "/dashboard/chauffeur/incidents" },
    { label: "Messagerie", href: "/dashboard/chat" },
  ],
  proprietaire: [
    { label: "Tableau de bord", href: "/dashboard/proprietaire" },
    { label: "Mon profil", href: "/dashboard/proprietaire/profil" },
    { label: "Mes camions", href: "/dashboard/proprietaire/camions" },
    { label: "Mes offres", href: "/dashboard/proprietaire/offres" },
    { label: "Rechercher chauffeurs", href: "/dashboard/proprietaire/chauffeurs" },
    { label: "Incidents", href: "/dashboard/proprietaire/incidents" },
    { label: "Messagerie", href: "/dashboard/chat" },
  ],
  mecanicien: [
    { label: "Tableau de bord", href: "/dashboard/mecanicien" },
    { label: "Mon profil", href: "/dashboard/mecanicien/profil" },
    { label: "Demandes d'assistance", href: "/dashboard/mecanicien/assistance" },
    { label: "Messagerie", href: "/dashboard/chat" },
  ],
  admin: [
    { label: "Tableau de bord", href: "/admin/dashboard" },
    { label: "Utilisateurs", href: "/admin/dashboard/utilisateurs" },
    { label: "Documents", href: "/admin/dashboard/documents" },
    { label: "Incidents", href: "/admin/dashboard/incidents" },
    { label: "Messagerie", href: "/dashboard/chat" },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const user = getUser();
  const role = String(user?.role || "chauffeur").toLowerCase();
  const items = menuItems[role] || menuItems.chauffeur;

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden shrink-0">
            <img src="/logo1.jpeg" alt="Togo Truck Connect" className="h-8 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Togo Truck Connect</h1>
            <p className="text-sm text-gray-400 mt-1">{getRoleLabel(role)}</p>
          </div>
        </div>
      </div>
      <nav>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
              pathname === item.href
                ? "bg-blue-700 text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
