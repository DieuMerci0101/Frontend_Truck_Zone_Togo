"use client";

const steps = [
  {
    number: "01",
    title: "Créez votre compte",
    description: "Inscrivez-vous en quelques clics selon votre profil.",
  },
  {
    number: "02",
    title: "Complétez votre profil",
    description: "Ajoutez vos informations et téléchargez vos documents.",
  },
  {
    number: "03",
    title: "Connectez-vous",
    description: "Trouvez des partenaires et publiez des offres.",
  },
  {
    number: "04",
    title: "Suivez votre activité",
    description: "Consultez vos missions, incidents et statistiques.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto">
            Commencez en quelques étapes
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {steps.map((step, index) => (
            <div key={step.number} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
