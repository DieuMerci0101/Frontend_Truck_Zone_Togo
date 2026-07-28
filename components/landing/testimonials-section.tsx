"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Kofi Agbeko",
    role: "Chauffeur",
    text: "Togo Truck Connect a transformé ma carrière. Je trouve des missions facilement et le contact avec les propriétaires est direct.",
    rating: 5,
  },
  {
    name: "Ama Dosseh",
    role: "Propriétaire",
    text: "J'ai recruté 3 chauffeurs grâce à la plateforme. Le système de vérification des documents est rassurant.",
    rating: 5,
  },
  {
    name: "Kwame Mensah",
    role: "Mécanicien",
    text: "Les demandes d'assistance arrivent directement sur mon téléphone. Mon activité a augmenté de 40%.",
    rating: 5,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const directions = [
  { hidden: { opacity: 0, x: -30 } },
  { hidden: { opacity: 0, y: 30 } },
  { hidden: { opacity: 0, x: 30 } },
];

export default function TestimonialsSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Avis de nos{" "}
            <span className="text-gradient">utilisateurs</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez ce que nos utilisateurs disent de la plateforme
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={directions[index].hidden}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <Quote className="h-8 w-8 sm:h-10 sm:w-10 text-blue-100 mb-4" />
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="font-semibold text-gray-900">
                  {testimonial.name}
                </div>
                <div className="text-sm text-blue-600">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
