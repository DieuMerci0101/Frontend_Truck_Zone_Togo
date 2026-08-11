"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/landing/hero-section";
import FeaturesSection from "@/components/landing/features-section";
import ServicesSection from "@/components/landing/services-section";
import HowItWorksSection from "@/components/landing/how-it-works";
import StatsSection from "@/components/landing/stats-section";
import ContactSection from "@/components/landing/contact-section";
import ThemeToggle from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      {/* Bascule de thème PC : flottante à droite, centrée verticalement */}
      <div className="fixed right-4 lg:right-5 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-1.5">
        <ThemeToggle className="bg-white/85 border border-slate-300 text-slate-700 backdrop-blur-sm hover:bg-white shadow-lg dark:bg-slate-800/85 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700" />
        <span className="text-[10px] font-medium text-slate-600 bg-white/85 rounded-full px-2 py-0.5 backdrop-blur-sm dark:text-slate-300 dark:bg-slate-800/85" aria-hidden="true">
          Thème
        </span>
      </div>
      <main>
        <HeroSection />
        <FeaturesSection />
        <ServicesSection />
        <HowItWorksSection />
        <StatsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
