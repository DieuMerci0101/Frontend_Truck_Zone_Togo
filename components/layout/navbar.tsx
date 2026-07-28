"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
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
  const { isAuthenticated, logout } = useAuth();
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
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow duration-300">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <span
                className={`text-xl font-bold transition-colors duration-300 ${
                  isScrolled ? "text-gradient" : "text-white"
                }`}
              >
                Togo Truck Connect
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  !link.isHash && pathname === link.href;
                return link.isHash ? (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.href, link.isHash)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isScrolled
                        ? "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? isScrolled
                          ? "text-blue-700 bg-blue-50"
                          : "text-white bg-white/15"
                        : isScrolled
                        ? "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Right Side */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isScrolled
                        ? "text-blue-700 hover:bg-blue-50"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => logout()}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isScrolled
                        ? "text-red-600 hover:bg-red-50"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`px-5 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-200 ${
                      isScrolled
                        ? "border-blue-700 text-blue-700 hover:bg-blue-50"
                        : "border-white/40 text-white hover:bg-white/10"
                    }`}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-700 text-white hover:bg-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg transition-colors ${
                isScrolled
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-secondary-500 rounded-lg flex items-center justify-center">
                    <Truck className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gradient font-bold">
                    Togo Truck Connect
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
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
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg font-medium transition-colors"
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
                      className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                        pathname === link.href
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                      className="flex items-center justify-center gap-2 w-full py-2.5 text-red-600 border border-red-200 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full py-2.5 text-center border-2 border-blue-700 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full py-2.5 text-center bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                    >
                      Inscription
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
