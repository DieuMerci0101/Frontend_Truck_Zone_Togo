"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Briefcase,
  Truck,
  Calendar,
} from "lucide-react";
import { proprietaireService } from "@/services/proprietaire.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TYPE_ACTIVITE } from "@/constants";
import { useAuth } from "@/providers/auth-provider";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProprietaireDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const { data: proprietaire, isLoading } = useQuery({
    queryKey: ["proprietaire", id],
    queryFn: () => proprietaireService.getById(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4 sm:gap-6">
                <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!proprietaire) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Building2 className="h-14 w-14 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Entreprise non trouvée
          </h2>
          <Link href="/offres">
            <Button variant="outline" className="min-h-[44px]">Retour aux offres</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium mb-4 sm:mb-6 min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl sm:text-2xl flex-shrink-0 overflow-hidden">
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
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl sm:text-2xl mb-2">
                    {proprietaire.nom_entreprise ||
                      proprietaire.user?.nom_complet ||
                      "Entreprise"}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {TYPE_ACTIVITE[proprietaire.type_activite]}
                    </span>
                    {proprietaire.adresse && (
                      <span className="flex items-center gap-1 min-w-0">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{proprietaire.adresse}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Membre depuis{" "}
                      {new Date(proprietaire.created_at).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 sm:space-y-6">
              {proprietaire.bio && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    À propos de l&apos;entreprise
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">{proprietaire.bio}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <Badge variant="default" className="gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  {TYPE_ACTIVITE[proprietaire.type_activite]}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {!isAuthenticated ? (
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button className="w-full min-h-[44px]">
                      Se connecter pour postuler
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full sm:w-auto min-h-[44px]">
                    Voir les offres depuis votre tableau de bord
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
