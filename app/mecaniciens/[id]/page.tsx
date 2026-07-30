"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  MapPin,
  Wrench,
  Euro,
  Award,
  Phone,
} from "lucide-react";
import { mecanicienService } from "@/services/mecanicien.service";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DISPONIBILITE_MECANICIEN,
  TARIFICATION_MECANICIEN,
} from "@/constants";
import { getStatusColor } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function MecanicienDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const { data: mecanicien, isLoading } = useQuery({
    queryKey: ["mecanicien", id],
    queryFn: () => mecanicienService.getById(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!mecanicien) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Mécanicien non trouvé
          </h2>
          <BackButton fallback="/mecaniciens" label="Retour à la liste" className="text-sm text-slate-500 hover:text-slate-700 font-medium" />
        </div>
      </div>
    );
  }

  const canRequestAssistance =
    isAuthenticated && (user?.role === "chauffeur" || user?.role === "proprietaire");

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <BackButton fallback="/mecaniciens" label="Retour à la liste" className="text-sm text-slate-500 hover:text-slate-900 mb-4 sm:mb-6 min-h-[44px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xl sm:text-2xl flex-shrink-0 overflow-hidden">
                  {mecanicien.photo_url ? (
                    <img
                      src={mecanicien.photo_url}
                      alt=""
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    getInitials(mecanicien.user?.nom_complet || "ME")
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <CardTitle className="text-xl sm:text-2xl">
                      {mecanicien.user?.nom_complet || "Mécanicien"}
                    </CardTitle>
                    <Badge className={getStatusColor(mecanicien.disponibilite)}>
                      {DISPONIBILITE_MECANICIEN[mecanicien.disponibilite]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Wrench className="h-4 w-4" />
                      {mecanicien.annees_experience} ans d&apos;expérience
                    </span>
                    <span className="flex items-center gap-1">
                      <Euro className="h-4 w-4" />
                      {TARIFICATION_MECANICIEN[mecanicien.tarification]}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Rayon {mecanicien.rayon_intervention} km
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 sm:space-y-6">
              {mecanicien.bio && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">À propos</h3>
                  <p className="text-sm sm:text-base text-slate-600">{mecanicien.bio}</p>
                </div>
              )}

              {mecanicien.specialites?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Spécialités
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {mecanicien.specialites.map((s) => (
                      <Badge key={s} variant="default">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {mecanicien.certifications && mecanicien.certifications.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Certifications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {mecanicien.certifications.map((c) => (
                      <Badge key={c} variant="success" className="gap-1">
                        <Award className="h-3 w-3" />
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                {canRequestAssistance && (
                  <Link href="/dashboard/mecanicien/assistance" className="w-full sm:w-auto">
                    <Button className="w-full min-h-[44px]">
                      <Phone className="h-4 w-4 mr-2" />
                      Demander assistance
                    </Button>
                  </Link>
                )}
                {!isAuthenticated && (
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button className="w-full min-h-[44px]">
                      <Phone className="h-4 w-4 mr-2" />
                      Se connecter pour demander
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
