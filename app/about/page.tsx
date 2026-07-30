"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import BackButton from "@/components/ui/back-button";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const values = [
  {
    title: "Innovation",
    description:
      "Nous utilisons la technologie pour moderniser le secteur du transport routier au Togo.",
  },
  {
    title: "Fiabilité",
    description:
      "Chaque professionnel est vérifié et noté pour garantir un service de qualité.",
  },
  {
    title: "Sécurité",
    description:
      "La sécurité est au cœur de nos préoccupations, avec des mécaniciens disponibles 24h/24.",
  },
  {
    title: "Communauté",
    description:
      "Nous construisons une communauté solide de professionnels du transport.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="bg-slate-900 text-white py-10 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton fallback="/" label="Retour" className="text-sm text-slate-300 hover:text-white mb-4" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              À propos de{" "}
              <span className="text-amber-400">Togo Truck Connect</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto">
              La plateforme qui révolutionne le transport routier au Togo en
              connectant chauffeurs, propriétaires de camions et mécaniciens.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Notre Mission</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Simplifier et moderniser le transport routier au Togo en créant
              une plateforme qui connecte directement les chauffeurs, les
              propriétaires de camions et les mécaniciens. Nous voulons rendre
              le transport plus efficace, plus sûr et plus accessible pour tous
              les acteurs de la chaîne logistique togolaise.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Notre Vision</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Devenir la référence en Afrique de l&apos;Ouest pour la connexion
              des professionnels du transport routier. Nous aspirons à un
              écosystème où chaque acteur du transport peut trouver les
              ressources, les partenaires et l&apos;assistance dont il a besoin
              en quelques clics.
            </p>
          </motion.div>
        </div>

        <div className="mb-12 sm:mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8 sm:mb-10 lg:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
              Nos Valeurs
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
              Les principes qui guident notre travail au quotidien
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 text-center"
              >
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-900 rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 text-center text-white"
        >
          <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
            Prêt à rejoindre Togo Truck Connect ?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mb-6 sm:mb-8 max-w-xl mx-auto">
            Créez votre compte gratuitement et commencez à utiliser la
            plateforme dès aujourd&apos;hui.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-amber-600 hover:bg-amber-700 text-white border-0 min-h-[44px]">
                Créer un compte
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/chauffeurs" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-slate-400 text-slate-200 hover:bg-slate-800 min-h-[44px]"
              >
                Parcourir les chauffeurs
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
