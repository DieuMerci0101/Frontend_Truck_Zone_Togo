"use client";

import { motion, type Variants } from "framer-motion";
import { UserPlus, FileEdit, Link as LinkIcon, LayoutDashboard } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Créez votre compte",
    description: "Inscrivez-vous en quelques clics selon votre profil.",
  },
  {
    icon: FileEdit,
    number: "02",
    title: "Complétez votre profil",
    description: "Ajoutez vos informations et documents.",
  },
  {
    icon: LinkIcon,
    number: "03",
    title: "Connectez-vous",
    description: "Trouvez des partenaires et publiez des offres.",
  },
  {
    icon: LayoutDashboard,
    number: "04",
    title: "Gérez vos activités",
    description: "Suivez vos missions, incidents et paiements.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comment ça <span className="text-gradient">marche</span>?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Commencez en quelques étapes simples
          </p>
        </motion.div>

        {/* Desktop layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="hidden md:grid md:grid-cols-4 gap-8 relative"
        >
          <div className="absolute top-12 left-[12%] right-[12%] h-[2px] border-t-2 border-dashed border-blue-200" />
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="flex flex-col items-center text-center relative"
            >
              <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25">
                <step.icon className="h-10 w-10 text-white" />
              </div>
              <div className="text-sm font-bold text-blue-600 mb-2">
                Étape {step.number}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="md:hidden relative"
        >
          <div className="absolute left-12 top-0 bottom-0 w-[2px] border-l-2 border-dashed border-blue-200" />
          <div className="space-y-8">
            {steps.map((step) => (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className="flex gap-6 items-start"
              >
                <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <step.icon className="h-7 w-7 text-white" />
                </div>
                <div className="pt-1">
                  <div className="text-sm font-bold text-blue-600 mb-1">
                    Étape {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
