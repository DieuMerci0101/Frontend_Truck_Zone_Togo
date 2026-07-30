"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { chauffeurService } from "@/services/chauffeur.service";
import BackButton from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatusColor } from "@/lib/utils";
import {
  DISPONIBILITE_CHAUFFEUR,
  CATEGORIES_PERMIS,
  ZONES_CIRCULATION,
} from "@/constants";
import type { ProfilChauffeur } from "@/types";

const ITEMS_PER_PAGE = 9;

const disponibiliteOptions = [
  { value: "", label: "Toutes" },
  ...Object.entries(DISPONIBILITE_CHAUFFEUR).map(([value, label]) => ({
    value,
    label,
  })),
];

const permisOptions = [
  { value: "", label: "Toutes" },
  ...CATEGORIES_PERMIS.map((c) => ({ value: c, label: `Catégorie ${c}` })),
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ChauffeurCardSkeleton() {
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
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ChauffeursPage() {
  const [page, setPage] = useState(1);
  const [disponibilite, setDisponibilite] = useState("");
  const [categoriePermis, setCategoriePermis] = useState("");
  const [experienceMin, setExperienceMin] = useState("");
  const [search, setSearch] = useState("");

  const { data: chauffeurs = [], isLoading } = useQuery({
    queryKey: ["chauffeurs", { disponibilite, categorie_permis: categoriePermis, experience_min: experienceMin }],
    queryFn: () =>
      chauffeurService.list({
        ...(disponibilite && { disponibilite }),
        ...(categoriePermis && { categorie_permis: categoriePermis }),
        ...(experienceMin && { experience_min: parseInt(experienceMin) }),
      }),
  });

  const filtered = chauffeurs.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = c.user?.nom_complet?.toLowerCase() || "";
    const zones = c.zones_circulation?.join(" ").toLowerCase() || "";
    const types = c.types_transport?.join(" ").toLowerCase() || "";
    return name.includes(q) || zones.includes(q) || types.includes(q);
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Chauffeurs Professionnels</h1>
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
              Trouvez le chauffeur idéal pour vos besoins de transport au Togo
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Input
              placeholder="Rechercher par nom, zone, type de transport..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-full">
            <Select
              options={disponibiliteOptions}
              placeholder="Disponibilité"
              value={disponibilite}
              onChange={(e) => {
                setDisponibilite(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-full">
            <Select
              options={permisOptions}
              placeholder="Catégorie permis"
              value={categoriePermis}
              onChange={(e) => {
                setCategoriePermis(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-full">
            <Input
              type="number"
              placeholder="Expérience min (ans)"
              value={experienceMin}
              onChange={(e) => {
                setExperienceMin(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ChauffeurCardSkeleton key={i} />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-10 sm:py-12 lg:py-16">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucun chauffeur trouvé
            </h3>
            <p className="text-sm sm:text-base text-slate-500">
              Essayez de modifier vos filtres de recherche
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginated.map((chauffeur, index) => (
                <motion.div
                  key={chauffeur.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-base sm:text-lg flex-shrink-0 overflow-hidden">
                          {chauffeur.photo_url ? (
                            <img
                              src={chauffeur.photo_url}
                              alt=""
                              className="h-full w-full object-cover rounded-full"
                            />
                          ) : (
                            getInitials(chauffeur.user?.nom_complet || "CH")
                          )}
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-sm sm:text-base truncate">
                            {chauffeur.user?.nom_complet || "Chauffeur"}
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-slate-500 truncate">
                            Permis {chauffeur.categorie_permis} • {chauffeur.annees_experience} ans
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Badge className={getStatusColor(chauffeur.disponibilite)}>
                          {DISPONIBILITE_CHAUFFEUR[chauffeur.disponibilite]}
                        </Badge>

                        {chauffeur.types_transport?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {chauffeur.types_transport.slice(0, 3).map((t) => (
                              <Badge key={t} variant="outline" className="text-xs">
                                {t}
                              </Badge>
                            ))}
                            {chauffeur.types_transport.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{chauffeur.types_transport.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {chauffeur.zones_circulation?.length > 0 && (
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-500">
                            <span className="truncate">
                              {chauffeur.zones_circulation.slice(0, 2).join(", ")}
                              {chauffeur.zones_circulation.length > 2 && "..."}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <div className="p-4 sm:p-6 pt-0">
                      <Link href={`/chauffeurs/${chauffeur.id}`}>
                        <Button variant="outline" className="w-full min-h-[44px]">
                          Voir profil
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
