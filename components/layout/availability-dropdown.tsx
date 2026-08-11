"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { chauffeurService } from "@/services/chauffeur.service";
import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";
import type { DisponibiliteChauffeur } from "@/types";

const STATUS_CONFIG: Record<
  DisponibiliteChauffeur,
  { label: string; emoji: string; dot: string; badge: string }
> = {
  disponible: {
    label: "Disponible",
    emoji: "🟢",
    dot: "bg-emerald-500",
    badge: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  en_mission: {
    label: "En mission",
    emoji: "🔴",
    dot: "bg-red-500",
    badge: "text-red-700 bg-red-50 border-red-200",
  },
  indisponible: {
    label: "Non disponible",
    emoji: "⚪",
    dot: "bg-slate-400",
    badge: "text-slate-600 bg-slate-50 border-slate-200",
  },
};

const ORDER: DisponibiliteChauffeur[] = ["disponible", "en_mission", "indisponible"];

export function AvailabilityDropdown() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["chauffeur", "profile"],
    queryFn: () => chauffeurService.getMyProfile(),
    refetchInterval: 15000,
    retry: 1,
  });

  const current = (profile?.disponibilite || "disponible") as DisponibiliteChauffeur;
  const config = STATUS_CONFIG[current];

  const updateMutation = useMutation({
    mutationFn: (statut: DisponibiliteChauffeur) =>
      chauffeurService.updateStatut({ disponibilite: statut }),
    onSuccess: (data) => {
      toast.success(data.message || "Disponibilité mise à jour");
      queryClient.invalidateQueries({ queryKey: ["chauffeur", "profile"] });
      setOpen(false);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      toast.error(e?.response?.data?.detail || e?.message || "Erreur lors de la mise à jour du statut");
    },
  });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Changer ma disponibilité"
        aria-expanded={open}
        title={config.label}
        className={cn(
          "flex items-center gap-2 rounded-lg border px-2.5 sm:px-3 py-2 text-sm font-medium transition-colors min-h-[44px]",
          config.badge
        )}
      >
        <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", config.dot)} />
        <span className="hidden md:inline">{config.label}</span>
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
            <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Ma disponibilité
            </p>
            {ORDER.map((key) => {
              const opt = STATUS_CONFIG[key];
              const isActive = current === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (isActive || updateMutation.isPending) return;
                    updateMutation.mutate(key);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors min-h-[44px]",
                    isActive
                      ? "bg-slate-50 font-semibold text-slate-900"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <span aria-hidden="true">{opt.emoji}</span>
                  <span className="flex-1 text-left">{opt.label}</span>
                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
