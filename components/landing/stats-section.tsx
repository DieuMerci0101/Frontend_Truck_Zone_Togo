"use client";

import { useEffect, useState, useRef } from "react";
import { motion, type Variants } from "framer-motion";
import { Users, Truck, Route, ThumbsUp } from "lucide-react";

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
  { icon: Users, value: 500, suffix: "+", label: "Chauffeurs qualifiés" },
  { icon: Truck, value: 200, suffix: "+", label: "Camions enregistrés" },
  { icon: Route, value: 1000, suffix: "+", label: "Missions réalisées" },
  { icon: ThumbsUp, value: 98, suffix: "%", label: "Satisfaction" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function StatsSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-blue-900 relative overflow-hidden">
      <div className="absolute inset-0 truck-pattern" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
        >
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function StatItem({
  icon: Icon,
  value,
  suffix,
  label,
}: {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
}) {
  const { count, ref } = useCountUp(value, 2000);

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      className="text-center"
    >
      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-white/10 rounded-full flex items-center justify-center">
        <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-secondary-400" />
      </div>
      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
        {count}
        {suffix}
      </div>
      <div className="text-xs sm:text-sm md:text-base text-blue-200 font-medium">{label}</div>
    </motion.div>
  );
}
