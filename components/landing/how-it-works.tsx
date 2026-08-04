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
    <section id="how-it-works" className="py-8 sm:py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Comment ça marche ?
          </h2>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto">
            Commencez en quelques étapes
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold">
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
