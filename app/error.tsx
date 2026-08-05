"use client";

import { useEffect } from "react";

export default function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erreur globale d'application :", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
          <span className="text-2xl leading-none text-red-600">!</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          Une erreur est survenue
        </h1>
        <p className="text-sm text-slate-500">
          La page n&apos;a pas pu être affichée. Vous pouvez réessayer ou revenir
          à l&apos;accueil.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors min-h-[44px]"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors min-h-[44px]"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}
