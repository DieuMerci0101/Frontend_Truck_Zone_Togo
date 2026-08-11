"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { chauffeurService } from "@/services/chauffeur.service";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { CATEGORIES_PERMIS, DISPONIBILITE_CHAUFFEUR } from "@/constants";
import {
  Users,
  Search,
  MapPin,
  MessageCircle,
  Phone,
  Mail,
  Shield,
  ChevronDown,
  Eye,
  Truck,
} from "lucide-react";
import type { ProfilChauffeur } from "@/types";

const PAGE_SIZE = 40;

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

  // Fiche détaillée
  const [detailChauffeur, setDetailChauffeur] = useState<ProfilChauffeur | null>(null);

  const {
    data: pages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["proprietaire", "chauffeurs", filterCategorie, filterDispo],
    queryFn: ({ pageParam }) =>
      chauffeurService.list({
        skip: pageParam,
        limit: PAGE_SIZE,
        categorie_permis: filterCategorie || undefined,
        disponibilite: filterDispo || undefined,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
    // Synchronisation temps réel : tout changement de statut du chauffeur
    // se reflète sur sa carte chez les propriétaires.
    refetchInterval: 30000,
  });

  const chauffeurs = pages?.pages.flat() || [];

  const filtered = chauffeurs.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = c.user?.nom_complet?.toLowerCase() || "";
    return (
      name.includes(q) ||
      c.numero_permis.toLowerCase().includes(q) ||
      c.zones_circulation.some((z) => z.toLowerCase().includes(q))
    );
  });

  const openChat = (ch: ProfilChauffeur) => {
    setDetailChauffeur(null);
    router.push(`/dashboard/chat?recipientId=${ch.user_id}`);
  };

  const renderInfoList = (ch: ProfilChauffeur) => (
    <div className="space-y-1.5 text-xs text-gray-600">
      <p className="flex items-start gap-1.5">
        <Shield className="h-3.5 w-3.5 shrink-0 text-amber-600 mt-0.5" />
        <span>
          <span className="font-medium text-gray-800">Permis</span> {ch.categorie_permis}
          <span className="text-gray-400"> · </span>
          {ch.numero_permis}
        </span>
      </p>
      <p className="flex items-center gap-1.5">
        <Truck className="h-3.5 w-3.5 shrink-0 text-amber-600" />
        <span className="truncate">
          {ch.types_transport.length > 0
            ? ch.types_transport.join(", ")
            : "Transport général"}
        </span>
      </p>
      {ch.zones_circulation.length > 0 && (
        <p className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-600" />
          <span className="truncate">
            {ch.zones_circulation.slice(0, 3).join(", ")}
            {ch.zones_circulation.length > 3 &&
              ` +${ch.zones_circulation.length - 3}`}
          </span>
        </p>
      )}
      <p className="flex items-center gap-1.5">
        <Phone className="h-3.5 w-3.5 shrink-0 text-amber-600" />
        <span className="truncate">{ch.user?.telephone || "—"}</span>
      </p>
      <p className="flex items-center gap-1.5">
        <Mail className="h-3.5 w-3.5 shrink-0 text-amber-600" />
        <span className="truncate">{ch.user?.email || "—"}</span>
      </p>
      <p className="text-gray-500">
        {ch.annees_experience} an{ch.annees_experience > 1 ? "s" : ""} d&apos;expérience
      </p>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 rounded-lg">
          <Users className="h-6 w-6 text-slate-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Annuaire des chauffeurs</h1>
          <p className="text-gray-500">
            Consultez l&apos;ensemble des chauffeurs inscrits et contactez-les
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, permis ou zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          options={[
            { value: "", label: "Toutes catégories" },
            ...CATEGORIES_PERMIS.map((c) => ({ value: c, label: `Permis ${c}` })),
          ]}
          value={filterCategorie}
          onChange={(e) => setFilterCategorie(e.target.value)}
          className="w-full sm:w-auto"
        />
        <Select
          options={[
            { value: "", label: "Tous statuts" },
            ...Object.entries(DISPONIBILITE_CHAUFFEUR).map(([v, l]) => ({
              value: v,
              label: l,
            })),
          ]}
          value={filterDispo}
          onChange={(e) => setFilterDispo(e.target.value)}
          className="w-full sm:w-auto"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map((ch) => {
              const canContact = ch.user?.id && ch.user.id !== user?.id;
              return (
                <Card
                  key={ch.id}
                  className="flex flex-col overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setDetailChauffeur(ch)}
                >
                  <div className="p-4 sm:p-5 flex flex-col items-center text-center border-b border-gray-100 bg-gradient-to-b from-slate-50 to-white">
                    <Avatar
                      src={ch.user?.photo_profil}
                      name={ch.user?.nom_complet || "Chauffeur"}
                      size="lg"
                      className="h-20 w-20 text-2xl"
                    />
                    <h3 className="mt-3 font-semibold text-gray-900 text-center line-clamp-1">
                      {ch.user?.nom_complet || "Chauffeur"}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                      <Badge variant="info" className="text-[10px]">
                        Permis {ch.categorie_permis}
                      </Badge>
                      <Badge
                        variant={dispoBadge[ch.disponibilite] || "info"}
                        className="text-[10px]"
                      >
                        {DISPONIBILITE_CHAUFFEUR[ch.disponibilite] || ch.disponibilite}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex-1">{renderInfoList(ch)}</div>
                    {ch.bio && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic">
                        “{ch.bio}”
                      </p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-h-[44px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailChauffeur(ch);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Voir plus de détails
                      </Button>
                      {canContact && (
                        <Button
                          size="sm"
                          className="flex-1 min-h-[44px] bg-amber-600 hover:bg-amber-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            openChat(ch);
                          }}
                        >
                          <MessageCircle className="h-3.5 w-3.5 mr-1" />
                          Messagerie
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                loading={isFetchingNextPage}
                className="min-h-[44px]"
              >
                <ChevronDown className="h-4 w-4 mr-1.5" />
                Charger plus de chauffeurs
              </Button>
            </div>
          )}

          <p className="text-center text-xs text-gray-400">
            {filtered.length} chauffeur{filtered.length > 1 ? "s" : ""} affiché
            {filtered.length > 1 ? "s" : ""}
            {hasNextPage ? " — faites défiler pour charger la suite" : ""}
          </p>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {searchQuery || filterCategorie || filterDispo
                ? "Aucun chauffeur ne correspond à vos critères"
                : "Aucun chauffeur inscrit pour le moment"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Fiche détaillée du chauffeur */}
      <Dialog
        open={!!detailChauffeur}
        onClose={() => setDetailChauffeur(null)}
        title="Fiche du chauffeur"
        size="lg"
      >
        {detailChauffeur && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
              <Avatar
                src={detailChauffeur.user?.photo_profil}
                name={detailChauffeur.user?.nom_complet || "Chauffeur"}
                size="lg"
                className="h-20 w-20 text-2xl"
              />
              <div className="text-center sm:text-left flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900">
                  {detailChauffeur.user?.nom_complet || "Chauffeur"}
                </h3>
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mt-1">
                  <Badge variant="info">Permis {detailChauffeur.categorie_permis}</Badge>
                  <Badge
                    variant={dispoBadge[detailChauffeur.disponibilite] || "info"}
                    className="animate-pulse"
                  >
                    {DISPONIBILITE_CHAUFFEUR[detailChauffeur.disponibilite] ||
                      detailChauffeur.disponibilite}
                  </Badge>
                </div>
                {detailChauffeur.bio && (
                  <p className="text-sm text-gray-500 mt-2">
                    {detailChauffeur.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 sm:p-5">
              {renderInfoList(detailChauffeur)}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDetailChauffeur(null)}
                className="w-full sm:w-auto min-h-[44px]"
              >
                Fermer
              </Button>
              {detailChauffeur.user?.id &&
                detailChauffeur.user.id !== user?.id && (
                  <Button
                    onClick={() => openChat(detailChauffeur)}
                    className="w-full sm:w-auto min-h-[44px] bg-amber-600 hover:bg-amber-700"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Messagerie directe
                  </Button>
                )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
