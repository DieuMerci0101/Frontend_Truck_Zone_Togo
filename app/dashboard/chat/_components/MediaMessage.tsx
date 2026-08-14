"use client";

import { useState } from "react";
import { Play, Download, FileText } from "lucide-react";
import type { Message } from "@/types";
import { fileNameFromUrl } from "@/lib/chat-utils";
import QuotedMessageCard from "./QuotedMessageCard";
import Lightbox, { type LightboxMedia } from "./Lightbox";

/**
 * Bulle média (image / vidéo / document) avec :
 *  - thumbnail intégré (jamais d'onglet externe) → ouvre la Lightbox
 *  - carte du message cité (Reply-To)
 *  - carte document : icône + nom + téléchargement + visionneuse intégrée
 */
export default function MediaMessage({
  msg,
  isMine,
  onQuoteClick,
}: {
  msg: Message;
  isMine: boolean;
  onQuoteClick?: (message: Message) => void;
}) {
  const [lightbox, setLightbox] = useState<LightboxMedia | null>(null);

  const base = isMine
    ? "bg-slate-700 text-white rounded-br-md"
    : "bg-white text-slate-900 rounded-bl-md border border-slate-200";

  const title = fileNameFromUrl(msg.media_url || "");

  if (msg.type === "image" && msg.media_url) {
    return (
      <div className={`rounded-2xl p-1.5 ${base} overflow-hidden`}>
        <button
          type="button"
          onClick={() =>
            setLightbox({ type: "image", url: msg.media_url!, title })
          }
          className="block w-full text-left"
          title="Afficher en plein écran"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={msg.media_url}
            alt="Photo"
            className="max-h-72 max-w-full rounded-xl object-cover"
          />
        </button>
        {msg.reply_to && (
          <QuotedMessageCard
            message={msg.reply_to}
            isMine={isMine}
            onClick={() => onQuoteClick?.(msg.reply_to!)}
          />
        )}
        {msg.contenu && (
          <p className="text-sm px-2 py-1.5 whitespace-pre-wrap break-words">
            {msg.contenu}
          </p>
        )}
        {lightbox && (
          <Lightbox media={lightbox} onClose={() => setLightbox(null)} />
        )}
      </div>
    );
  }

  if (msg.type === "video" && msg.media_url) {
    return (
      <div className={`rounded-2xl p-1.5 ${base} overflow-hidden`}>
        <button
          type="button"
          onClick={() =>
            setLightbox({ type: "video", url: msg.media_url!, title })
          }
          className="relative block w-full text-left group"
          title="Lire la vidéo en plein écran"
        >
          <video
            src={msg.media_url}
            preload="metadata"
            playsInline
            className="max-h-72 max-w-full rounded-xl bg-black"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-12 h-12 rounded-full bg-black/50 group-hover:bg-black/70 flex items-center justify-center transition-colors">
              <Play className="h-6 w-6 text-white ml-0.5" />
            </span>
          </span>
        </button>
        {msg.reply_to && (
          <QuotedMessageCard
            message={msg.reply_to}
            isMine={isMine}
            onClick={() => onQuoteClick?.(msg.reply_to!)}
          />
        )}
        {msg.contenu && (
          <p className="text-sm px-2 py-1.5 whitespace-pre-wrap break-words">
            {msg.contenu}
          </p>
        )}
        {lightbox && (
          <Lightbox media={lightbox} onClose={() => setLightbox(null)} />
        )}
      </div>
    );
  }

  if (msg.type === "fichier" && msg.media_url) {
    return (
      <div className={`rounded-2xl overflow-hidden ${base}`}>
        <button
          type="button"
          onClick={() =>
            setLightbox({ type: "fichier", url: msg.media_url!, title })
          }
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:opacity-90 transition-opacity min-w-[240px]"
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isMine ? "bg-white/20" : "bg-amber-100"
            }`}
          >
            <FileText
              className={`h-5 w-5 ${isMine ? "text-white" : "text-amber-600"}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{title}</p>
            {msg.contenu && (
              <p className="text-xs opacity-80 truncate">{msg.contenu}</p>
            )}
          </div>
          <span
            className={`shrink-0 flex items-center gap-1 text-xs ${
              isMine ? "text-white/70" : "text-slate-400"
            }`}
          >
            <Download className="h-4 w-4" />
            Ouvrir
          </span>
        </button>
        {msg.reply_to && (
          <div className="px-3 pb-2">
            <QuotedMessageCard
              message={msg.reply_to}
              isMine={isMine}
              onClick={() => onQuoteClick?.(msg.reply_to!)}
            />
          </div>
        )}
        {lightbox && (
          <Lightbox media={lightbox} onClose={() => setLightbox(null)} />
        )}
      </div>
    );
  }

  return null;
}
