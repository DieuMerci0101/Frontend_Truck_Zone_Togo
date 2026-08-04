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
    <section
      id="features"
      className="py-6 sm:py-12 bg-amber-50/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Fonctionnalités
          </h2>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto">
            Une plateforme conçue pour le transport routier
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white shadow-sm border border-slate-200/60 rounded-xl p-5 sm:p-6 hover:shadow-md hover:border-slate-300 transition-all"
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
