"use client";

import { useEffect } from "react";
import { X, Download, FileText, File as FileIcon } from "lucide-react";
import { fileNameFromUrl } from "@/lib/chat-utils";

export interface LightboxMedia {
  type: "image" | "video" | "fichier";
  url: string;
  title: string;
}

/**
 * Visionneuse plein écran intégrée (Module 6) :
 *  - images / vidéos en modal plein écran
 *  - documents (PDF…) en modal avec iframe + téléchargement
 * Jamais d'onglet externe : fermeture par X, clic à l'extérieur ou Échap.
 */
export default function Lightbox({
  media,
  onClose,
}: {
  media: LightboxMedia;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const isPdf =
    media.type === "fichier" && media.url.toLowerCase().endsWith(".pdf");

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Barre supérieure */}
      <div className="flex items-center justify-between shrink-0 mb-3">
        <p className="text-white text-sm font-medium truncate max-w-[70%]">
          {media.title}
        </p>
        <div className="flex items-center gap-2">
          <a
            href={media.url}
            download
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 transition-colors"
            title="Télécharger"
          >
            <Download className="h-4 w-4" />
            Télécharger
          </a>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 hover:bg-white/20 text-white p-2.5 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Contenu central */}
      <div
        className="flex-1 flex items-center justify-center min-h-0"
        onClick={onClose}
      >
        {media.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.url}
            alt={media.title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        ) : media.type === "video" ? (
          <video
            src={media.url}
            controls
            autoPlay
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-lg bg-black"
          />
        ) : isPdf ? (
          <iframe
            src={media.url}
            title={media.title}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-full rounded-lg bg-white"
          />
        ) : (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-4 text-white max-w-md text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
              <FileIcon className="h-10 w-10 text-white/80" />
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-white/60" />
              <p className="text-sm text-white/80 break-all">{media.title}</p>
            </div>
            <p className="text-xs text-white/50">
              Ce format n&apos;est pas affichable dans la visionneuse.
              Téléchargez le fichier pour le consulter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
