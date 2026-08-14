"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2, Square, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/chat-utils";
import AudioPlayer from "./AudioPlayer";

interface VoiceRecorderProps {
  onSend: (blob: Blob) => void;
  onCancel: () => void;
  sending?: boolean;
}

/**
 * Module vocal reconstruit (Module 6) :
 *  1. L'enregistrement ne démarre QUE sur le clic de l'utilisateur
 *     (autorisation getUserMedia demandée à ce moment-là).
 *  2. Enregistrement : indicateur rouge + chronomètre, boutons Annuler/Arrêter.
 *  3. Pré-écoute avant envoi : lecteur intégré + boutons Supprimer/Envoyer.
 */
export default function VoiceRecorder({
  onSend,
  onCancel,
  sending = false,
}: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const pendingBlobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanupTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      cleanupTracks();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone non supporté par ce navigateur.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime =
        typeof MediaRecorder !== "undefined" &&
        MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : undefined;
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        cleanupTracks();
        setRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
      mr.start();
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= 300) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setError(
        "Accès au microphone refusé. Autorisez le micro pour envoyer un message vocal."
      );
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.onstop = () => {
        cleanupTracks();
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size > 0) {
          pendingBlobRef.current = blob;
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(URL.createObjectURL(blob));
        }
      };
      mr.stop();
    }
  };

  const cancelRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.onstop = null;
      mr.stop();
    }
    cleanupTracks();
    setRecording(false);
    setError(null);
    onCancel();
  };

  const discardPreview = () => {
    pendingBlobRef.current = null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onCancel();
  };

  const sendPreview = () => {
    if (!previewUrl || !pendingBlobRef.current) return;
    const blob = pendingBlobRef.current;
    onSend(blob);
    pendingBlobRef.current = null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-red-50 rounded-xl border border-red-200">
      {error ? (
        <p className="text-sm text-red-600 flex-1">{error}</p>
      ) : recording ? (
        <>
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium text-red-600">
              Enregistrement
            </span>
          </div>
          <span className="text-sm font-mono text-red-500 shrink-0">
            {formatDuration(elapsed)}
          </span>
          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={cancelRecording}
              className="min-h-[36px] min-w-[36px] text-red-500 hover:text-red-700 hover:bg-red-100"
              aria-label="Annuler l'enregistrement"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={stopRecording}
              className="min-h-[36px] min-w-[36px] text-red-500 hover:text-red-700 hover:bg-red-100"
              aria-label="Arrêter l'enregistrement"
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : previewUrl ? (
        <>
          <span className="text-sm font-medium text-emerald-600 shrink-0">
            Pré-écoute
          </span>
          <div className="flex-1 bg-white rounded-xl border border-slate-200 px-2 py-1.5">
            <AudioPlayer src={previewUrl} compact isMine={false} withDownload />
          </div>
          <div className="flex items-center gap-1 ml-auto shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={discardPreview}
              disabled={sending}
              className="min-h-[36px] min-w-[36px] text-red-500 hover:text-red-700 hover:bg-red-100"
              aria-label="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={sendPreview}
              disabled={sending}
              className="min-h-[36px] bg-slate-800 hover:bg-slate-700 text-white"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="ml-1.5">Envoyer</span>
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-1">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-red-600">
              Prêt à enregistrer — cliquez sur le micro pour commencer
            </span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={cancelRecording}
              className="min-h-[36px] min-w-[36px] text-red-500 hover:text-red-700 hover:bg-red-100"
              aria-label="Fermer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={startRecording}
              className="min-h-[36px] min-w-[36px] text-red-500 hover:text-red-700 hover:bg-red-100"
              aria-label="Démarrer l'enregistrement"
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

