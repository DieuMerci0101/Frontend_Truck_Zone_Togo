import Link from "next/link";
import BackButton from "@/components/ui/back-button";
import { ArrowRight, MapPin, Briefcase, ShieldCheck } from "lucide-react";

const pillars = [
  {
    icon: MapPin,
    title: "Géolocalisation d'assistance",
    description:
      "Les mécaniciens et chauffeurs en difficulté se retrouvent en temps réel, partout au Togo.",
  },
  {
    icon: Briefcase,
    title: "Publication d'offres de fret",
    description:
      "Propriétaires et transporteurs publient et trouvent des opportunités de fret en quelques clics.",
  },
  {
    icon: ShieldCheck,
    title: "Gestion de profil vérifié",
    description:
      "Des profils contrôlés et notés pour un transport plus sûr et plus fiable.",
  },
];

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="bg-slate-900 text-white py-8 sm:py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton
            fallback="/"
            label="Retour"
            className="text-sm text-slate-300 hover:text-white mb-6 inline-flex"
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-3 sm:mb-4">
            À propos de{" "}
            <span className="text-amber-400">Togo Truck Connect</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto text-center">
            La plateforme qui met en relation directe les propriétaires de
            camions, les chauffeurs professionnels et les mécaniciens au Togo.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16 space-y-8 sm:space-y-10 lg:space-y-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          <div className="bg-white shadow-sm border border-slate-200/60 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full inline-block" />
              Notre Mission
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Faciliter la mise en relation sécurisée et directe entre
              propriétaires de véhicules, chauffeurs professionnels et
              mécaniciens. Notre plateforme supprime les intermédiaires et
              connecte chaque acteur du transport routier en toute confiance.
            </p>
          </div>

          <div className="bg-white shadow-sm border border-slate-200/60 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full inline-block" />
              Nos Objectifs
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Digitaliser la chaîne logistique, réduire les temps d&apos;arrêt
              des camions et créer des opportunités d&apos;emploi fiables au
              Togo. Nous voulons rendre le transport routier plus efficace,
              plus sûr et plus rentable pour tous.
            </p>
          </div>
        </div>

        <div className="bg-amber-50/50 rounded-xl py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-3">
              Ce que nous faisons
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
              Des solutions concrètes pour chaque acteur de la chaîne de
              transport
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-white shadow-sm border border-slate-200/60 rounded-xl p-5 sm:p-6"
              >
                <div className="w-11 h-11 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                  <pillar.icon className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 text-center text-white">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
            Prêt à rejoindre Togo Truck Connect ?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mb-6 sm:mb-8 max-w-xl mx-auto">
            Créez votre compte gratuitement et commencez à utiliser la
            plateforme dès aujourd&apos;hui.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors shadow-sm min-h-[44px]"
          >
            Commencer dès maintenant
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
