"use client";

import { X, Reply } from "lucide-react";
import type { Message } from "@/types";
import { messagePreview } from "@/lib/chat-utils";

/**
 * Bloc « Réponse à [Auteur] : [aperçu] » affiché au-dessus du champ de saisie
 * quand un message est cité. Fermeture par la croix.
 */
export default function ReplyPreview({
  message,
  isMine,
  onCancel,
}: {
  message: Message;
  isMine: boolean;
  onCancel: () => void;
}) {
  const author = message.expediteur_nom || "Utilisateur";

  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 mb-2 border ${
        isMine
          ? "bg-slate-100 border-slate-200"
          : "bg-amber-50 border-amber-200"
      }`}
    >
      <div
        className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
          isMine ? "bg-slate-200 text-slate-600" : "bg-amber-100 text-amber-600"
        }`}
      >
        <Reply className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-700 truncate">
          Réponse à {author}
        </p>
        <p className="text-xs text-slate-500 truncate">
          {messagePreview(message)}
        </p>
      </div>
      <button
        onClick={onCancel}
        aria-label="Annuler la réponse"
        className="shrink-0 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
