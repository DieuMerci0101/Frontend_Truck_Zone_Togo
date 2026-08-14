"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { conversationService } from "@/services/conversation.service";
import { socketService } from "@/services/socket.service";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getRoleLabel } from "@/lib/utils";
import { formatMsgTime } from "@/lib/chat-utils";
import AudioPlayer from "./_components/AudioPlayer";
import VoiceRecorder from "./_components/VoiceRecorder";
import MediaMessage from "./_components/MediaMessage";
import ReplyPreview from "./_components/ReplyPreview";
import QuotedMessageCard from "./_components/QuotedMessageCard";
import {
  ArrowLeft,
  MessageSquare,
  Search,
  Send,
  Mic,
  Paperclip,
  Reply,
  CheckCheck,
  Loader2,
} from "lucide-react";
import type { Message } from "@/types";

interface ReceiveMessagePayload extends Message {}

interface TypingPayload {
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
}

interface ReadStatusPayload {
  conversation_id: string;
  reader_id: string;
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [otherTyping, setOtherTyping] = useState(false);

  const selectedConvId = searchParams.get("conv") || null;
  const recipientId = searchParams.get("recipientId") || null;
  const [mobileView, setMobileView] = useState<"list" | "chat">(
    selectedConvId ? "chat" : "list"
  );

