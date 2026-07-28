"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { chauffeurService } from "@/services/chauffeur.service";
import { conversationService } from "@/services/conversation.service";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { TYPE_CAMION, ETAT_CAMION, API_URL } from "@/constants";
import { Truck, Search, MapPin, MessageCircle, User, Fuel, Settings, Calendar, Gauge } from "lucide-react";
import type { Camion } from "@/types";

function resolvePhotoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
  return url;
}

const etatBadge: Record<string, "success" | "info" | "warning" | "destructive"> = {
  excellent: "success",
  bon: "info",
  use: "warning",
  en_reparation: "destructive",
};

export default function ChauffeurCamionsPublicsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");

  const { data: camions, isLoading } = useQuery({
    queryKey: ["camions-publics", filterType],
    queryFn: () => chauffeurService.getPublicCamions({ limit: 50, type_camion: filterType || undefined }),
  });

  const messageMutation = useMutation({
    mutationFn: (ownerUserId: string) => conversationService.create({ participant_id: ownerUserId }),
    onSuccess: (conv) => {
      toast.success("Conversation ouverte");
      router.push(`/dashboard/chat/${conv.id}`);
    },
    onError: () => toast.error("Impossible d'ouvrir la conversation"),
  });

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
          {filtered.map((camion) => {
            const photoUrl = resolvePhotoUrl(camion.photo_principale_url);
            const ownerName = camion.proprietaire?.user?.nom_complet || camion.chauffeur?.user?.nom_complet || "Propriétaire";
            const ownerUserId = camion.proprietaire?.user_id || camion.chauffeur?.user_id;
            return (
              <Card key={camion.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-44 bg-gray-200 flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt={`${camion.marque} ${camion.modele}`} className="w-full h-full object-cover" />
                  ) : (
                    <Truck className="h-12 w-12 text-gray-400" />
                  )}
                </div>
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

                  {camion.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{camion.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar name={ownerName} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{ownerName}</p>
                        <p className="text-xs text-gray-400">Propriétaire</p>
                      </div>
                    </div>
                    {ownerUserId && ownerUserId !== user?.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[44px] shrink-0"
                        onClick={() => messageMutation.mutate(ownerUserId)}
                        loading={messageMutation.isPending}
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1" />
                        Contacter
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
    </div>
  );
}
