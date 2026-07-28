"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { conversationService } from "@/services/conversation.service";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateTime } from "@/lib/utils";
import { MessageSquare, Search, Send, Plus } from "lucide-react";

export default function ChatPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileShowList, setMobileShowList] = useState(true);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => conversationService.list(),
    refetchInterval: 10000,
  });

  const filteredConversations = conversations?.filter((c) => {
    if (!searchQuery) return true;
    const participants = c.participants || [];
    return participants.some(
      (p) =>
        p.nom_complet?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Conversation list */}
      <div className={`${mobileShowList ? "flex" : "hidden"} sm:flex w-full sm:w-80 border-r border-gray-200 flex-col`}>
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Messagerie</h2>
            <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
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
          {isLoading ? (
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
              const otherParticipant = conv.participants?.find(
                (p) => p.id !== user?.id
              );
              return (
                <Link
                  key={conv.id}
                  href={`/dashboard/chat/${conv.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 min-h-[60px]"
                  onClick={() => setMobileShowList(false)}
                >
                  <Avatar
                    name={otherParticipant?.nom_complet || "Utilisateur"}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {otherParticipant?.nom_complet || "Conversation"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {conv.last_message || "Aucun message"}
                    </p>
                  </div>
                  {conv.last_message_at && (
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(conv.last_message_at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </Link>
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

      {/* Placeholder for selected conversation on desktop */}
      <div className={`${!mobileShowList ? "flex" : "hidden"} sm:flex flex-1 items-center justify-center text-gray-400`}>
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Sélectionnez une conversation pour commencer</p>
        </div>
      </div>
    </div>
  );
}
