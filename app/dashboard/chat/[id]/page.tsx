"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { conversationService } from "@/services/conversation.service";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";
import type { Message } from "@/types";

export default function ChatConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const convId = params.id as string;
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversation } = useQuery({
    queryKey: ["conversation", convId],
    queryFn: () => conversationService.getById(convId),
    enabled: !!convId,
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ["conversation", convId, "messages"],
    queryFn: () => conversationService.getMessages(convId, { limit: 100 }),
    enabled: !!convId,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: (data: { contenu: string }) =>
      conversationService.sendMessage(convId, data),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["conversation", convId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!conversation && !isLoading) {
      router.push("/dashboard/chat");
    }
  }, [conversation, isLoading, router]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate({ contenu: message.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherParticipant = conversation?.participants?.find(
    (p) => p.id !== user?.id
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 border-b border-gray-200">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/chat")}
          className="min-h-[44px] min-w-[44px] shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar name={otherParticipant?.nom_complet || "Utilisateur"} size="sm" />
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
      <ScrollArea className="flex-1 p-3 sm:p-4" maxHeight="calc(100vh - 14rem)">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <Skeleton className="h-10 w-48 rounded-xl" />
              </div>
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMine = msg.expediteur_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl ${
                      isMine
                        ? "bg-blue-700 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-900 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.contenu}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isMine ? "text-blue-200" : "text-gray-400"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
            <p className="text-sm">Aucun message. Commencez la conversation !</p>
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tapez votre message..."
            className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] max-h-[120px]"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending}
            size="icon"
            className="min-h-[44px] min-w-[44px] shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
