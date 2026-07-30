"use client";

const features = [
  {
    title: "Profil vérifié",
    description:
      "Chaque utilisateur est authentifié et ses documents sont contrôlés avant activation.",
  },
  {
    title: "Géolocalisation",
    description:
      "Trouvez des mécaniciens à proximité et localisez les incidents en temps réel.",
  },
  {
    title: "Suivi des incidents",
    description:
      "Déclarez et suivez les incidents avec photos, gravité et statut en direct.",
  },
  {
    title: "Assistance mécanique",
    description:
      "Envolez une demande de dépannage et soyez mis en relation avec un mécanicien disponible.",
  },
  {
    title: "Messagerie intégrée",
    description:
      "Échangez directement avec chauffeurs, propriétaires et mécaniciens sans quitter la plateforme.",
  },
  {
    title: "Tableau de bord",
    description:
      "Consultez l&apos;ensemble de votre activité : offres, missions, documents et statistiques.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Fonctionnalités
          </h2>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto">
            Une plateforme conçue pour le transport routier
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="border border-slate-200 rounded-xl p-6 sm:p-8 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
