import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MZ Asesoría - Sistema de Consultas Fiscales y Laborales con IA",
  description: "Plataforma profesional de consultas fiscales y laborales con inteligencia artificial. Obtén respuestas expertas, revisión de profesionales y soporte Premium 24/7.",
  keywords: "consultas fiscales, consultas laborales, asesoría fiscal, IA fiscal, consultor fiscal, revisión profesional",
  authors: [{ name: "MZ Asesoría" }],
  robots: "index, follow",
  openGraph: {
    title: "MZ Asesoría - Consultas Fiscales y Laborales con IA",
    description: "Plataforma profesional de consultas fiscales y laborales con inteligencia artificial",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "MZ Asesoría - Consultas Fiscales y Laborales con IA",
    description: "Plataforma profesional de consultas fiscales y laborales con inteligencia artificial",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8b5cf6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900`}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
