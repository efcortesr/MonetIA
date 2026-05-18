import { Geist, Geist_Mono } from "next/font/google";
import { Metadata, Viewport } from "next";
import { ConditionalShell } from "@/components/ConditionalShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MonetIA - Financial Intelligence",
  description: "Smart financial management and analysis platform",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  // ── CRÍTICO: estas tres líneas son las que corrigen el zoom ──
  width: "device-width",
  initialScale: 1,
  // NO poner maximumScale ni userScalable: false
  // maximumScale: 1 rompe accesibilidad y causa el problema de zoom
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* Viewport explícito como meta tag de respaldo para máxima compatibilidad */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="true" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MonetIA" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConditionalShell>{children}</ConditionalShell>
      </body>
    </html>
  );
}