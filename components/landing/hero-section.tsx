"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";

const heroSlides = [
  {
    title: "Mise en relation directe entre propriétaires de camion, chauffeurs et mécaniciens",
    description:
      "Trouvez rapidement des chauffeurs qualifiés ou une assistance mécanique fiable partout où vous êtes.",
    cta: "Commencer dès maintenant",
    href: "/register",
    image: "/images/image 1.jpg",
    alt: "Camion poids lourd sur une route de transport de marchandises",
  },
  {
    title: "Chauffeurs : trouvez des opportunités rapidement",
    description:
      "Connectez-vous aux propriétaires de camions et décrochez vos prochaines missions sans perdre de temps.",
    cta: "Commencer dès maintenant",
    href: "/register",
    image: "/images/image 6.jpg",
    alt: "Chauffeur professionnel sur une route de camionnage",
  },
  {
    title: "Mécaniciens : offrez votre assistance en direct",
    description:
      "Recevez des demandes de dépannage à proximité et développez votre activité d'intervention.",
    cta: "Commencer dès maintenant",
    href: "/register",
    image: "/images/image 3.jpg",
    alt: "Mécanicien intervenant sur un camion en atelier",
  },
  {
    title: "Propriétaires : gérez et publiez votre flotte de camions",
    description:
      "Publiez vos camions, suivez leur état et recrutez des chauffeurs vérifiés en toute confiance.",
    cta: "Commencer dès maintenant",
    href: "/register",
    image: "/images/image 2.jpg",
    alt: "Flotte de camions poids lourds de transport de marchandises",
  },
  {
    title: "Des opportunités pour tous les acteurs du transport",
    description:
      "Un tableau de bord complet pour vos offres, missions, documents et statistiques.",
    cta: "Commencer dès maintenant",
    href: "/register",
    image: "/images/image 5.jpg",
    alt: "Ensemble des services de transport et de recrutement de la plateforme",
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
    /* pt = hauteur navbar (64px/80px) + marge d'aération généreuse.
       min-h = 100vh - zone réservée pour laisser dépasser le titre "Fonctionnalités". */
    <section className="bg-slate-50 pt-[92px] sm:pt-[96px] lg:pt-[112px] pb-4 sm:pb-6 flex flex-col min-h-[calc(100vh-9rem)]">
      <div className="w-[94%] max-w-7xl mx-auto flex flex-col flex-1">
        {/* ─── Carte Bannière (hauteur adaptative 100vh) ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:grid md:grid-cols-2 flex-1 min-h-[500px] sm:min-h-[520px] md:min-h-[560px]">
          {/* Visuel : image biseautée qui s'imbrique dans le bloc texte */}
          <div className="relative h-44 sm:h-56 md:h-full bg-slate-900 overflow-hidden md:z-10 md:mr-[-56px] hero-image-clip">
            {heroSlides.map((slide, idx) => (
              <div
                key={slide.title}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === activeIndex ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={idx !== activeIndex}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  loading={idx === 0 ? "eager" : "lazy"}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent md:bg-none" />
          </div>

          {/* Texte */}
          <div className="relative flex-1 md:h-full bg-white">
            {heroSlides.map((slide, idx) => (
              <div
                key={slide.title}
                className={`absolute inset-0 flex flex-col justify-center p-6 sm:p-7 md:p-10 lg:p-16 md:pl-24 transition-all duration-700 ease-in-out ${
                  idx === activeIndex
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-6 pointer-events-none"
                }`}
                aria-hidden={idx !== activeIndex}
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-3 sm:mb-4">
                  {slide.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed mb-5 sm:mb-6 max-w-md">
                  {slide.description}
                </p>
                <Link
                  href={slide.href}
                  className="inline-flex items-center justify-center gap-2 bg-[#E59E00] hover:bg-[#C98A00] text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-colors w-full sm:w-auto min-h-[44px]"
                >
                  {slide.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Contrôles : pointillés + Play/Pause (accent ambre) ─── */}
        <div className="flex flex-col items-center mt-4 gap-2.5">
          <div className="flex items-center gap-2">
            {heroSlides.map((slide, idx) => (
              <button
                key={slide.title}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Aller à la diapositive ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 min-h-[8px] ${
                  idx === activeIndex
                    ? "w-7 bg-[#E59E00]"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Reprendre la lecture" : "Mettre en pause"}
            className="w-9 h-9 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-[#E59E00] hover:text-[#C98A00] hover:border-[#E59E00]/50 transition-colors min-h-[36px] min-w-[36px]"
          >
            {paused ? (
              <Play className="h-4 w-4 ml-0.5" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
