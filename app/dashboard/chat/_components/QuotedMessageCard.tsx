"use client";

import { FileText, Image as ImageIcon, Video, Mic, MessageSquare } from "lucide-react";
import type { Message } from "@/types";
import { messagePreview } from "@/lib/chat-utils";

/**
 * Carte miniature du message cité (Reply-To), affichée dans la bulle.
 * Cliquable : fait défiler vers le message d'origine.
 */
export default function QuotedMessageCard({
  message,
  isMine,
  onClick,
}: {
  message: Message;
  isMine: boolean;
  onClick?: () => void;
}) {
  const icon =
    message.type === "image" ? (
      <ImageIcon className="h-3.5 w-3.5" />
    ) : message.type === "video" ? (
      <Video className="h-3.5 w-3.5" />
    ) : message.type === "audio" ? (
      <Mic className="h-3.5 w-3.5" />
    ) : message.type === "fichier" ? (
      <FileText className="h-3.5 w-3.5" />
    ) : (
      <MessageSquare className="h-3.5 w-3.5" />
    );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-start gap-2 rounded-lg px-3 py-2 mb-1.5 transition-colors ${
        isMine
          ? "bg-white/10 hover:bg-white/20"
          : "bg-slate-100 hover:bg-slate-200"
      }`}
    >
      <div
        className={`mt-0.5 shrink-0 w-6 h-6 rounded-md flex items-center justify-center ${
          isMine ? "bg-white/20 text-white" : "bg-amber-100 text-amber-600"
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-[11px] font-semibold truncate ${
            isMine ? "text-white/80" : "text-slate-600"
          }`}
        >
          {message.expediteur_nom || "Utilisateur"}
        </p>
        <p
          className={`text-xs truncate ${
            isMine ? "text-white/90" : "text-slate-700"
          }`}
        >
          {messagePreview(message)}
        </p>
      </div>
    </button>
  );
}
