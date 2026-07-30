"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { conversationService } from "@/services/conversation.service";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getRoleLabel } from "@/lib/utils";
import {
  ArrowLeft,
  MessageSquare,
  Search,
  Send,
  Mic,
  Square,
  Trash2,
  Play,
  Pause,
  CheckCheck,
} from "lucide-react";
import type { Conversation, Message } from "@/types";

function AudioPlayer({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        onClick={toggle}
        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 hover:bg-white/30 transition-colors"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
      </button>
      <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-[11px] opacity-70 w-8 text-right shrink-0">
        {duration > 0 ? formatTime(duration - currentTime) : formatTime(duration)}
      </span>
    </div>
  );
}

function VoiceRecorder({ onSend, onCancel }: { onSend: (blob: Blob) => void; onCancel: () => void }) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
        mediaRecorder.current = mr;
        chunks.current = [];

        mr.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.current.push(e.data);
        };

        mr.onstop = () => {
          const blob = new Blob(chunks.current, { type: "audio/webm" });
          stream.getTracks().forEach((t) => t.stop());
          onSend(blob);
        };

        mr.start();
        setRecording(true);

        timerRef.current = setInterval(() => {
          setElapsed((prev) => prev + 1);
        }, 1000);
      })
      .catch(() => {
        onCancel();
      });

    return () => {
      clearInterval(timerRef.current);
      if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
        mediaRecorder.current.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const stopRecording = () => {
    clearInterval(timerRef.current);
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    setRecording(false);
  };

  const cancelRecording = () => {
    clearInterval(timerRef.current);
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stream.getTracks().forEach((t) => t.stop());
      mediaRecorder.current.stop();
    }
    setRecording(false);
    onCancel();
  };

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-red-50 rounded-xl border border-red-200">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm font-medium text-red-600">Enregistrement</span>
      </div>
      <span className="text-sm font-mono text-red-500">{formatElapsed(elapsed)}</span>
      <div className="flex items-center gap-1 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={cancelRecording}
          className="min-h-[36px] min-w-[36px] text-red-500 hover:text-red-700 hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={stopRecording}
          className="min-h-[36px] min-w-[36px] text-red-500 hover:text-red-700 hover:bg-red-100"
        >
          <Square className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [recording, setRecording] = useState(false);

  const selectedConvId = searchParams.get("conv") || null;
  const [mobileView, setMobileView] = useState<"list" | "chat">(
    selectedConvId ? "chat" : "list"
  );

  const { data: conversations, isLoading: convsLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => conversationService.list(),
    refetchInterval: 10000,
  });

  const { data: selectedConv } = useQuery({
    queryKey: ["conversation", selectedConvId],
    queryFn: () => conversationService.getById(selectedConvId!),
    enabled: !!selectedConvId,
  });

  const { data: messages, isLoading: msgsLoading } = useQuery({
    queryKey: ["conversation", selectedConvId, "messages"],
    queryFn: () =>
      conversationService.getMessages(selectedConvId!, { limit: 100 }),
    enabled: !!selectedConvId,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: (contenu: string) =>
      conversationService.sendMessage(selectedConvId!, { contenu }),
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({
        queryKey: ["conversation", selectedConvId, "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const sendAudioMutation = useMutation({
    mutationFn: (blob: Blob) =>
      conversationService.sendAudioMessage(selectedConvId!, blob),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", selectedConvId, "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const lireMutation = useMutation({
    mutationFn: (convId: string) => conversationService.lire(convId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "non-lues"] });
    },
  });

  const selectConversation = useCallback(
    (convId: string) => {
      router.replace(`/dashboard/chat?conv=${convId}`, { scroll: false });
      setMobileView("chat");
      lireMutation.mutate(convId);
    },
    [router, lireMutation]
  );

  const backToList = useCallback(() => {
    router.replace("/dashboard/chat", { scroll: false });
    setMobileView("list");
  }, [router]);

  const handleSend = () => {
    if (!messageInput.trim() || !selectedConvId) return;
    sendMutation.mutate(messageInput.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAudioSend = (blob: Blob) => {
    if (!selectedConvId) return;
    sendAudioMutation.mutate(blob);
    setRecording(false);
  };

  const handleAudioCancel = () => {
    setRecording(false);
  };

  const filteredConversations = conversations?.filter((c) => {
    if (!searchQuery) return true;
    const other = c.participants?.find((p) => p.id !== user?.id);
    const name = other?.nom_complet?.toLowerCase() || "";
    return (
      name.includes(searchQuery.toLowerCase()) ||
      c.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const otherParticipant = selectedConv?.participants?.find(
    (p) => p.id !== user?.id
  );

  const formatMsgTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const hours = d.getHours().toString().padStart(2, "0");
    const mins = d.getMinutes().toString().padStart(2, "0");
    return `${day}/${month} ${hours}:${mins}`;
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* ─── Sidebar: conversation list ─── */}
      <div
        className={`${
          mobileView === "list" ? "flex" : "hidden"
        } md:flex w-full md:w-80 border-r border-slate-200 flex-col shrink-0`}
      >
        <div className="p-3 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900 mb-3">Messagerie</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1" maxHeight="calc(100vh - 12rem)">
          {convsLoading ? (
            <div className="p-3 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations && filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const other = conv.participants?.find(
                (p) => p.id !== user?.id
              );
              const isActive = conv.id === selectedConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`w-full flex items-center gap-3 p-3 transition-colors border-b border-slate-100 text-left min-h-[60px] hover:bg-slate-50 ${
                    isActive ? "bg-slate-50" : ""
                  }`}
                >
                  <Avatar
                    src={other?.photo_profil}
                    name={other?.nom_complet || "Utilisateur"}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {other?.nom_complet || "Conversation"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {conv.last_message || "Aucun message"}
                    </p>
                  </div>
                  {conv.last_message_at && (
                    <span className="text-xs text-slate-400 shrink-0">
                      {formatMsgTime(conv.last_message_at)}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">Aucune conversation</p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* ─── Chat panel ─── */}
      <div
        className={`${
          mobileView === "chat" ? "flex" : "hidden"
        } md:flex flex-1 flex-col`}
      >
        {selectedConvId && selectedConv ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-3 border-b border-slate-200 bg-white">
              <Button
                variant="ghost"
                size="icon"
                onClick={backToList}
                className="min-h-[44px] min-w-[44px] shrink-0 md:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar
                src={otherParticipant?.photo_profil}
                name={otherParticipant?.nom_complet || "Utilisateur"}
                size="sm"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {otherParticipant?.nom_complet || "Conversation"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {otherParticipant?.role ? getRoleLabel(otherParticipant.role) : ""}
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea
              className="flex-1 p-3 sm:p-4 bg-slate-50/50"
              maxHeight="calc(100vh - 14rem)"
            >
              {msgsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
                    >
                      <Skeleton className="h-10 w-48 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-5">
                  {messages.map((msg: Message) => {
                    const isMine = msg.expediteur_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                      >
                        {/* Sender header */}
                        <div
                          className={`flex items-center gap-2 mb-1 ${
                            isMine ? "flex-row-reverse" : ""
                          }`}
                        >
                          <Avatar
                            src={isMine ? user?.photo_profil : msg.expediteur_avatar}
                            name={
                              isMine
                                ? user?.nom_complet || "Moi"
                                : msg.expediteur_nom || "Utilisateur"
                            }
                            size="sm"
                          />
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-medium text-slate-700">
                              {isMine
                                ? user?.nom_complet || "Moi"
                                : msg.expediteur_nom || "Utilisateur"}
                            </span>
                            <span className="text-slate-400">·</span>
                            <span className="text-slate-500">
                              {isMine
                                ? (user?.role ? getRoleLabel(user.role) : "")
                                : (msg.expediteur_role ? getRoleLabel(msg.expediteur_role) : "")}
                            </span>
                            <span className="text-slate-400">·</span>
                            <span className="text-slate-400">
                              {formatMsgTime(msg.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Message bubble */}
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] ${
                            isMine ? "mr-[34px]" : "ml-[34px]"
                          }`}
                        >
                          {msg.type === "audio" && msg.media_url ? (
                            <div
                              className={`rounded-2xl px-4 py-3 ${
                                isMine
                                  ? "bg-slate-700 text-white rounded-br-md"
                                  : "bg-white text-slate-900 rounded-bl-md border border-slate-200"
                              }`}
                            >
                              <AudioPlayer src={msg.media_url} />
                            </div>
                          ) : (
                            <div
                              className={`rounded-2xl px-4 py-2.5 ${
                                isMine
                                  ? "bg-slate-700 text-white rounded-br-md"
                                  : "bg-white text-slate-900 rounded-bl-md border border-slate-200"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {msg.contenu}
                              </p>
                            </div>
                          )}

                          {/* Lu indicator for sent messages */}
                          {isMine && (
                            <div className="flex justify-end mt-0.5 pr-1">
                              {msg.lu ? (
                                <span className="flex items-center gap-0.5 text-[10px] text-blue-500">
                                  <CheckCheck className="h-3 w-3" />
                                  Lu
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">
                                  <CheckCheck className="h-3 w-3 opacity-40" />
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm">
                    Aucun message. Commencez la conversation !
                  </p>
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-slate-200 bg-white">
              {recording ? (
                <VoiceRecorder onSend={handleAudioSend} onCancel={handleAudioCancel} />
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRecording(true)}
                    className="min-h-[44px] min-w-[44px] shrink-0 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                    title="Message vocal"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Écrire un message..."
                    className="flex-1 resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[44px] max-h-[120px] bg-slate-50"
                    rows={1}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!messageInput.trim() || sendMutation.isPending}
                    size="icon"
                    className="min-h-[44px] min-w-[44px] shrink-0 bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Placeholder when no conversation selected */
          <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50/50">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Sélectionnez une conversation pour commencer</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
