"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Comment s'inscrire sur Togo Truck Connect?",
    answer:
      "L'inscription est simple et gratuite. Choisissez votre profil (chauffeur, propriétaire ou mécanicien) et complétez le formulaire.",
  },
  {
    question: "Les services sont-ils payants?",
    answer:
      "L'inscription et la consultation sont gratuites. Certaines fonctionnalités avancées peuvent être premium.",
  },
  {
    question: "Comment devenir chauffeur vérifié?",
    answer:
      "Créez votre compte, complétez votre profil et uploadez vos documents (permis, CNI). L'administration vérifiera sous 24-48h.",
  },
  {
    question: "Comment demander une assistance mécanique?",
    answer:
      "Rendez dans la section Assistance, décrivez votre panne et votre localisation. Un mécanicien proche sera notifié.",
  },
  {
    question: "Puis-je gérer plusieurs camions?",
    answer:
      "Oui, les propriétaires peuvent ajouter et gérer toute leur flotte de camions.",
  },
  {
    question: "Comment signaler un incident?",
    answer:
      "Allez dans la section Incidents, remplissez le formulaire avec le type, la gravité et la localisation.",
  },
];

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-200 transition-colors duration-300">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 sm:p-6 text-left bg-white hover:bg-gray-50 transition-colors duration-200 min-h-[44px]"
      >
        <span className="font-semibold text-gray-900 pr-4 text-sm sm:text-base">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-base text-gray-600 leading-relaxed bg-gray-50">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Questions{" "}
            <span className="text-gradient">Fréquentes</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Tout ce que vous devez savoir sur Togo Truck Connect
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
