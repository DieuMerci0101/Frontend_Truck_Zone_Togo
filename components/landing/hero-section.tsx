"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-900">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1920&q=80"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-truck-driving-on-a-highway-at-sunset-42617-large.mp4"
          type="video/mp4"
        />
      </video>
      <div className="absolute inset-0 bg-slate-900/50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
            Mise en relation directe entre propriétaires de camions, chauffeurs et mécaniciens.
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-xl leading-relaxed">
            Gérez vos véhicules, trouvez des pannes en temps réel et simplifiez la logistique de votre flotte.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-amber-600 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-amber-700 transition-colors shadow-sm text-base sm:text-lg"
            >
              Créer un compte
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/chauffeurs"
              className="inline-flex items-center justify-center gap-2 border border-slate-400 text-slate-200 px-8 py-3.5 rounded-lg font-semibold hover:bg-slate-800 transition-colors text-base sm:text-lg"
            >
              Trouver un chauffeur
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <span className="text-sm text-slate-400">Gratuit pour les chauffeurs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <span className="text-sm text-slate-400">Documents vérifiés</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <span className="text-sm text-slate-400">Support réactif</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
