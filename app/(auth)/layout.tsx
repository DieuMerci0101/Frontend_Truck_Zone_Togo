import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex overflow-x-hidden">
      {/* Left Panel - Image + Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-center justify-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1400&q=80')",
          }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-slate-900/80" />

        {/* Content */}
        <div className="relative z-10 text-white px-12 xl:px-16 max-w-xl">
          <Link href="/" className="inline-flex items-center gap-3 mb-10">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-white/20 shadow-lg">
              <img src="/logo1.jpeg" alt="Togo Truck Connect" className="h-10 w-auto object-contain" />
            </div>
            <div className="leading-tight">
              <div className="text-2xl font-bold tracking-tight leading-none">
                Togo Truck
              </div>
              <div className="text-lg font-bold text-amber-400 leading-none">
                Connect
              </div>
            </div>
          </Link>

          <h1 className="text-3xl xl:text-4xl font-bold leading-tight mb-4">
            La plateforme de transport routier{" "}
            <span className="text-amber-400">au Togo</span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed mb-10">
            Connectez chauffeurs, propriétaires de camions et mécaniciens
            pour faciliter le transport et la logistique.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
              <span className="text-slate-300 font-medium">Vérification des documents</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
              <span className="text-slate-300 font-medium">Messagerie en temps réel</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
              <span className="text-slate-300 font-medium">Géolocalisation des mécaniciens</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-slate-50">
        <div className="w-full max-w-md mx-auto">{children}</div>
      </div>
    </div>
  );
}
