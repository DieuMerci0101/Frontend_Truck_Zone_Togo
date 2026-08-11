"use client";

import { useEffect, useState, useRef } from "react";

function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, []);

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
  { value: 500, suffix: "+", label: "Chauffeurs certifiés" },
  { value: 200, suffix: "+", label: "Camions disponibles" },
  { value: 1000, suffix: "+", label: "Interventions réussies" },
  { value: 98, suffix: "%", label: "Satisfaction" },
];

export default function StatsSection() {
  return (
    <section className="py-14 sm:py-20 bg-slate-900 dark:bg-slate-950 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, #E59E00 0, transparent 40%), radial-gradient(circle at 80% 20%, #F38E22 0, transparent 40%)",
        }}
        aria-hidden="true"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            La communauté du transport <span className="text-brand-400">en chiffres</span>
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Des centaines de professionnels du transport font déjà confiance à Togo Truck Connect.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatItem({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const { count, ref } = useCountUp(value, 2000);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-400 mb-2">
        {count}
        {suffix}
      </div>
      <div className="text-sm sm:text-base text-slate-400">{label}</div>
    </div>
  );
}
