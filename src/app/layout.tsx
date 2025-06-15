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
  title: "AIBridge Advisory - AI-Powered Tax and Legal Consulting System",
  description: "Professional tax and legal consulting platform with artificial intelligence. Get expert answers, professional review, and 24/7 Premium support.",
  keywords: "tax consulting, legal consulting, tax advisory, AI tax, tax consultant, professional review, AI bridge advisory",
  authors: [{ name: "AIBridge Advisory" }],
  robots: "index, follow",
  openGraph: {
    title: "AIBridge Advisory - AI-Powered Tax and Legal Consulting",
    description: "Professional tax and legal consulting platform with artificial intelligence",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIBridge Advisory - AI-Powered Tax and Legal Consulting",
    description: "Professional tax and legal consulting platform with artificial intelligence",
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
    <html lang="en">
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
