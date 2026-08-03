import api from "./api";
import type { Conversation, ConversationCreate, Message, MessageCreate } from "@/types";

export const conversationService = {
  list: (params?: { skip?: number; limit?: number }) =>
    api.get<Conversation[]>("/api/conversations/", { params }).then((r) => r.data),

  create: (data: ConversationCreate) =>
    api.post<Conversation>("/api/conversations/", data).then((r) => r.data),

  /**
   * Démarre une conversation avec un participant et envoie un premier message.
   * Si une conversation existe déjà, le message est ajouté à la discussion existante.
   */
  initiate: (data: ConversationCreate) =>
    api.post<Conversation>("/api/chat/initiate", data).then((r) => r.data),

  getById: (id: string) =>
    api.get<Conversation>(`/api/conversations/${id}`).then((r) => r.data),

  getMessages: (conversationId: string, params?: { skip?: number; limit?: number }) =>
    api.get<Message[]>(`/api/conversations/${conversationId}/messages`, { params }).then((r) => r.data),

  sendMessage: (conversationId: string, data: MessageCreate) =>
    api.post<Message>(`/api/conversations/${conversationId}/messages`, data).then((r) => r.data),

  sendAudioMessage: (conversationId: string, file: Blob, contenu?: string) => {
    const formData = new FormData();
    formData.append("file", file, "audio.webm");
    if (contenu) formData.append("contenu", contenu);
    return api.post<Message>(`/api/conversations/${conversationId}/messages/audio`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  lire: (conversationId: string) =>
    api.put<{ message: string; marked: number }>(`/api/conversations/${conversationId}/lire`).then((r) => r.data),
};
