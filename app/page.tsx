"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/landing/hero-section";
import FeaturesSection from "@/components/landing/features-section";
import ServicesSection from "@/components/landing/services-section";
import HowItWorksSection from "@/components/landing/how-it-works";
import StatsSection from "@/components/landing/stats-section";
import ContactSection from "@/components/landing/contact-section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
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
