import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";

const serviceLinks = [
  { label: "Chauffeurs", href: "/chauffeurs" },
  { label: "Mécaniciens", href: "/mecaniciens" },
  { label: "Offres d'emploi", href: "/offres" },
  { label: "Camions", href: "/offres" },
];

const quickLinks = [
  { label: "Accueil", href: "/" },
  { label: "Services", href: "#services" },
  { label: "Comment ça marche", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

const socials = [
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
  { label: "Twitter / X", href: "https://twitter.com", icon: Twitter },
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden ring-1 ring-slate-700">
                <img src="/logo1.jpeg" alt="Togo Truck Connect" className="h-8 w-auto object-contain" />
              </div>
              <span className="text-lg font-bold text-white">
                Togo Truck <span className="text-brand-400">Connect</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Mise en relation directe entre propriétaires de camions, chauffeurs et mécaniciens,
              pour un transport routier plus sûr et plus efficace au Togo.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-400 hover:bg-brand-500/10 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-brand-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-brand-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
                Lomé, Togo
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
                <a href="tel:+22870118993" className="hover:text-brand-400 transition-colors">
                  +228 70 11 89 93
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
                <a
                  href="mailto:patgodson01@gmail.com"
                  className="hover:text-brand-400 transition-colors break-all"
                >
                  patgodson01@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Togo Truck Connect. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-sm hover:text-brand-400 transition-colors">
              Mentions légales
            </Link>
            <Link href="/privacy" className="text-sm hover:text-brand-400 transition-colors">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
