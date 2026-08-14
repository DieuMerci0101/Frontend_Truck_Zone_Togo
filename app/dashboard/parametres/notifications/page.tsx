"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { notificationService } from "@/services/notification.service";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useAuth } from "@/providers/auth-provider";
import type { NotificationPreferences } from "@/types";

interface ChannelDef {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
  icon: string;
}

const CHANNELS: ChannelDef[] = [
  {
    key: "email",
    label: "E-mail",
    description: "Un e-mail de notification (via Brevo) à chaque événement important.",
    icon: "✉️",
  },
  {
    key: "push",
    label: "Web Push (navigateur)",
    description:
      "Notification instantanée sur ce navigateur, même si l'application est fermée.",
    icon: "🔔",
  },
  {
    key: "sms",
    label: "SMS de secours",
    description:
      "SMS réservé aux urgences (assistance mécanique, alerte sécurité). Aucun spam.",
    icon: "📱",
  },
  {
    key: "in_app",
    label: "Dans l'application",
    description: "Affichage dans la cloche de notifications (toujours recommandé).",
    icon: "💬",
  },
];

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function NotificationsPreferencesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { supported, active, enabled, enable, disable } = usePushNotifications();

  const { data: prefs, isLoading } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: notificationService.getPreferences,
    enabled: Boolean(user),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<NotificationPreferences>) =>
      notificationService.updatePreferences(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["notification-preferences"], updated);
      toast.success("Préférences enregistrées");
    },
    onError: () => toast.error("Erreur lors de l'enregistrement des préférences"),
  });

  const [pushBusy, setPushBusy] = useState(false);

  const toggleChannel = (key: keyof NotificationPreferences, value: boolean) => {
    if (!prefs) return;
    updateMutation.mutate({ [key]: value });
  };

  const handleTogglePush = async () => {
    setPushBusy(true);
    try {
      if (enabled) {
        await disable();
        toast("Notifications navigateur désactivées");
      } else {
        const ok = await enable();
        if (ok) toast.success("Notifications navigateur activées");
        else toast.error("Autorisation refusée par le navigateur");
      }
    } finally {
      setPushBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500">
          Choisissez les canaux par lesquels vous souhaitez être averti. Les
          notifications restent toujours visibles dans l'application.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Canaux de notification</CardTitle>
          <CardDescription>
            Activez ou désactivez chaque canal selon vos préférences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {CHANNELS.map((channel, index) => {
            const checked = prefs ? Boolean(prefs[channel.key]) : true;
            const isPushEnabled = channel.key === "push" && enabled;
            return (
              <div key={channel.key}>
                {index > 0 && <Separator className="my-1" />}
                <div className="flex items-start justify-between gap-4 py-3">
                  <div className="flex items-start gap-3">
                    <span className="text-xl leading-7">{channel.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{channel.label}</p>
                        {channel.key === "push" && supported && (
                          <Badge
                            variant={isPushEnabled ? "success" : "secondary"}
                          >
                            {isPushEnabled ? "Actif" : "Inactif"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{channel.description}</p>
                      {channel.key === "push" && !supported && (
                        <p className="mt-1 text-xs text-amber-600">
                          Navigateur non compatible avec les notifications Web Push.
                        </p>
                      )}
                      {channel.key === "push" && !active && supported && (
                        <p className="mt-1 text-xs text-amber-600">
                          Notifications push désactivées côté serveur (clés VAPID
                          non configurées sur Render).
                        </p>
                      )}
                    </div>
                  </div>
                  {channel.key === "push" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTogglePush}
                      disabled={pushBusy || !supported || !active}
                    >
                      {pushBusy
                        ? "…"
                        : enabled
                          ? "Désactiver"
                          : "Activer"}
                    </Button>
                  ) : (
                    <Toggle
                      checked={checked}
                      onChange={(value) => toggleChannel(channel.key, value)}
                      disabled={updateMutation.isPending}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notifications récentes</CardTitle>
          <CardDescription>
            Gérez les notifications reçues depuis la cloche en haut à droite.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-gray-500">
          Les notifications sont conservées 90 jours. Les canaux e-mail et SMS
          ne sont sollicités que pour les événements importants, jamais pour du
          contenu promotionnel.
        </CardContent>
      </Card>
    </div>
  );
}
