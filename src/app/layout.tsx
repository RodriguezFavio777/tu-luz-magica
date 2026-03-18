import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import React from "react";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import ScrollToTop from "@/components/layout/ScrollToTop";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: 'swap',
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tuluzmagica.com'),
  title: {
    template: '%s | Tu Luz Mágica',
    default: 'Tu Luz Mágica | Lecturas de Tarot y Sanación Energética',
  },
  description: "Lecturas de tarot, rituales energéticos y herramientas místicas diseñadas para acompañarte en tu evolución espiritual.",
  keywords: ['tarot', 'sanación', 'espiritualidad', 'argentina', 'lecturas de tarot online', 'rituales magicos'],
  authors: [{ name: 'Camí' }],
  creator: 'Camí',
  publisher: 'Tu Luz Mágica',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Tu Luz Mágica | Ilumina tu Esencia Sagrada',
    description: 'Lecturas de tarot, rituales energéticos y herramientas místicas para tu evolución espiritual.',
    url: 'https://tuluzmagica.com',
    siteName: 'Tu Luz Mágica',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tu Luz Mágica | Ilumina tu Esencia Sagrada',
    description: 'Lecturas de tarot, rituales energéticos y herramientas místicas para tu evolución espiritual.',
  },
};

import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { NavigationLoader } from "@/components/ui/NavigationLoader";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://xnjkhtvaybxckbqliemn.supabase.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://s3c.nyc3.cdn.digitaloceanspaces.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${fraunces.variable} ${manrope.variable} font-body antialiased selection:bg-pink-400 selection:text-white`}
      >
        <AuthProvider>
          <ToastProvider>
            <GlobalLoader />
            <Suspense fallback={null}>
              <NavigationLoader />
            </Suspense>
            <ScrollToTop />
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

