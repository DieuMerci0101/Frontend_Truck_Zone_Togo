"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { conversationService } from "@/services/conversation.service";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, MessageSquare, Search, Send } from "lucide-react";
import type { Conversation, Message } from "@/types";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");

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

  // ── Desktop: show both panels ──
  // ── Mobile: show one at a time ──

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* ─── Sidebar: conversation list ─── */}
      <div
        className={`${
          mobileView === "list" ? "flex" : "hidden"
        } md:flex w-full md:w-80 border-r border-gray-200 flex-col shrink-0`}
      >
        <div className="p-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-3">Messagerie</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                  className={`w-full flex items-center gap-3 p-3 transition-colors border-b border-gray-100 text-left min-h-[60px] hover:bg-gray-50 ${
                    isActive ? "bg-slate-50" : ""
                  }`}
                >
                  <Avatar
                    src={other?.photo_profil}
                    name={other?.nom_complet || "Utilisateur"}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {other?.nom_complet || "Conversation"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {conv.last_message || "Aucun message"}
                    </p>
                  </div>
                  {conv.last_message_at && (
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(conv.last_message_at).toLocaleTimeString(
                        "fr-FR",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
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
            <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-200">
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
                <p className="text-sm font-medium text-gray-900 truncate">
                  {otherParticipant?.nom_complet || "Conversation"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {otherParticipant?.role || ""}
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea
              className="flex-1 p-3 sm:p-4"
              maxHeight="calc(100vh - 14rem)"
            >
              {msgsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`flex ${
                        i % 2 === 0 ? "justify-end" : "justify-start"
                      }`}
                    >
                      <Skeleton className="h-10 w-48 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.map((msg: Message) => {
                    const isMine = msg.expediteur_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl ${
                            isMine
                              ? "bg-slate-700 text-white rounded-br-md"
                              : "bg-gray-100 text-gray-900 rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {msg.contenu}
                          </p>
                          <p
                            className={`text-[10px] mt-1 ${
                              isMine ? "text-slate-300" : "text-gray-400"
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString(
                              "fr-FR",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                            {isMine && (msg.lu ? " · Lu" : "")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm">
                    Aucun message. Commencez la conversation !
                  </p>
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-gray-200">
              <div className="flex gap-2">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tapez votre message..."
                  className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[44px] max-h-[120px]"
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={
                    !messageInput.trim() || sendMutation.isPending
                  }
                  size="icon"
                  className="min-h-[44px] min-w-[44px] shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Placeholder when no conversation selected */
          <div className="flex-1 flex items-center justify-center text-gray-400">
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
