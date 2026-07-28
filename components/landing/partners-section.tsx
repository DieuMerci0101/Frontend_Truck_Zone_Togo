"use client";

import { motion } from "framer-motion";

const partners = [
  "Togo Transport",
  "LogiGo",
  "CamionExpress",
  "RouteSafe",
  "FreightTogo",
  "AfricaHaul",
];

export default function PartnersSection() {
  return (
    <section className="py-12 sm:py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Ils nous font <span className="text-gradient">confiance</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Rejoint par les meilleures entreprises de transport au Togo
          </p>
        </motion.div>
      </div>

      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="flex animate-marquee">
          {[...partners, ...partners].map((partner, index) => (
            <div
              key={`${partner}-${index}`}
              className="flex-shrink-0 mx-2 sm:mx-4"
            >
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 sm:px-8 py-3 sm:py-5 hover:shadow-md transition-shadow duration-300 min-w-[140px] sm:min-w-[200px]">
                <span className="text-sm sm:text-lg font-bold text-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap">
                  {partner}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
