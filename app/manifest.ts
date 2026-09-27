import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Euro48 — Offres d'emploi en Europe des dernières 48h",
    short_name: "Euro48",
    description: "Les offres d'emploi d'Europe des 48 dernières heures, dans 15 pays. Sans doublons.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#070b14",
    theme_color: "#070b14",
    lang: "fr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
