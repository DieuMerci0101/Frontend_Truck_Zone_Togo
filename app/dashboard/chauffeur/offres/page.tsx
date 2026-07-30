"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chauffeurService, type Offre } from "@/services/chauffeur.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney, formatDate } from "@/lib/utils";
import { TYPE_CONTRAT, ZONES_CIRCULATION } from "@/constants";
import toast from "react-hot-toast";
import { Briefcase, MapPin, Calendar, Search, Send, CheckCircle, Truck, MessageCircle, Clock, User } from "lucide-react";

export default function ChauffeurOffresPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterContrat, setFilterContrat] = useState("");
  const [filterZone, setFilterZone] = useState("");
  const [selectedOffre, setSelectedOffre] = useState<Offre | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");

  const { data: offres, isLoading } = useQuery({
    queryKey: ["chauffeur", "offres", filterContrat, filterZone],
    queryFn: () => chauffeurService.getOffres({ type_contrat: filterContrat || undefined, zone: filterZone || undefined }),
  });

  const filteredOffres = offres?.filter((o) =>
    !searchQuery || o.titre.toLowerCase().includes(searchQuery.toLowerCase()) || o.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { data: candidatures } = useQuery({
    queryKey: ["chauffeur", "candidatures", selectedOffre?.id],
    queryFn: () => chauffeurService.getMesCandidatures(selectedOffre!.id),
    enabled: !!selectedOffre,
  });

  const postulerMutation = useMutation({
    mutationFn: ({ offreId, message }: { offreId: string; message?: string }) =>
      chauffeurService.postulerOffre(offreId, message),
    onSuccess: (data: any) => {
      toast.success("Candidature envoyée ! Conversation créée.");
      setShowApplyDialog(false);
      setApplyMessage("");
      setSelectedOffre(null);
      queryClient.invalidateQueries({ queryKey: ["chauffeur", "candidatures"] });
      if (data.conversation_id) {
        setTimeout(() => router.push(`/dashboard/chat/${data.conversation_id}`), 800);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Erreur lors de l'envoi");
    },
  });

  const handleApply = () => {
    if (!selectedOffre) return;
    if (!applyMessage.trim()) {
      toast.error("Veuillez écrire un message d'accompagnement");
      return;
    }
    postulerMutation.mutate({ offreId: selectedOffre.id, message: applyMessage });
  };

  const hasApplied = candidatures && candidatures.length > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 rounded-lg">
          <Briefcase className="h-6 w-6 text-slate-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offres disponibles</h1>
          <p className="text-gray-500">Parcourez les offres et postulez directement</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Rechercher une offre..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select
          options={[{ value: "", label: "Tous les contrats" }, ...Object.entries(TYPE_CONTRAT).map(([v, l]) => ({ value: v, label: l }))]}
          value={filterContrat}
          onChange={(e) => setFilterContrat(e.target.value)}
          className="w-full sm:w-auto"
        />
        <Select
          options={[{ value: "", label: "Toutes les zones" }, ...ZONES_CIRCULATION.map((z) => ({ value: z, label: z }))]}
          value={filterZone}
          onChange={(e) => setFilterZone(e.target.value)}
          className="w-full sm:w-auto"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-56" />)}
        </div>
      ) : filteredOffres && filteredOffres.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOffres.map((offre) => (
            <Card key={offre.id} className={`flex flex-col hover:shadow-md transition-shadow ${offre.is_expired ? 'opacity-60' : ''}`}>
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{offre.titre}</h3>
                  <div className="flex gap-1 shrink-0">
                    {offre.is_expired && (
                      <Badge variant="destructive" className="text-[10px]">Expirée</Badge>
                    )}
                    <Badge variant="info" className="text-[10px]">
                      {TYPE_CONTRAT[offre.type_contrat as keyof typeof TYPE_CONTRAT] || offre.type_contrat}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">{offre.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-sm font-semibold text-green-700">{formatMoney(offre.salaire_propose)}</span>
                </div>
                {offre.proprietaire_info && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-3">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <User className="h-3.5 w-3.5 text-slate-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{offre.proprietaire_info.nom_complet}</p>
                      {offre.proprietaire_info.nom_entreprise && (
                        <p className="text-[10px] text-gray-500 truncate">{offre.proprietaire_info.nom_entreprise}</p>
                      )}
                    </div>
                  </div>
                )}
                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {offre.zone_travail}</p>
                  <p className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Début: {formatDate(offre.date_debut)}</p>
                  {offre.expires_at && (
                    <p className="flex items-center gap-1"><Clock className="h-3 w-3" /> Expire le: {formatDate(offre.expires_at)}</p>
                  )}
                </div>
                {offre.camion_id && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <Truck className="h-3 w-3" /> Camion assigné
                  </div>
                )}
                <div className="flex gap-2 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-[44px] flex-1"
                    onClick={() => setSelectedOffre(offre)}
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Détails
                  </Button>
                  {!offre.is_expired && (
                    <Button
                      size="sm"
                      className="min-h-[44px] flex-1"
                      onClick={() => { setSelectedOffre(offre); setShowApplyDialog(true); }}
                    >
                      <Send className="h-3.5 w-3.5 mr-1" /> Postuler
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {searchQuery || filterContrat || filterZone ? "Aucune offre ne correspond à vos critères" : "Aucune offre disponible pour le moment"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedOffre && !showApplyDialog} onClose={() => setSelectedOffre(null)} title="Détails de l'offre" size="lg">
        {selectedOffre && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900">{selectedOffre.titre}</h3>
                {selectedOffre.is_expired && (
                  <Badge variant="destructive" className="text-xs">Expirée</Badge>
                )}
              </div>
              <p className="text-gray-600 mt-2">{selectedOffre.description}</p>
            </div>
            {selectedOffre.proprietaire_info && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedOffre.proprietaire_info.nom_complet}</p>
                  {selectedOffre.proprietaire_info.nom_entreprise && (
                    <p className="text-xs text-gray-600">{selectedOffre.proprietaire_info.nom_entreprise}</p>
                  )}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Type de contrat</p>
                <p className="font-semibold">{TYPE_CONTRAT[selectedOffre.type_contrat as keyof typeof TYPE_CONTRAT] || selectedOffre.type_contrat}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-500">Salaire</p>
                <p className="font-semibold text-green-700">{formatMoney(selectedOffre.salaire_propose)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-gray-500">Zone</p>
                <p className="font-semibold flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {selectedOffre.zone_travail}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-500">Début</p>
                <p className="font-semibold flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(selectedOffre.date_debut)}</p>
              </div>
            </div>
            {selectedOffre.expires_at && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${selectedOffre.is_expired ? 'bg-red-50' : 'bg-amber-50'}`}>
                <Clock className="h-4 w-4 shrink-0" />
                <p className={`text-sm font-medium ${selectedOffre.is_expired ? 'text-red-700' : 'text-amber-700'}`}>
                  {selectedOffre.is_expired ? "Cette offre a expiré" : `Expire le ${formatDate(selectedOffre.expires_at)}`}
                </p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedOffre(null)} className="w-full sm:w-auto min-h-[44px]">Fermer</Button>
              {!selectedOffre.is_expired && (
                <Button onClick={() => setShowApplyDialog(true)} className="w-full sm:w-auto min-h-[44px]">
                  <Send className="h-4 w-4 mr-2" /> Postuler
                </Button>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* Apply Dialog */}
      <Dialog open={showApplyDialog} onClose={() => { setShowApplyDialog(false); setApplyMessage(""); }} title="Postuler à l'offre" size="md">
        {selectedOffre && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-semibold text-slate-900">{selectedOffre.titre}</p>
              <p className="text-xs text-slate-700 mt-1">{formatMoney(selectedOffre.salaire_propose)} · {selectedOffre.zone_travail}</p>
            </div>
            {hasApplied ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
                <p className="text-lg font-semibold text-gray-900">Déjà postulé</p>
                <p className="text-sm text-gray-500 mt-1">Vous avez déjà postulé à cette offre</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message au propriétaire <span className="text-red-500">*</span></label>
                  <textarea
                    value={applyMessage}
                    onChange={(e) => setApplyMessage(e.target.value)}
                    placeholder="Présentez-vous et expliquez pourquoi vous êtes le bon candidat..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[100px] resize-none"
                    rows={4}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Ce message est obligatoire. Il sera envoyé au propriétaire.</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-green-600 shrink-0" />
                  <p className="text-xs text-green-800">Un message automatique sera envoyé au propriétaire et une conversation sera créée.</p>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setShowApplyDialog(false); setApplyMessage(""); }} className="w-full sm:w-auto min-h-[44px]">Annuler</Button>
                  <Button onClick={handleApply} loading={postulerMutation.isPending} className="w-full sm:w-auto min-h-[44px]">
                    <Send className="h-4 w-4 mr-2" /> Envoyer ma candidature
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
