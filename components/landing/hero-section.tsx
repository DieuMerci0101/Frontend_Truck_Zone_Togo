"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

const heroSlides = [
  "/images/image1.jpg",
  "/images/image2.jpg",
  "/images/image3.jpg",
  "/images/image4.jpg",
  "/images/image5.jpg",
  "/images/image6.jpg",
  "/images/video1.png",
  "/images/image9.jpg",
  "/images/image10.jpg",
];

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen min-h-[600px] flex items-center overflow-hidden">

      {/* 1. CAROUSEL D'ARRIÈRE-PLAN (z-0) */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          loop
          speed={1200}
          className="w-full h-full"
        >
          {heroSlides.map((src, idx) => (
            <SwiperSlide key={idx} className="w-full h-full">
              <img
                src={src}
                alt="Transport routier"
                className="w-full h-full object-cover object-center"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 2. OVERLAY SOMBRE (z-10) */}
      <div className="absolute inset-0 z-10 bg-slate-900/65 pointer-events-none" />

      {/* 3. CONTENU ALIGNÉ AVEC LE LOGO & LA GRILLE (z-20) */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-left text-white">

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-normal mb-6">
            Mise en relation directe entre propriétaires de camions, chauffeurs et mécaniciens
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-200 mb-8 leading-relaxed">
            Trouvez rapidement des chauffeurs qualifiés ou une assistance mécanique fiable partout où vous êtes.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="/register"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all text-center"
            >
              Créer un compte
            </Link>
            <Link
              href="/about"
              className="bg-slate-900/80 hover:bg-slate-900 text-white font-medium py-3.5 px-6 rounded-xl border border-slate-700 transition-all text-center"
            >
              En savoir plus
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <span className="text-sm text-slate-300">Gratuit pour les chauffeurs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <span className="text-sm text-slate-300">Documents vérifiés</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <span className="text-sm text-slate-300">Support réactif</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
