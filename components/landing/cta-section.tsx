"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-blue-700 via-blue-600 to-secondary-500 overflow-hidden">
      <div className="absolute inset-0 truck-pattern" />

      <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Prêt à révolutionner votre transport?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Rejoignez des centaines d&apos;utilisateurs qui font déjà confiance
            à Togo Truck Connect.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-3.5 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl text-base sm:text-lg"
            >
              Commencer maintenant
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 text-base sm:text-lg"
            >
              En savoir plus
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
