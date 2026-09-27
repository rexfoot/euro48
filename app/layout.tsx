import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/components/LocaleProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InstallAppBanner } from "@/components/InstallAppBanner";
import { SITE_URL } from "@/lib/constants";
import { pageAlternates } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Euro48 — Offres d'emploi en Europe des dernières 48h",
    template: "%s | Euro48",
  },
  description: "Les offres d'emploi d'Europe des 48 dernières heures, dans 15 pays. Sans doublons.",
  alternates: pageAlternates("/"),
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Euro48",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#070b14",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LocaleProvider>
          <Header />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
          <InstallAppBanner />
        </LocaleProvider>
      </body>
    </html>
  );
}
