"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { proprietaireService } from "@/services/proprietaire.service";
import BackButton from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TYPE_ACTIVITE } from "@/constants";
import type { ProfilProprietaire } from "@/types";

const ITEMS_PER_PAGE = 9;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ProprietaireCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function OffresPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: proprietaires = [], isLoading } = useQuery({
    queryKey: ["proprietaires-public"],
    queryFn: () => proprietaireService.list(),
  });

  const filtered = proprietaires.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = (p.nom_entreprise || p.user?.nom_complet || "").toLowerCase();
    const adresse = (p.adresse || "").toLowerCase();
    const activite = (TYPE_ACTIVITE[p.type_activite] || "").toLowerCase();
    return name.includes(q) || adresse.includes(q) || activite.includes(q);
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="bg-slate-900 text-white py-10 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <BackButton fallback="/" label="Retour à l'accueil" className="text-sm text-slate-300 hover:text-white mb-4" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Entreprises de Transport
            </h1>
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
              Découvrez les propriétaires de camions et leurs offres disponibles au Togo
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <Input
            placeholder="Rechercher par nom d'entreprise, adresse, type d'activité..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProprietaireCardSkeleton key={i} />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-10 sm:py-12 lg:py-16">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucune entreprise trouvée
            </h3>
            <p className="text-sm sm:text-base text-slate-500">
              Essayez de modifier votre recherche
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginated.map((proprietaire, index) => (
                <motion.div
                  key={proprietaire.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-base sm:text-lg flex-shrink-0 overflow-hidden">
                          {proprietaire.photo_url ? (
                            <img
                              src={proprietaire.photo_url}
                              alt=""
                              className="h-full w-full object-cover rounded-full"
                            />
                          ) : (
                            getInitials(
                              proprietaire.nom_entreprise ||
                                proprietaire.user?.nom_complet ||
                                "PR"
                            )
                          )}
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-sm sm:text-base truncate">
                            {proprietaire.nom_entreprise ||
                              proprietaire.user?.nom_complet ||
                              "Entreprise"}
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-slate-500 truncate">
                            {TYPE_ACTIVITE[proprietaire.type_activite]}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {proprietaire.adresse && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{proprietaire.adresse}</span>
                          </div>
                        )}

                        {proprietaire.bio && (
                          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                            {proprietaire.bio}
                          </p>
                        )}

                        <Badge variant="default">
                          {TYPE_ACTIVITE[proprietaire.type_activite]}
                        </Badge>
                      </div>
                    </CardContent>
                    <div className="p-4 sm:p-6 pt-0">
                      <Link href={`/offres/${proprietaire.id}`}>
                        <Button variant="outline" className="w-full min-h-[44px]">
                          Voir les offres
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="min-h-[44px] min-w-[44px]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs sm:text-sm text-slate-600 px-2 sm:px-4">
                  Page {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="min-h-[44px] min-w-[44px]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
