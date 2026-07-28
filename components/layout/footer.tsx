"use client";

import Link from "next/link";
import { Truck, Facebook, Twitter, Linkedin, Instagram, Phone, Mail, MapPin } from "lucide-react";

const serviceLinks = [
  { label: "Chauffeurs", href: "/chauffeurs" },
  { label: "Mécaniciens", href: "/mecaniciens" },
  { label: "Offres d'emploi", href: "/offres" },
  { label: "Camions", href: "/offres" },
];

const companyLinks = [
  { label: "À propos", href: "/about" },
  { label: "Conditions", href: "/terms" },
  { label: "Confidentialité", href: "/privacy" },
  { label: "FAQ", href: "#faq", isHash: true },
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Instagram, href: "#", label: "Instagram" },
];

export default function Footer() {
  const handleHashClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Logo & Description */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Togo Truck Connect
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-6 text-sm">
              La plateforme de référence pour le transport routier au Togo.
              Connectez chauffeurs, propriétaires de camions et mécaniciens.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-300"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">Services</h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">Entreprise</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) =>
                link.isHash ? (
                  <li key={link.label}>
                    <button
                      onClick={() => handleHashClick(link.href)}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </button>
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">Contact</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">Lomé, Togo</span>
              </li>
              <li className="flex gap-3">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <a
                  href="tel:+22890123456"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  +228 90 12 34 56
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <a
                  href="mailto:contact@togotruckconnect.com"
                  className="text-gray-400 hover:text-white transition-colors text-sm break-all"
                >
                  contact@togotruckconnect.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 text-center sm:text-left">
            &copy; {new Date().getFullYear()} Togo Truck Connect. Tous droits
            réservés.
          </p>
          <div className="flex gap-6">
            <Link
              href="/terms"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Conditions
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
