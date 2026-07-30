"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminService } from "@/services/admin.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { STATUT_DOCUMENT, TYPE_DOCUMENT } from "@/constants";
import { FileText, Check, X, User, Shield, Download, ExternalLink } from "lucide-react";
import type { Document } from "@/types";

const statusVariant: Record<string, "success" | "destructive" | "warning" | "info"> = {
  valide: "success",
  rejete: "destructive",
  en_attente: "warning",
};

export default function AdminDocumentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filterStatut, setFilterStatut] = useState("");
  const [rejectDoc, setRejectDoc] = useState<{ userId: string; docIds: string[] } | null>(null);
  const [rejectMotif, setRejectMotif] = useState("");
  const limit = 10;

  const { data: documents, isLoading } = useQuery({
    queryKey: ["admin", "documents", page, filterStatut],
    queryFn: () =>
      adminService.getDocuments({
        skip: (page - 1) * limit,
        limit,
        statut: filterStatut || undefined,
      }),
  });

  const validateMutation = useMutation({
    mutationFn: ({ id, statut, motif }: { id: string; statut: string; motif?: string }) =>
      adminService.updateDocumentStatut(id, statut, motif),
    onSuccess: () => {
      toast.success("Document mis à jour");
      queryClient.invalidateQueries({ queryKey: ["admin", "documents"] });
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const usersWithDocs = useMemo(() => {
    if (!documents) return [];
    const map = new Map<string, { user: { id: string; nom: string; email: string; role: string }; docs: Document[] }>();
    for (const doc of documents) {
      const key = doc.utilisateur_id;
      if (!map.has(key)) {
        map.set(key, {
          user: {
            id: key,
            nom: doc.utilisateur_nom || "Inconnu",
            email: doc.utilisateur_email || "",
            role: doc.utilisateur_role || "",
          },
          docs: [],
        });
      }
      map.get(key)!.docs.push(doc);
    }
    return Array.from(map.values());
  }, [documents]);

  const totalPages = usersWithDocs ? Math.ceil(usersWithDocs.length / limit) : 1;

  const handleValidateAll = (docIds: string[]) => {
    for (const id of docIds) {
      validateMutation.mutate({ id, statut: "valide" });
    }
  };

  const handleRejectAll = () => {
    if (!rejectDoc || !rejectMotif.trim()) {
      toast.error("Veuillez saisir un motif de rejet");
      return;
    }
    for (const id of rejectDoc.docIds) {
      validateMutation.mutate({ id, statut: "rejete", motif: rejectMotif.trim() });
    }
    setRejectDoc(null);
    setRejectMotif("");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg">
            <FileText className="h-6 w-6 text-slate-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Modération des documents</h1>
            <p className="text-gray-500">Validez ou rejetez les documents soumis par les utilisateurs</p>
          </div>
        </div>
        <Select
          options={[
            { value: "", label: "Tous les statuts" },
            ...Object.entries(STATUT_DOCUMENT).map(([v, l]) => ({ value: v, label: l })),
          ]}
          value={filterStatut}
          onChange={(e) => {
            setFilterStatut(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-auto"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : usersWithDocs && usersWithDocs.length > 0 ? (
        <>
          <div className="space-y-4">
            {usersWithDocs.map(({ user, docs }) => {
              const pendingDocs = docs.filter((d) => d.statut === "en_attente");
              return (
                <Card key={user.id}>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <User className="h-6 w-6 text-slate-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{user.nom}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <Badge variant="info" className="mt-1">
                          <Shield className="h-3 w-3 mr-1" />
                          {user.role === "chauffeur"
                            ? "Chauffeur"
                            : user.role === "proprietaire"
                              ? "Propriétaire"
                              : user.role}
                        </Badge>
                      </div>
                      {pendingDocs.length > 0 && (
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => handleValidateAll(pendingDocs.map((d) => d.id))}
                            loading={validateMutation.isPending}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Valider tout
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setRejectDoc({ userId: user.id, docIds: pendingDocs.map((d) => d.id) });
                              setRejectMotif("");
                            }}
                            loading={validateMutation.isPending}
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Rejeter tout
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {docs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-white rounded-lg shrink-0">
                              <FileText className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm">
                                {TYPE_DOCUMENT[doc.type_document as keyof typeof TYPE_DOCUMENT] || doc.type_document}
                              </p>
                              <p className="text-xs text-gray-500">{formatDate(doc.created_at)}</p>
                              {doc.fichier_url && (
                                <div className="flex gap-2 mt-1">
                                  <a
                                    href={doc.fichier_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-amber-800"
                                                  >
                                                    <ExternalLink className="h-3 w-3" />
                                                    Voir
                                                  </a>
                                                  <a
                                                    href={doc.fichier_url}
                                                    download
                                                    className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-amber-800"
                                  >
                                    <Download className="h-3 w-3" />
                                    Télécharger
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge variant={statusVariant[doc.statut] || "info"} className="shrink-0 ml-2">
                            {STATUT_DOCUMENT[doc.statut as keyof typeof STATUT_DOCUMENT] || doc.statut}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucun document trouvé</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!rejectDoc} onClose={() => { setRejectDoc(null); setRejectMotif(""); }} title="Rejeter les documents">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Veuillez indiquer le motif du rejet. Un email sera envoyé à l&apos;utilisateur avec cette information.
          </p>
          <Textarea
            placeholder="Motif du rejet..."
            value={rejectMotif}
            onChange={(e) => setRejectMotif(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => { setRejectDoc(null); setRejectMotif(""); }}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleRejectAll} loading={validateMutation.isPending} disabled={!rejectMotif.trim()}>
              Confirmer le rejet
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
