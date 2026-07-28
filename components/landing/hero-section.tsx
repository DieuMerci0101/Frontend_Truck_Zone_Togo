"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Truck, Users, Building2, Wrench, ArrowRight, ChevronRight } from "lucide-react";

function useCountUp(target: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [hasStarted, target, duration]);

  return { count, ref };
}

const stats = [
  { icon: Users, label: "Chauffeurs", value: 500, suffix: "+" },
  { icon: Truck, label: "Camions", value: 200, suffix: "+" },
  { icon: Building2, label: "Entreprises", value: 100, suffix: "+" },
  { icon: Wrench, label: "Mécaniciens", value: 50, suffix: "+" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1600&q=80')",
        }}
      />
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/85 to-blue-950/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 via-transparent to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          {/* Left Content */}
          <div>
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-blue-100 font-medium">
                Plateforme #1 du transport au Togo
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6"
            >
              Connectez-vous au{" "}
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                transport routier
              </span>{" "}
              au Togo
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-blue-200/90 mb-10 max-w-xl leading-relaxed"
            >
              La plateforme qui réunit chauffeurs, propriétaires de camions
              et mécaniciens pour faciliter le transport et la logistique.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-3 bg-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 text-base sm:text-lg group"
              >
                Commencer gratuitement
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/chauffeurs"
                className="inline-flex items-center justify-center gap-3 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-base sm:text-lg"
              >
                Trouver un chauffeur
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-wrap items-center gap-6"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-blue-200">Gratuit pour les chauffeurs</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-blue-200">Documents vérifiés</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-blue-200">Support 24/7</span>
              </div>
            </motion.div>
          </div>

          {/* Right - Stats Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="hidden lg:grid grid-cols-2 gap-4"
          >
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </motion.div>
        </motion.div>

        {/* Mobile Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="lg:hidden mt-12 grid grid-cols-2 gap-3"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-bold text-white">
                <MobileCountUp target={stat.value} />
                {stat.suffix}
              </div>
              <div className="text-xs text-blue-200 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix: string;
}) {
  const { count, ref } = useCountUp(value, 2000);

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300 group"
    >
      <div className="w-14 h-14 mx-auto mb-4 bg-orange-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-7 w-7 text-orange-400" />
      </div>
      <div className="text-3xl font-bold text-white mb-1">
        {count}
        {suffix}
      </div>
      <div className="text-sm text-blue-200">{label}</div>
    </motion.div>
  );
}

function MobileCountUp({ target }: { target: number }) {
  const { count } = useCountUp(target, 2000);
  return <>{count}</>;
}
