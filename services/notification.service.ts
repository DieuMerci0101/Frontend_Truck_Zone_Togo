import api from "./api";
import type {
  Notification,
  NotificationCreate,
  NotificationPreferences,
  PushConfig,
  PushSubscriptionBody,
} from "@/types";

export interface NotificationListParams {
  skip?: number;
  limit?: number;
  non_lues_seulement?: boolean;
}

export const notificationService = {
  list: (params?: NotificationListParams) =>
    api.get<Notification[]>("/api/notifications/", { params }).then((r) => r.data),

  create: (data: NotificationCreate) =>
    api.post<Notification>("/api/notifications/", data).then((r) => r.data),

  getNonLues: () =>
    api.get<{ non_lues: number }>("/api/notifications/non-lues").then((r) => r.data),

  markAsRead: (id: string) =>
    api.put<{ message: string }>(`/api/notifications/${id}/lu`).then((r) => r.data),

  markAllAsRead: () =>
    api.put<{ message: string }>("/api/notifications/tout-lu").then((r) => r.data),

  // ─── Préférences multi-canal ───
  getPreferences: () =>
    api.get<NotificationPreferences>("/api/notifications/preferences").then((r) => r.data),

  updatePreferences: (data: Partial<NotificationPreferences>) =>
    api.put<NotificationPreferences>("/api/notifications/preferences", data).then((r) => r.data),

  // ─── Web Push ───
  getPushConfig: () =>
    api.get<PushConfig>("/api/notifications/push/config").then((r) => r.data),

  subscribePush: (data: PushSubscriptionBody) =>
    api
      .post<{ id: string; endpoint: string }>("/api/notifications/push/subscribe", data)
      .then((r) => r.data),

  unsubscribePush: (data: PushSubscriptionBody) =>
    api
      .delete<{ message: string }>("/api/notifications/push/subscribe", { data })
      .then((r) => r.data),
};
