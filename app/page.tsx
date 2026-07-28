"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/landing/hero-section";
import FeaturesSection from "@/components/landing/features-section";
import ServicesSection from "@/components/landing/services-section";
import HowItWorksSection from "@/components/landing/how-it-works";
import StatsSection from "@/components/landing/stats-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import PartnersSection from "@/components/landing/partners-section";
import FaqSection from "@/components/landing/faq-section";
import CtaSection from "@/components/landing/cta-section";
import ContactSection from "@/components/landing/contact-section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ServicesSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <PartnersSection />
        <FaqSection />
        <CtaSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