  const { data: conversations, isLoading: convsLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => conversationService.list(),
    refetchInterval: 15000,
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
    // Le temps réel via Socket.io remplace le polling ; ce refetch reste un
    // filet de sécurité (synchronisation multi-onglets / reprise réseau).
    refetchInterval: 60000,
  });

  const otherParticipant = selectedConv?.participants?.find(
    (p) => p.id !== user?.id
  );

  /** Ajoute un message à l'historique local, sans doublon (temps réel + REST). */
  const appendMessage = useCallback(
    (msg: Message) => {
      queryClient.setQueryData<Message[]>(
        ["conversation", msg.conversation_id, "messages"],
        (old) => {
          if (!old) return [msg];
          if (old.some((m) => m.id === msg.id)) return old;
          const next = [...old, msg].sort(
            (a, b) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          return next;
        }
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "non-lues"] });
      if (msg.conversation_id === selectedConvId) {
        requestAnimationFrame(() =>
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        );
      }
    },
    [queryClient, selectedConvId]
  );

  // ─── Temps réel (Socket.io) ───────────────────────────────
  useEffect(() => {
    if (!selectedConvId) return;

    const onReceive = (payload: unknown) => {
      appendMessage(payload as ReceiveMessagePayload);
    };
    const onTyping = (payload: unknown) => {
      const p = payload as TypingPayload;
      if (String(p.conversation_id) !== selectedConvId) return;
      setOtherTyping(p.is_typing && p.user_id !== user?.id);
    };
    const onReadStatus = (payload: unknown) => {
      const p = payload as ReadStatusPayload;
      if (String(p.conversation_id) !== selectedConvId) return;
      if (p.reader_id === user?.id) return;
      queryClient.setQueryData<Message[]>(
        ["conversation", selectedConvId, "messages"],
        (old) =>
          old
            ? old.map((m) =>
                m.expediteur_id === user?.id ? { ...m, lu: true } : m
              )
            : old
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    socketService.on("receive_message", onReceive);
    socketService.on("typing", onTyping);
    socketService.on("read_status", onReadStatus);
    socketService.joinRoom(selectedConvId);

    // Signale la lecture après un court délai (laisse le temps au cache de se remplir).
    const t = setTimeout(() => {
      socketService.markRead(selectedConvId!);
    }, 600);

    return () => {
      clearTimeout(t);
      socketService.off("receive_message", onReceive);
      socketService.off("typing", onTyping);
      socketService.off("read_status", onReadStatus);
      socketService.leaveRoom(selectedConvId);
    };
  }, [selectedConvId, user?.id, queryClient, appendMessage]);

  // ─── Envoi texte (Socket.io d'abord, REST en repli) ────────
  const sendMutation = useMutation({
    mutationFn: async (contenu: string) => {
      const payload = {
        conversation_id: selectedConvId!,
        contenu,
        reply_to_message_id: replyTo?.id ?? null,
      };
      if (socketService.isConnected) {
        try {
          const ack = await socketService.emitWithAck<{
            ok?: boolean;
            error?: string;
            message?: Message;
          }>("send_message", payload);
          if (ack?.ok && ack.message) return ack.message;
          if (ack?.error) throw new Error(ack.error);
        } catch {
          // Repli REST si le temps réel a échoué.
        }
      }
      return conversationService.sendMessage(selectedConvId!, {
        contenu,
        reply_to_message_id: replyTo?.id ?? null,
      });
    },
    onSuccess: (msg?: Message) => {
      setMessageInput("");
      setReplyTo(null);
      if (msg) appendMessage(msg);
      queryClient.invalidateQueries({
        queryKey: ["conversation", selectedConvId, "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      toast.error(e?.response?.data?.detail || e?.message || "Envoi impossible");
    },
  });

  // ─── Envoi audio ───────────────────────────────────────────
  const sendAudioMutation = useMutation({
    mutationFn: (blob: Blob) =>
      conversationService.sendAudioMessage(
        selectedConvId!,
        blob,
        undefined,
        replyTo?.id ?? null
      ),
    onSuccess: (msg?: Message) => {
      setRecording(false);
      setReplyTo(null);
      if (msg) appendMessage(msg);
      queryClient.invalidateQueries({
        queryKey: ["conversation", selectedConvId, "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      toast.error(e?.response?.data?.detail || e?.message || "Envoi du vocal impossible");
      setRecording(false);
    },
  });

  // ─── Envoi média ───────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendMediaMutation = useMutation({
    mutationFn: (file: File) =>
      conversationService.sendMediaMessage(
        selectedConvId!,
        file,
        undefined,
        replyTo?.id ?? null
      ),
    onSuccess: (msg?: Message) => {
      setReplyTo(null);
      if (msg) appendMessage(msg);
      queryClient.invalidateQueries({
        queryKey: ["conversation", selectedConvId, "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      toast.error(e?.response?.data?.detail || e?.message || "Envoi du fichier impossible");
    },
  });

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !selectedConvId) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (maximum 25 Mo)");
      return;
    }
    sendMediaMutation.mutate(file);
  };

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
      setReplyTo(null);
      lireMutation.mutate(convId);
    },
    [router, lireMutation]
  );

  // Ouverture de la messagerie directe via ?recipientId={userId} :
  // crée / récupère la conversation avec ce destinataire puis la sélectionne.
  const initiateMutation = useMutation({
    mutationFn: (participant_id: string) =>
      conversationService.initiate({ participant_id }),
    onSuccess: (conv) => {
      router.replace(`/dashboard/chat?conv=${conv.id}`, { scroll: false });
      setMobileView("chat");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      lireMutation.mutate(conv.id);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      toast.error(e?.response?.data?.detail || e?.message || "Impossible d'ouvrir la conversation");
      router.replace("/dashboard/chat", { scroll: false });
    },
  });

  useEffect(() => {
    if (!recipientId || selectedConvId) return;
    initiateMutation.mutate(recipientId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientId, selectedConvId]);

  const backToList = useCallback(() => {
    router.replace("/dashboard/chat", { scroll: false });
    setMobileView("list");
  }, [router]);

  const handleSend = () => {
    if (!messageInput.trim() || !selectedConvId) return;
    socketService.sendTyping(selectedConvId, false);
    sendMutation.mutate(messageInput.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    if (!selectedConvId || !socketService.isConnected) return;
    socketService.sendTyping(selectedConvId, true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      if (selectedConvId) socketService.sendTyping(selectedConvId, false);
    }, 1500);
  };

  const handleAudioSend = (blob: Blob) => {
    if (!selectedConvId) return;
    sendAudioMutation.mutate(blob);
  };

  const handleAudioCancel = () => {
    setRecording(false);
  };

  const scrollToMessage = useCallback((msgId: string) => {
    const el = messageRefs.current[msgId];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const filteredConversations = conversations?.filter((c) => {
    if (!searchQuery) return true;
    const other = c.participants?.find((p) => p.id !== user?.id);
    const name = other?.nom_complet?.toLowerCase() || "";
    return (
      name.includes(searchQuery.toLowerCase()) ||
      c.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const presenceInfo = (presence?: string | null) => {
    switch (presence) {
      case "disponible":
        return { label: "Disponible", dot: "bg-emerald-500", text: "text-emerald-600" };
      case "en_mission":
        return { label: "En mission", dot: "bg-amber-500", text: "text-amber-600" };
      case "indisponible":
        return { label: "Indisponible", dot: "bg-red-500", text: "text-red-600" };
      case "en_ligne":
        return { label: "En ligne", dot: "bg-emerald-500", text: "text-emerald-600" };
      case "hors_ligne":
        return { label: "Hors ligne", dot: "bg-slate-300", text: "text-slate-400" };
      default:
        return null;
    }
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
                  <div className="relative shrink-0">
                    <Avatar
                      src={other?.photo_profil}
                      name={other?.nom_complet || "Utilisateur"}
                      size="sm"
                    />
                    {presenceInfo(other?.presence) && (
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${presenceInfo(other?.presence)?.dot}`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {other?.nom_complet || "Conversation"}
                      </p>
                      {presenceInfo(other?.presence) && (
                        <span
                          className={`shrink-0 text-[10px] font-medium ${presenceInfo(other?.presence)?.text}`}
                        >
                          {presenceInfo(other?.presence)?.label}
                        </span>
                      )}
                    </div>
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
                <div className="flex items-center gap-1.5">
                  {presenceInfo(otherParticipant?.presence) ? (
                    <>
                      <span
                        className={`w-2 h-2 rounded-full ${presenceInfo(otherParticipant?.presence)?.dot}`}
                      />
                      <span
                        className={`text-xs truncate ${presenceInfo(otherParticipant?.presence)?.text}`}
                      >
                        {presenceInfo(otherParticipant?.presence)?.label}
                      </span>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 truncate">
                      {otherParticipant?.role ? getRoleLabel(otherParticipant.role) : ""}
                    </p>
                  )}
                </div>
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
                        ref={(el) => {
                          messageRefs.current[msg.id] = el;
                        }}
                        className={`group flex flex-col ${
                          isMine ? "items-end" : "items-start"
                        }`}
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
                          {msg.reply_to && (
                            <QuotedMessageCard
                              message={msg.reply_to}
                              isMine={isMine}
                              onClick={() => scrollToMessage(msg.reply_to!.id)}
                            />
                          )}

                          {msg.type === "audio" && msg.media_url ? (
                            <div
                              className={`rounded-2xl px-4 py-3 ${
                                isMine
                                  ? "bg-slate-700 text-white rounded-br-md"
                                  : "bg-white text-slate-900 rounded-bl-md border border-slate-200"
                              }`}
                            >
                              <AudioPlayer
                                src={msg.media_url}
                                isMine={isMine}
                                withDownload
                              />
                            </div>
                          ) : msg.type === "image" ||
                            msg.type === "video" ||
                            msg.type === "fichier" ? (
                            <MediaMessage
                              msg={msg}
                              isMine={isMine}
                              onQuoteClick={(target) =>
                                scrollToMessage(target.id)
                              }
                            />
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

                          {/* Bouton Répondre (survol) */}
                          <div
                            className={`flex mt-1 ${
                              isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            <button
                              onClick={() => {
                                setReplyTo(msg);
                                messageInputRef.current?.focus();
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-600"
                              title="Répondre à ce message"
                            >
                              <Reply className="h-3 w-3" />
                              Répondre
                            </button>
                          </div>

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

                  {/* Indicateur "en train d'écrire…" */}
                  {otherTyping && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
                      {otherParticipant?.nom_complet || "Quelqu'un"} écrit…
                    </div>
                  )}
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
                <VoiceRecorder
                  onSend={handleAudioSend}
                  onCancel={handleAudioCancel}
                  sending={sendAudioMutation.isPending}
                />
              ) : (
                <div className="flex flex-col gap-2">
                  {replyTo && (
                    <ReplyPreview
                      message={replyTo}
                      isMine={replyTo.expediteur_id === user?.id}
                      onCancel={() => setReplyTo(null)}
                    />
                  )}
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                      className="hidden"
                      onChange={handleFilePicked}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sendMediaMutation.isPending}
                      className="min-h-[44px] min-w-[44px] shrink-0 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                      title="Joindre une photo, une vidéo ou un document"
                    >
                      {sendMediaMutation.isPending ? (
                        <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Paperclip className="h-5 w-5" />
                      )}
                    </Button>
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
                      ref={messageInputRef}
                      value={messageInput}
                      onChange={handleInputChange}
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
