import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: 'swap',
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tu Luz Mágica | Ilumina tu Esencia Sagrada",
  description: "Lecturas de tarot, rituales energéticos y herramientas místicas diseñadas para acompañarte en tu evolución espiritual.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${manrope.variable} font-body antialiased selection:bg-pink-400 selection:text-white`}
      >
        <ScrollToTop />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
