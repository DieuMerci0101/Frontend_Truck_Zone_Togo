"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { chauffeurService } from "@/services/chauffeur.service";
import { conversationService } from "@/services/conversation.service";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TYPE_CAMION, ETAT_CAMION, API_URL } from "@/constants";
import { Truck, Search, MapPin, MessageCircle, Fuel, Settings, Gauge, Clock, Send } from "lucide-react";
import type { Camion } from "@/types";

function resolvePhotoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
  return url;
}

function resolveProfilePhoto(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
  return url;
}

function formatExpiration(d: string): string {
  const dt = new Date(d);
  return dt.toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function isExpired(camion: Camion): boolean {
  if (!camion.expires_at) return false;
  return new Date(camion.expires_at) <= new Date();
}

const etatBadge: Record<string, "success" | "info" | "warning" | "destructive"> = {
  bon_etat: "success",
  excellent: "success",
  bon: "info",
  use: "warning",
  en_reparation: "destructive",
};

function CamionCard({
  camion,
  currentUserId,
  onContact,
}: {
  camion: Camion;
  currentUserId?: string;
  onContact: (ownerUserId: string, ownerName: string, camionId: string) => void;
}) {
  const photos = camion.photos && camion.photos.length > 0 ? camion.photos : [];
  const [activeIdx, setActiveIdx] = useState(0);
  const mainUrl =
    photos.length > 0 ? resolvePhotoUrl(photos[activeIdx]?.photo_url) : resolvePhotoUrl(camion.photo_principale_url);
  const propInfo = camion.proprietaire_info;
  const ownerName = propInfo?.nom_complet || "Propriétaire";
  const ownerPhoto = resolveProfilePhoto(propInfo?.photo_profil);
  const ownerUserId = propInfo?.user_id;
  const expired = isExpired(camion);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-44 bg-gray-200 flex items-center justify-center relative">
        {mainUrl ? (
          <img src={mainUrl} alt={`${camion.marque} ${camion.modele}`} className="w-full h-full object-cover" />
        ) : (
          <Truck className="h-12 w-12 text-gray-400" />
        )}
        {expired && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm px-3 py-1">Offre expirée</Badge>
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto bg-gray-50 border-b border-gray-100">
          {photos.map((photo, idx) => (
            <button
              key={photo.id}
              onClick={() => setActiveIdx(idx)}
              className={`shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-colors min-h-[44px] ${
                idx === activeIdx ? "border-amber-500" : "border-transparent"
              }`}
            >
              <img src={resolvePhotoUrl(photo.photo_url) || ""} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900">{camion.marque} {camion.modele}</h3>
            <p className="text-sm text-gray-500">{camion.immatriculation}</p>
          </div>
          <Badge variant={etatBadge[camion.etat] || "info"} className="shrink-0">
            {ETAT_CAMION[camion.etat as keyof typeof ETAT_CAMION] || camion.etat}
          </Badge>
        </div>

        <div className="text-sm text-gray-500 space-y-1 mt-2">
          <p>Année: {camion.annee} — Capacité: {camion.capacite_charge}t</p>
          <p>Type: {TYPE_CAMION[camion.type_camion as keyof typeof TYPE_CAMION] || camion.type_camion}</p>
          {camion.carburant && (
            <p className="flex items-center gap-1"><Fuel className="h-3 w-3" /> {camion.carburant}</p>
          )}
          {camion.boite_vitesse && (
            <p className="flex items-center gap-1"><Settings className="h-3 w-3" /> {camion.boite_vitesse}</p>
          )}
          {camion.nb_essieux && (
            <p>Essieux: {camion.nb_essieux}</p>
          )}
          {camion.kilometrage && (
            <p className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {camion.kilometrage.toLocaleString()} km</p>
          )}
          {camion.localisation && (
            <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {camion.localisation}</p>
          )}
        </div>

        {camion.expires_at && (
          <p className="flex items-center gap-1 text-xs text-gray-400 mt-2">
            <Clock className="h-3 w-3" />
            Expire le {formatExpiration(camion.expires_at)}
          </p>
        )}

        {camion.description && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{camion.description}</p>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar src={ownerPhoto} name={ownerName} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{ownerName}</p>
              <p className="text-xs text-gray-400">Propriétaire</p>
            </div>
          </div>
          {ownerUserId && ownerUserId !== currentUserId && !expired && (
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px] shrink-0"
              onClick={() => onContact(ownerUserId, ownerName, camion.id)}
            >
              <MessageCircle className="h-3.5 w-3.5 mr-1" />
              Contacter le propriétaire
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ChauffeurCamionsPublicsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [contactModal, setContactModal] = useState<{ ownerUserId: string; ownerName: string; camionId: string } | null>(null);
  const [messageText, setMessageText] = useState("");

  const { data: camions, isLoading } = useQuery({
    queryKey: ["camions-publics", filterType],
    queryFn: () => chauffeurService.getPublicCamions({ limit: 50, type_camion: filterType || undefined }),
  });

  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => conversationService.list(),
  });

  const createMutation = useMutation({
    mutationFn: ({ camionId, message }: { camionId: string; message: string }) =>
      conversationService.initiateFromOffer({ camion_id: camionId, message }),
    onSuccess: (conv) => {
      toast.success("Message envoyé");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setContactModal(null);
      setMessageText("");
      router.push(`/dashboard/chat/${conv.id}`);
    },
    onError: () => toast.error("Impossible d'envoyer le message"),
  });

  const handleContact = useCallback(
    (ownerUserId: string, ownerName: string, camionId: string) => {
      const existing = conversations?.find((c) =>
        c.participants?.some((p) => p.id === ownerUserId)
      );
      if (existing) {
        router.push(`/dashboard/chat/${existing.id}`);
      } else {
        setContactModal({ ownerUserId, ownerName, camionId });
        setMessageText("");
      }
    },
    [conversations, router]
  );

  const handleSendMessage = () => {
    if (!contactModal || !messageText.trim()) return;
    createMutation.mutate({
      camionId: contactModal.camionId,
      message: messageText.trim(),
    });
  };

  const filtered = camions?.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.marque.toLowerCase().includes(q) ||
      c.modele.toLowerCase().includes(q) ||
      c.immatriculation.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-50 rounded-lg">
          <Truck className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Camions disponibles</h1>
          <p className="text-gray-500">Parcourez les camions publiés par les propriétaires</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Rechercher par marque, modèle, immatriculation..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select
          options={[
            { value: "", label: "Tous les types" },
            ...Object.entries(TYPE_CAMION).map(([v, l]) => ({ value: v, label: l })),
          ]}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full sm:w-auto"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-72" />)}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((camion) => (
            <CamionCard
              key={camion.id}
              camion={camion}
              currentUserId={user?.id}
              onContact={handleContact}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {searchQuery || filterType ? "Aucun camion ne correspond à vos critères" : "Aucun camion publié pour le moment"}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!contactModal} onClose={() => { setContactModal(null); setMessageText(""); }} title={`Contacter ${contactModal?.ownerName || ""}`} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Rédigez votre premier message pour contacter ce propriétaire :</p>
          <Textarea
            placeholder="Bonjour, je suis intéressé par votre camion..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={4}
          />
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => { setContactModal(null); setMessageText(""); }} className="w-full sm:w-auto min-h-[44px]">
              Annuler
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || createMutation.isPending}
              loading={createMutation.isPending}
              className="w-full sm:w-auto min-h-[44px]"
            >
              <Send className="h-4 w-4 mr-2" />
              Envoyer
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}