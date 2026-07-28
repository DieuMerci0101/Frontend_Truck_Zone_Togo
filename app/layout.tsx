import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#1e40af",
};

export const metadata: Metadata = {
  title: {
    default: "Togo Truck Connect",
    template: "%s | Togo Truck Connect",
  },
  description:
    "Plateforme de connexion entre chauffeurs, propriétaires de camions et mécaniciens au Togo",
  keywords: [
    "transport",
    "camion",
    "Togo",
    "chauffeur",
    "mécanicien",
    "logistique",
    "Lomé",
    "transport routier",
    "fret",
    "cargo",
  ],
  authors: [{ name: "Togo Truck Connect" }],
  openGraph: {
    title: "Togo Truck Connect",
    description: "La plateforme de transport routier au Togo",
    type: "website",
    locale: "fr_TG",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
