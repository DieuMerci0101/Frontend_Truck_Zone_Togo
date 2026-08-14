"use client";

import { useRef, useState } from "react";
import { Play, Pause, Download } from "lucide-react";
import { formatDuration } from "@/lib/chat-utils";

interface AudioPlayerProps {
  src: string;
  /** Variante de style : dans une bulle reçue (fond blanc) ou envoyée (fond sombre). */
  isMine?: boolean;
  /** Autorise le téléchargement du fichier audio. */
  withDownload?: boolean;
  /** Label optionnel pour la pré-écoute avant envoi. */
  compact?: boolean;
}

/**
 * Lecteur audio personnalisé (Module 6) :
 * Play / Pause, barre de progression, durée restante et téléchargement.
 */
export default function AudioPlayer({
  src,
  isMine = false,
  withDownload = false,
  compact = false,
}: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio.play();
      setPlaying(true);
    }
  };

  const progress =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const dark = isMine ? "bg-white/20" : "bg-slate-200";
  const fill = isMine ? "bg-white" : "bg-amber-500";
  const text = isMine ? "text-white/90" : "text-slate-700";
  const time = isMine ? "text-white/60" : "text-slate-500";

  return (
    <div
      className={`flex items-center gap-2 ${compact ? "" : "min-w-[190px]"} ${
        withDownload ? "pr-1" : ""
      }`}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onEnded={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        onClick={toggle}
        aria-label={playing ? "Pause" : "Lire"}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          dark
        } ${isMine ? "hover:bg-white/30" : "hover:bg-slate-300"} ${text}`}
      >
        {playing ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </button>
      <div
        className={`flex-1 h-1.5 rounded-full overflow-hidden ${dark}`}
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          const audio = audioRef.current;
          if (!audio || !duration) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          audio.currentTime = ratio * duration;
          setCurrentTime(ratio * duration);
        }}
      >
        <div
          className={`h-full rounded-full transition-all duration-100 ${fill}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className={`text-[11px] w-11 text-right shrink-0 ${time}`}>
        {duration > 0
          ? `${formatDuration(currentTime)}/${formatDuration(duration)}`
          : "--:--"}
      </span>
      {withDownload && (
        <a
          href={src}
          download
          title="Télécharger l'audio"
          className={`p-1.5 rounded-lg shrink-0 transition-colors ${
            isMine
              ? "text-white/60 hover:text-white hover:bg-white/20"
              : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
          }`}
        >
          <Download className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
