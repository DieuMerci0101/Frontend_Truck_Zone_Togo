import Link from "next/link";

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
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/logo1.jpeg" alt="Togo Truck Connect" className="h-7 w-auto object-contain" />
              </div>
              <span className="text-lg font-bold text-white">
                Togo Truck Connect
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Mise en relation directe entre propriétaires de camions, chauffeurs et mécaniciens.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>Lomé, Togo</li>
              <li>
                <a href="tel:+22890123456" className="hover:text-white transition-colors">
                  +228 90 12 34 56
                </a>
              </li>
              <li>
                <a href="mailto:contact@togotruckconnect.com" className="hover:text-white transition-colors break-all">
                  contact@togotruckconnect.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Togo Truck Connect
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-sm hover:text-white transition-colors">
              Conditions
            </Link>
            <Link href="/privacy" className="text-sm hover:text-white transition-colors">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
