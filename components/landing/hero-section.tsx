"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Pause, Play } from "lucide-react";

const heroSlides = [
  {
    title: "Recherchez vos camions et suivez votre flotte en temps réel",
    description:
      "Trouvez rapidement des poids lourds disponibles, gérez vos camions et gardez un œil sur l'ensemble de votre flotte au Togo, où que vous soyez.",
    cta: "Rejoindre la plateforme",
    href: "/register",
    secondaryCta: "Trouver un mécanicien",
    secondaryHref: "/mecaniciens",
    image: "/images/image 1.jpg",
    alt: "Camion poids lourd transportant des marchandises sur une route au Togo",
  },
  {
    title: "Des chauffeurs vérifiés, disponibles en temps réel et en toute sécurité",
    description:
      "Chaque chauffeur est soumis à une vérification KYC stricte. Consultez leur disponibilité en direct et collaborez en toute confiance.",
    cta: "Rejoindre la plateforme",
    href: "/register",
    secondaryCta: "Voir les offres",
    secondaryHref: "/offres",
    image: "/images/image 6.jpg",
    alt: "Chauffeur professionnel au volant d'un poids lourd",
  },
  {
    title: "Un réseau de mécaniciens géolocalisés pour vos dépannages d'urgence",
    description:
      "Signalez une panne et soyez mis en relation avec le mécanicien certifié le plus proche, avec alertes d'intervention et suivi en direct.",
    cta: "Demander une assistance mécanique",
    href: "/mecaniciens",
    secondaryCta: "Voir les offres",
    secondaryHref: "/offres",
    image: "/images/image 10.jpg",
    alt: "Mécanicien intervenant sur un camion en atelier de maintenance",
  },
];

const AUTOPLAY_DELAY = 5000;

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % heroSlides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(nextSlide, AUTOPLAY_DELAY);
    return () => clearInterval(timer);
  }, [paused, nextSlide]);

  return (
    <section className="relative min-h-[85svh] flex flex-col overflow-hidden bg-slate-950">
      {/* ─── Arrière-plans en fondu enchaîné (crossfade, boucle infinie) ─── */}
      {heroSlides.map((slide, idx) => (
        <div
          key={slide.title}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={idx !== activeIndex}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            loading={idx === 0 ? "eager" : "lazy"}
            className={`w-full h-full object-cover object-center ${
              idx === activeIndex ? "animate-ken-burns" : ""
            }`}
          />
        </div>
      ))}

      {/* ─── Voile sombre dynamique : contraste + lisibilité ─── */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-transparent" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />

      {/* ─── Contenu synchronisé — grid stacking : les slides partagent la même
             cellule, aucune variation de hauteur → boucle parfaitement fluide ─── */}
      <div className="relative flex-1 flex items-center pt-24 pb-8 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid">
            {heroSlides.map((slide, idx) => (
              <div
                key={slide.title}
                className={`col-start-1 row-start-1 max-w-2xl lg:max-w-6xl lg:w-[80%] transition-all duration-700 ease-in-out ${
                  idx === activeIndex
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-8 pointer-events-none"
                }`}
                aria-hidden={idx !== activeIndex}
              >
                <h1
                  className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight line-clamp-2 min-h-[2.2em] ${
                    idx === activeIndex ? "animate-fade-up" : ""
                  }`}
                >
                  {slide.title}
                </h1>
                <p
                  className={`mt-4 text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed max-w-xl lg:max-w-3xl line-clamp-3 ${
                    idx === activeIndex ? "animate-fade-up [animation-delay:120ms]" : ""
                  }`}
                >
                  {slide.description}
                </p>
                <div
                  className={`mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 ${
                    idx === activeIndex ? "animate-fade-up [animation-delay:240ms]" : ""
                  }`}
                >
                  <Link
                    href={slide.href}
                    className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-brand-500/20 transition-all hover:shadow-brand-500/30 hover:-translate-y-0.5 min-h-[48px]"
                  >
                    {slide.cta}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href={slide.secondaryHref}
                    className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl backdrop-blur-sm hover:bg-white/10 hover:border-white/60 transition-all min-h-[48px]"
                  >
                    {slide.secondaryCta === "Trouver un mécanicien" ? (
                      <MapPin className="h-5 w-5 text-brand-300" />
                    ) : (
                      <ArrowRight className="h-5 w-5" />
                    )}
                    {slide.secondaryCta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Contrôles du carrousel ─── */}
      <div className="relative z-10 pb-6 sm:pb-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {heroSlides.map((slide, idx) => (
              <button
                key={slide.title}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Aller à la diapositive ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 min-h-[10px] ${
                  idx === activeIndex
                    ? "w-9 bg-brand-400"
                    : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Reprendre la lecture" : "Mettre en pause"}
            className="inline-flex items-center gap-2 border border-white/25 text-white font-medium text-sm px-3.5 py-2 rounded-full backdrop-blur-sm hover:bg-white/10 transition-colors min-h-[44px]"
          >
            {paused ? (
              <>
                <Play className="h-4 w-4" />
                Lecture
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
