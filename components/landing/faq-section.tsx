"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Comment s'inscrire sur la plateforme ?",
    answer:
      "Choisissez votre profil (chauffeur, propriétaire ou mécanicien) et complétez le formulaire d'inscription.",
  },
  {
    question: "L'inscription est-elle payante ?",
    answer:
      "L'inscription et la consultation sont gratuites. Certaines fonctionnalités avancées peuvent être payantes.",
  },
  {
    question: "Comment devenir chauffeur vérifié ?",
    answer:
      "Créez votre compte, complétez votre profil et uploadez vos documents (permis, CNI). L'administration vérifie sous 24 à 48 heures.",
  },
  {
    question: "Comment demander une assistance mécanique ?",
    answer:
      "Rendez-vous dans la section Assistance, décrivez votre panne et votre position. Un mécanicien proche sera notifié.",
  },
  {
    question: "Puis-je gérer plusieurs camions ?",
    answer:
      "Oui, les propriétaires peuvent ajouter et gérer l'ensemble de leur flotte.",
  },
  {
    question: "Comment signaler un incident ?",
    answer:
      "Allez dans la section Incidents, remplissez le formulaire avec le type, la gravité et la localisation.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-8 sm:py-12 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Questions fréquentes
          </h2>
          <p className="text-base sm:text-lg text-slate-500">
            Tout ce que vous devez savoir
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-slate-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-white hover:bg-slate-50 transition-colors min-h-[44px]"
              >
                <span className="font-medium text-slate-900 pr-4 text-sm sm:text-base">
                  {faq.question}
                </span>
                <span
                  className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              {openIndex === index && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm sm:text-base text-slate-600 leading-relaxed bg-slate-50 border-t border-slate-100">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
