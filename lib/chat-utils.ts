import type { Message, TypeMessage } from "@/types";

/** Extrait le nom de fichier d'une URL média. */
export function fileNameFromUrl(url: string): string {
  try {
    const name = decodeURIComponent(url.split("/").pop() || "document");
    return name || "document";
  } catch {
    return "document";
  }
}

/** Formate une taille en octets en libellé lisible (Ko / Mo). */
export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/** Libellé court d'un message pour la carte de citation (Reply-To). */
export function messagePreview(msg: Message | null | undefined): string {
  if (!msg) return "";
  if (msg.contenu && msg.contenu.trim()) return msg.contenu;
  const labels: Record<TypeMessage, string> = {
    audio: "🎤 Message vocal",
    image: "📷 Photo",
    video: "🎬 Vidéo",
    fichier: "📎 Document",
    texte: "Message",
  };
  return labels[msg.type] || "Message";
}

/** Format d'heure pour les messages : JJ/MM HH:MM. */
export function formatMsgTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${day}/${month} ${hours}:${mins}`;
}

/** Durée MM:SS. */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
