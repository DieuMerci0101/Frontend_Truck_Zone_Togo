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
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: {
    default: "Togo Truck Connect",
    template: "%s | Togo Truck Connect",
  },
  description:
    "Mise en relation directe entre propriétaires de camions, chauffeurs et mécaniciens.",
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
  icons: {
    icon: "/logo1.jpeg",
    shortcut: "/logo1.jpeg",
    apple: "/logo1.jpeg",
  },
  openGraph: {
    title: "Togo Truck Connect",
    description: "Mise en relation directe entre propriétaires de camions, chauffeurs et mécaniciens.",
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
