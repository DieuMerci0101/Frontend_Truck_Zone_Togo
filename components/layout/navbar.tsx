"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Menu, X } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useScrollPosition } from "@/hooks/use-scroll";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Fonctionnalités", href: "#features", isHash: true },
  { label: "Services", href: "#services", isHash: true },
  { label: "Comment ça marche", href: "#how-it-works", isHash: true },
  { label: "Offres", href: "/offres" },
  { label: "Mécaniciens", href: "/mecaniciens" },
  { label: "Contact", href: "#contact", isHash: true },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isScrolled } = useScrollPosition();
  const pathname = usePathname();

  const handleNavClick = (href: string, isHash?: boolean) => {
    setMobileOpen(false);
    if (isHash) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white border-b border-slate-200 shadow-sm"
            : "bg-slate-900"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-3 lg:mr-8">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-slate-200">
                <img src="/logo1.jpeg" alt="Togo Truck Connect" className="h-8 w-auto object-contain" />
              </div>
              <div className="leading-tight">
                <div className={`text-sm font-bold leading-none ${
                  isScrolled ? "text-slate-900" : "text-white"
                }`}>
                  Togo Truck
                </div>
                <div className={`text-sm font-bold leading-none ${
                  isScrolled ? "text-slate-500" : "text-slate-400"
                }`}>
                  Connect
                </div>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = !link.isHash && pathname === link.href;
                return link.isHash ? (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.href, link.isHash)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isScrolled
                        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? isScrolled
                          ? "text-slate-900 bg-slate-100"
                          : "text-white bg-slate-800"
                        : isScrolled
                        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isScrolled
                        ? "text-slate-700 hover:bg-slate-100"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    Accéder à mon Dashboard
                  </Link>
                  <Link
                    href="/login"
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      isScrolled
                        ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                        : "border-slate-400 text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      isScrolled
                        ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                        : "border-slate-400 text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    Inscription
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      isScrolled
                        ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                        : "border-slate-400 text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2 rounded-lg text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm"
                    data-tip="Créez votre compte gratuit"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg transition-colors ${
                isScrolled
                  ? "text-slate-700 hover:bg-slate-100"
                  : "text-white hover:bg-slate-800"
              }`}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />
      <div
        className={`fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white ring-1 ring-slate-200 flex items-center justify-center overflow-hidden">
              <img src="/logo1.jpeg" alt="Togo Truck Connect" className="h-6 w-auto object-contain" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-slate-900 leading-none">
                Togo Truck
              </div>
              <div className="text-sm font-bold text-slate-500 leading-none">
                Connect
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-1">
          {navLinks.map((link) => {
            if (link.isHash) {
              return (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href, link.isHash)}
                  className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium transition-colors min-h-[44px]"
                >
                  {link.label}
                </button>
              );
            }
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors min-h-[44px] ${
                  pathname === link.href
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 space-y-3 bg-white">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block w-full py-2.5 text-center bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors min-h-[44px]"
              >
                Accéder à mon Dashboard
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full py-2.5 text-center border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors min-h-[44px]"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="block w-full py-2.5 text-center border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors min-h-[44px]"
              >
                Inscription
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full py-2.5 text-center border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors min-h-[44px]"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="block w-full py-2.5 text-center bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors min-h-[44px]"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
