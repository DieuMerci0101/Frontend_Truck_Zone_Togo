"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminService } from "@/services/admin.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { STATUT_DOCUMENT, TYPE_DOCUMENT } from "@/constants";
import { FileText, Check, X } from "lucide-react";

const statusVariant: Record<string, "success" | "destructive" | "warning" | "info"> = {
  valide: "success",
  rejete: "destructive",
  en_attente: "warning",
};

export default function AdminDocumentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filterStatut, setFilterStatut] = useState("");
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
    mutationFn: ({ id, statut }: { id: string; statut: string }) =>
      adminService.updateDocumentStatut(id, statut),
    onSuccess: () => {
      toast.success("Document mis à jour");
      queryClient.invalidateQueries({ queryKey: ["admin", "documents"] });
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const totalPages = documents ? Math.ceil(documents.length / limit) : 1;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Modération des documents</h1>
            <p className="text-gray-500">Validez ou rejetez les documents soumis</p>
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
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : documents && documents.length > 0 ? (
        <>
          <div className="space-y-3 sm:space-y-4">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                        <FileText className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">
                          {TYPE_DOCUMENT[doc.type_document as keyof typeof TYPE_DOCUMENT] || doc.type_document}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          Utilisateur: {doc.utilisateur_id.slice(0, 8)}... · Ajouté le{" "}
                          {formatDate(doc.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={statusVariant[doc.statut] || "info"}>
                        {STATUT_DOCUMENT[doc.statut as keyof typeof STATUT_DOCUMENT] || doc.statut}
                      </Badge>
                      {doc.statut === "en_attente" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() =>
                              validateMutation.mutate({ id: doc.id, statut: "valide" })
                            }
                            loading={validateMutation.isPending}
                            className="min-h-[44px]"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Valider
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              validateMutation.mutate({ id: doc.id, statut: "rejete" })
                            }
                            loading={validateMutation.isPending}
                            className="min-h-[44px]"
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
    </div>
  );
}
