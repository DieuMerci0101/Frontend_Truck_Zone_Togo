"use client";

import { motion, type Variants } from "framer-motion";
import { Shield, Zap, MapPin, FileCheck, Headphones, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Sécurité & Confiance",
    description:
      "Vérification des profils et documents pour garantir la fiabilité de chaque utilisateur.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Zap,
    title: "Temps Réel",
    description:
      "Messagerie instantanée et notifications pour une communication fluide.",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    icon: MapPin,
    title: "Géolocalisation",
    description:
      "Trouvez des mécaniciens et incidents proches de votre position.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: FileCheck,
    title: "Documents Vérifiés",
    description:
      "Système de validation des documents par l'administration.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Headphones,
    title: "Assistance 24/7",
    description:
      "Demandes d'assistance mécanique rapides et efficaces.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: BarChart3,
    title: "Statistiques",
    description:
      "Tableau de bord complet pour suivre votre activité.",
    color: "bg-red-100 text-red-600",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pourquoi choisir{" "}
            <span className="text-gradient">Togo Truck Connect</span>?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Une plateforme complète conçue pour répondre aux besoins du
            transport routier au Togo
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group bg-white rounded-xl border border-gray-100 p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
