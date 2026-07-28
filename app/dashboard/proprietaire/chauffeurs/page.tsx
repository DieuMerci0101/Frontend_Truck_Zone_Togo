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
import { CATEGORIES_PERMIS, DISPONIBILITE_CHAUFFEUR } from "@/constants";
import { Users, Search, MapPin, MessageCircle } from "lucide-react";

const dispoBadge: Record<string, "success" | "warning" | "destructive"> = {
  disponible: "success",
  en_mission: "warning",
  indisponible: "destructive",
};

export default function ProprietaireChauffeursPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategorie, setFilterCategorie] = useState("");
  const [filterDispo, setFilterDispo] = useState("");

  const { data: chauffeurs, isLoading } = useQuery({
    queryKey: ["proprietaire", "chauffeurs", filterCategorie, filterDispo],
    queryFn: () =>
      chauffeurService.list({
        categorie_permis: filterCategorie || undefined,
        disponibilite: filterDispo || undefined,
        limit: 50,
      }),
  });

  const messageMutation = useMutation({
    mutationFn: (chauffeurUserId: string) =>
      conversationService.create({ participant_id: chauffeurUserId }),
    onSuccess: (conv) => {
      toast.success("Conversation ouverte");
      router.push(`/dashboard/chat/${conv.id}`);
    },
    onError: () => toast.error("Impossible d'ouvrir la conversation"),
  });

  const filtered = chauffeurs?.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = c.user?.nom_complet?.toLowerCase() || "";
    return name.includes(q) || c.numero_permis.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rechercher des chauffeurs</h1>
          <p className="text-gray-500">Trouvez le chauffeur idéal pour vos besoins</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom ou permis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          options={[
            { value: "", label: "Toutes catégories" },
            ...CATEGORIES_PERMIS.map((c) => ({ value: c, label: c })),
          ]}
          value={filterCategorie}
          onChange={(e) => setFilterCategorie(e.target.value)}
          className="w-full sm:w-auto"
        />
        <Select
          options={[
            { value: "", label: "Tous statuts" },
            ...Object.entries(DISPONIBILITE_CHAUFFEUR).map(([v, l]) => ({ value: v, label: l })),
          ]}
          value={filterDispo}
          onChange={(e) => setFilterDispo(e.target.value)}
          className="w-full sm:w-auto"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filtered.map((ch) => (
            <Card key={ch.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Avatar src={ch.user?.photo_profil} name={ch.user?.nom_complet || ""} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {ch.user?.nom_complet || "Chauffeur"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Permis {ch.categorie_permis} — {ch.annees_experience} ans d&apos;expérience
                    </p>
                    {ch.zones_circulation.length > 0 && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{ch.zones_circulation.slice(0, 3).join(", ")}</span>
                        {ch.zones_circulation.length > 3 && ` +${ch.zones_circulation.length - 3}`}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant={dispoBadge[ch.disponibilite] || "info"}>
                      {DISPONIBILITE_CHAUFFEUR[ch.disponibilite] || ch.disponibilite}
                    </Badge>
                    {ch.user?.id && ch.user.id !== user?.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[44px]"
                        onClick={() => messageMutation.mutate(ch.user!.id)}
                        loading={messageMutation.isPending}
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1" />
                        Contacter
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {searchQuery || filterCategorie || filterDispo
                ? "Aucun chauffeur ne correspond à vos critères"
                : "Aucun chauffeur disponible"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
