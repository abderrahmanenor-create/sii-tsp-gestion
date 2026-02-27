import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "SII TSP Gestion - Gestion de Chantier Industriel",
  description: "Application de gestion de chantier industriel SII - JESA OCP. Gestion des tâches, stock, pointage et équipes.",
  keywords: ["SII", "JESA", "OCP", "gestion chantier", "industriel", "mécanique", "électricité"],
  authors: [{ name: "SII - Société d'Ingénierie et d'Innovation" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/logo_SII.png",
    apple: "/logo_SII.png",
  },
  openGraph: {
    title: "SII TSP Gestion",
    description: "Gestion de chantier industriel SII - JESA OCP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#002E5D" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SII TSP" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
