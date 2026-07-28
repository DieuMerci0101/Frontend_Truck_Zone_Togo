import type { ReactNode } from "react";
import { Truck, Shield, Clock, MapPin } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Shield, text: "Vérification des documents" },
  { icon: Clock, text: "Messagerie en temps réel" },
  { icon: MapPin, text: "Géolocalisation des mécaniciens" },
];

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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-900/85 to-blue-950/90" />

        {/* Content */}
        <div className="relative z-10 text-white px-12 xl:px-16 max-w-xl">
          <Link href="/" className="inline-flex items-center gap-3 mb-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Togo Truck Connect
            </span>
          </Link>

          <h1 className="text-3xl xl:text-4xl font-bold leading-tight mb-4">
            La plateforme de transport routier{" "}
            <span className="text-orange-400">au Togo</span>
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed mb-10">
            Connectez chauffeurs, propriétaires de camions et mécaniciens
            pour faciliter le transport et la logistique.
          </p>

          <div className="space-y-4">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                  <f.icon className="h-5 w-5 text-orange-400" />
                </div>
                <span className="text-blue-100 font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-gray-50">
        <div className="w-full max-w-md mx-auto">{children}</div>
      </div>
    </div>
  );
}
