"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { mecanicienService } from "@/services/mecanicien.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { SPECIALITES_MECANICIEN } from "@/constants";
import { Wrench, Plus, X, Save } from "lucide-react";

export default function MecanicienSpecialitesPage() {
  const queryClient = useQueryClient();
  const [specialites, setSpecialites] = useState<string[]>([]);
  const [newSpecialite, setNewSpecialite] = useState("");
  const [initialized, setInitialized] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["mecanicien", "profile"],
    queryFn: () => mecanicienService.getMyProfile(),
    retry: false,
  });

  useEffect(() => {
    if (profile && !initialized) {
      setSpecialites(profile.specialites || []);
      setInitialized(true);
    }
  }, [profile, initialized]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => mecanicienService.updateProfile(data),
    onSuccess: () => {
      toast.success("Spécialités mises à jour");
      queryClient.invalidateQueries({ queryKey: ["mecanicien", "profile"] });
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const addSpecialite = () => {
    if (newSpecialite && !specialites.includes(newSpecialite)) {
      setSpecialites([...specialites, newSpecialite]);
      setNewSpecialite("");
    }
  };

  const removeSpecialite = (s: string) => {
    setSpecialites(specialites.filter((x) => x !== s));
  };

  const handleSave = () => {
    updateMutation.mutate({ specialites });
  };

  const available = SPECIALITES_MECANICIEN.filter((s) => !specialites.includes(s));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 rounded-lg">
          <Wrench className="h-6 w-6 text-slate-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Spécialités</h1>
          <p className="text-gray-500">Gérez vos domaines de compétence</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mes spécialités</CardTitle>
          <CardDescription>
            Ajoutez ou retirez vos spécialités pour être trouvé par les propriétaires
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {specialites.length > 0 ? (
                  specialites.map((s) => (
                    <Badge key={s} variant="info" className="flex items-center gap-1.5 py-1.5 px-3 text-sm">
                      {s}
                      <button
                        onClick={() => removeSpecialite(s)}
                        className="hover:text-red-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">
                    Aucune spécialité définie
                  </p>
                )}
              </div>

              <Separator />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ajouter une spécialité
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select
                    options={available.map((s) => ({ value: s, label: s }))}
                    value={newSpecialite}
                    onChange={(e) => setNewSpecialite(e.target.value)}
                    placeholder={available.length === 0 ? "Toutes ajoutées" : "Sélectionner..."}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addSpecialite}
                    disabled={!newSpecialite}
                    className="min-h-[44px]"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  loading={updateMutation.isPending}
                  disabled={!profile}
                  className="w-full sm:w-auto min-h-[44px]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Toutes les spécialités disponibles</CardTitle>
          <CardDescription>
            Voici la liste complète des spécialités reconnues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SPECIALITES_MECANICIEN.map((s) => (
              <Badge
                key={s}
                variant={specialites.includes(s) ? "default" : "outline"}
              >
                {s}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
