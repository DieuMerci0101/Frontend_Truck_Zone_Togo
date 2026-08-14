"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { notificationService } from "@/services/notification.service";

/** Convertit une clé VAPID base64url en Uint8Array (format attendu par
 *  `PushManager.subscribe({ applicationServerKey })`). */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/** Convertit un ArrayBuffer (clé p256dh/auth d'un PushSubscription) en base64. */
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch (err) {
    console.error("[Push] Enregistrement service worker impossible :", err);
    return null;
  }
}

export interface PushNotificationsState {
  /** Le navigateur supporte-t-il les notifications Web Push ? */
  supported: boolean;
  /** La configuration serveur est-elle active (clés VAPID présentes) ? */
  active: boolean;
  /** L'utilisateur a-t-il accepté les notifications et est-il abonné ? */
  enabled: boolean;
  /** VAPID public key (exposée au navigateur). */
  vapidPublicKey: string;
  /** Demande l'autorisation puis s'abonne et synchronise avec le backend. */
  enable: () => Promise<boolean>;
  /** Désabonne le navigateur et synchronise avec le backend. */
  disable: () => Promise<void>;
}

export function usePushNotifications(): PushNotificationsState {
  const { user, isAuthenticated } = useAuth();
  const [supported] = useState(() => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window);
  const [active, setActive] = useState(false);
  const [vapidPublicKey, setVapidPublicKey] = useState("");
  const [enabled, setEnabled] = useState(false);

  // Récupère la config VAPID si l'utilisateur est connecté.
  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated || !user) return;

    notificationService
      .getPushConfig()
      .then((config) => {
        if (cancelled) return;
        setActive(config.active);
        setVapidPublicKey(config.vapid_public_key);
        if (config.active && supported) {
          // Vérifie si ce navigateur est déjà abonné (déjà synchronisé).
          navigator.serviceWorker
            .getRegistration("/sw.js")
            .then((reg) => {
              if (!reg) return;
              return reg.pushManager.getSubscription();
            })
            .then((sub) => setEnabled(Boolean(sub)));
        }
      })
      .catch((err) => console.error("[Push] Config récupération impossible :", err));

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user, supported]);

  const enable = useCallback(async (): Promise<boolean> => {
    if (!supported || !active || !user) return false;

    const reg = await registerServiceWorker();
    if (!reg) return false;

    let permission = Notification.permission;
    if (permission !== "granted") {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") return false;

    try {
      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource,
        });
      }

      await notificationService.subscribePush({
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
        auth: arrayBufferToBase64(subscription.getKey("auth")),
      });

      setEnabled(true);
      return true;
    } catch (err) {
      console.error("[Push] Abonnement impossible :", err);
      return false;
    }
  }, [supported, active, user, vapidPublicKey]);

  const disable = useCallback(async () => {
    if (!supported || !user) return;

    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const subscription = await reg?.pushManager.getSubscription();
      if (subscription) {
        await notificationService.unsubscribePush({
          endpoint: subscription.endpoint,
          p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
          auth: arrayBufferToBase64(subscription.getKey("auth")),
        });
        await subscription.unsubscribe();
      }
    } catch (err) {
      console.error("[Push] Désabonnement impossible :", err);
    }
    setEnabled(false);
  }, [supported, user]);

  return { supported, active, enabled, vapidPublicKey, enable, disable };
}
