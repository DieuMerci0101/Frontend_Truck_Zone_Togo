"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  CheckCircle2,
  MapPin,
  Truck,
  UserRound,
  Wrench,
} from "lucide-react";

const actorCards = [
  {
    role: "Chauffeurs",
    icon: UserRound,
    description:
      "Profil vérifié par KYC, disponibilité en direct et accès aux missions proposées par les propriétaires de camions.",
    points: ["Profils vérifiés", "Statut de disponibilité en direct", "Offres de mission"],
    href: "/chauffeurs",
    cta: "Voir les chauffeurs",
    accent: "from-brand-400/90 to-brand-600/90",
    hover: "hover:border-brand-300 dark:hover:border-brand-300",
    iconBg: "bg-brand-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white dark:bg-brand-500/15 dark:text-brand-300",
  },
  {
    role: "Propriétaires de Camions",
    icon: Truck,
    description:
      "Gérez votre flotte, publiez vos camions et recrutez des chauffeurs qualifiés grâce à la messagerie intégrée.",
    points: ["Gestion de flotte", "Recherche de chauffeurs qualifiés", "Messagerie directe"],
    href: "/offres",
    cta: "Gérer ma flotte",
    accent: "from-slate-700 to-slate-900",
    hover: "hover:border-slate-400 dark:hover:border-slate-500",
    iconBg: "bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white dark:bg-slate-700 dark:text-slate-200",
  },
  {
    role: "Mécaniciens",
    icon: Wrench,
    description:
      "Recevez des alertes de panne à proximité, gérez vos interventions et développez votre réseau de réparation.",
    points: ["Réseau de réparation", "Géolocalisation", "Alertes d'intervention"],
    href: "/mecaniciens",
    cta: "Trouver un mécanicien",
    accent: "from-brand-500 to-brand-700",
    hover: "hover:border-brand-300 dark:hover:border-brand-300",
    iconBg: "bg-brand-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white dark:bg-brand-500/15 dark:text-brand-300",
  },
];

const platformHighlights = [
  { icon: BadgeCheck, label: "Acteurs vérifiés" },
  { icon: MapPin, label: "Géolocalisation" },
  { icon: CalendarCheck2, label: "Disponibilité en direct" },
];

export default function ServicesSection() {
  return (
    <section id="services" className="pt-8 sm:pt-12 pb-8 sm:pb-12 bg-amber-50/40 dark:bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Une plateforme pour <span className="text-brand-500">tous les acteurs</span> du
            transport
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto dark:text-slate-400">
            Chauffeurs, propriétaires de camions et mécaniciens collaborent sur un seul et même
            espace sécurisé.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {actorCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.role}
                className={`group relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 dark:bg-slate-800 ${card.hover}`}
              >
                <div
                  className={`h-1.5 w-full bg-gradient-to-r ${card.accent} opacity-80 group-hover:opacity-100 transition-opacity`}
                />
                <div className="p-6 sm:p-7">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl transition-colors duration-300 ${card.iconBg}`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {card.role}
                  </h3>
                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed dark:text-slate-300">
                    {card.description}
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {card.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                        <CheckCircle2 className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={card.href}
                    className="mt-6 inline-flex items-center gap-2 text-brand-600 font-semibold text-sm group-hover:gap-3 group-hover:text-brand-700 transition-all dark:text-brand-400 dark:group-hover:text-brand-300"
                  >
                    {card.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {platformHighlights.map((h) => {
            const Icon = h.icon;
            return (
              <div
                key={h.label}
                className="inline-flex items-center gap-2.5 bg-white border border-slate-200 rounded-full px-5 py-2.5 shadow-sm dark:bg-slate-800 dark:border-slate-700"
              >
                <Icon className="h-5 w-5 text-brand-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{h.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
