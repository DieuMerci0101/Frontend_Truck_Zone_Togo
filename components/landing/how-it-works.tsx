"use client";

import { ClipboardCheck, LayoutDashboard, UserPlus } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Créez votre compte",
    description:
      "Inscrivez-vous en quelques clics et choisissez votre rôle : Chauffeur, Propriétaire de camions ou Mécanicien.",
  },
  {
    number: "02",
    icon: ClipboardCheck,
    title: "Vérification KYC par l'administration",
    description:
      "Soumettez vos documents d'identité et professionnels. Notre équipe les valide avant activation.",
  },
  {
    number: "03",
    icon: LayoutDashboard,
    title: "Accès complet au tableau de bord",
    description:
      "Démarrez vos activités : publiez des camions, postulez aux missions ou répondez aux interventions.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="pt-6 sm:pt-10 pb-14 sm:pb-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Comment ça <span className="text-brand-500">marche</span> ?
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto dark:text-slate-400">
            Trois étapes suffisent pour rejoindre la plus grande communauté du transport au Togo.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <div
            className="hidden md:block absolute top-8 left-[16%] right-[16%] border-t-2 border-dashed border-brand-200"
            aria-hidden="true"
          />
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative text-center">
                <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-shadow">
                  <Icon className="h-9 w-9" />
                  <span className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center ring-4 ring-white dark:bg-white dark:text-slate-900 dark:ring-slate-950">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-6 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xs mx-auto dark:text-slate-400">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
