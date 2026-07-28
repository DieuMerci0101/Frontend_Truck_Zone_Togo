"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

const services = [
  {
    title: "Recrutement de Chauffeurs",
    description:
      "Trouvez les meilleurs chauffeurs qualifiés pour votre flotte. Consultez leurs profils, vérifiez leurs documents et recrutez en toute confiance.",
    href: "/chauffeurs",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800",
  },
  {
    title: "Gestion de Camions",
    description:
      "Gérez facilement votre parc de camions, suivez leur état, planifiez les maintenances et publiez vos disponibilités.",
    href: "/offres",
    image: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800",
  },
  {
    title: "Assistance Mécanique",
    description:
      "Besoin d'un dépannage en urgence? Contactez un mécanicien certifié près de votre position pour une intervention rapide.",
    href: "/mecaniciens",
    image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800",
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
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function ServicesSection() {
  return (
    <section id="services" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nos <span className="text-gradient">Services</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Des solutions complètes pour chaque acteur du transport routier
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        >
          {services.map((service) => (
            <motion.div key={service.title} variants={itemVariants}>
              <Link href={service.href} className="block group">
                <div className="relative h-64 sm:h-72 lg:h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-200 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                      {service.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-secondary-400 font-semibold group-hover:gap-3 transition-all duration-300 text-sm">
                      En savoir plus
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
