import api from "./api";
import type { Notification, NotificationCreate } from "@/types";

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
};
