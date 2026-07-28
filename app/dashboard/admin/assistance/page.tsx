"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Headphones } from "lucide-react";

export default function AdminAssistancePage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-50 rounded-lg">
          <Headphones className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assistance — Vue d'ensemble</h1>
          <p className="text-gray-500">Suivi de toutes les demandes d'assistance</p>
        </div>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Headphones className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">
            Les demandes d&apos;assistance sont visibles par les mécaniciens et propriétaires concernés.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Consultez les notifications pour les mises à jour en temps réel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
