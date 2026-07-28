"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Truck,
  MessageSquare,
  Briefcase,
  Shield,
} from "lucide-react";
import { chauffeurService } from "@/services/chauffeur.service";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DISPONIBILITE_CHAUFFEUR } from "@/constants";
import { getStatusColor } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ChauffeurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const { data: chauffeur, isLoading } = useQuery({
    queryKey: ["chauffeur", id],
    queryFn: () => chauffeurService.getById(id),
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
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-8 w-48" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!chauffeur) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Truck className="h-14 w-14 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chauffeur non trouvé
          </h2>
          <Link href="/chauffeurs">
            <Button variant="outline" className="min-h-[44px]">Retour à la liste</Button>
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
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl sm:text-2xl flex-shrink-0 overflow-hidden">
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
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <CardTitle className="text-xl sm:text-2xl">
                      {chauffeur.user?.nom_complet || "Chauffeur"}
                    </CardTitle>
                    <Badge className={getStatusColor(chauffeur.disponibilite)}>
                      {DISPONIBILITE_CHAUFFEUR[chauffeur.disponibilite]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      Permis {chauffeur.categorie_permis}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {chauffeur.annees_experience} ans d&apos;expérience
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 sm:space-y-6">
              {chauffeur.bio && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">À propos</h3>
                  <p className="text-sm sm:text-base text-gray-600">{chauffeur.bio}</p>
                </div>
              )}

              {chauffeur.types_transport?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Types de transport
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {chauffeur.types_transport.map((t) => (
                      <Badge key={t} variant="default">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {chauffeur.zones_circulation?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Zones de circulation
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {chauffeur.zones_circulation.map((z) => (
                      <Badge key={z} variant="outline" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        {z}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                {isAuthenticated ? (
                  <Link href="/dashboard/chat" className="w-full sm:w-auto">
                    <Button className="w-full min-h-[44px]">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contacter
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button className="w-full min-h-[44px]">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Se connecter pour contacter
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
