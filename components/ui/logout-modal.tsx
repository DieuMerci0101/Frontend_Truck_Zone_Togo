"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

interface LogoutModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutModal({ open, onConfirm, onCancel }: LogoutModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
      } else if (e.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    confirmRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Confirmer la déconnexion
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          Voulez-vous vraiment vous déconnecter ?
        </p>
        <p className="text-xs text-gray-400 mb-6">
          Appuyez sur <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono">Entrée</kbd> pour confirmer ou <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono">Échap</kbd> pour annuler
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            Non, rester
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className="flex-1 px-4 py-3.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/25 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Oui, déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
