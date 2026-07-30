"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const services = [
  {
    title: "Recrutement de chauffeurs",
    description:
      "Consultez les profils des chauffeurs disponibles, vérifiez leurs documents et recrutez en confiance.",
    href: "/chauffeurs",
    image: "/images/image8.jpg",
  },
  {
    title: "Gestion de flotte",
    description:
      "Ajoutez vos camions, suivez leur état et publiez leurs disponibilités pour les chauffeurs.",
    href: "/offres",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Assistance mécanique",
    description:
      "Besoin d&apos;un dépannage ? Contactez un mécanicien certifié proche de votre position.",
    href: "/mecaniciens",
    image: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 sm:py-20 lg:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Services
          </h2>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto">
            Des solutions adaptées à chaque acteur du transport
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {services.map((service) => (
            <Link key={service.title} href={service.href} className="block group">
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={service.image}
                  alt={service.title === "Recrutement de chauffeurs" ? "Équipe de chauffeurs professionnels et flotte de camions poids lourds" : service.title}
                  className="object-cover h-48 w-full rounded-t-lg"
                />
                <div className="p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                    {service.description}
                  </p>
                  <span className="tooltip inline-flex items-center gap-1.5 text-amber-600 font-semibold text-sm group-hover:gap-2.5 transition-all" data-tip="Voir les détails">
                    En savoir plus
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
