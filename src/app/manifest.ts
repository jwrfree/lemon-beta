import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lemon - Personal Finance Tracker",
    short_name: "Lemon",
    description: "Take control of your finances with Lemon.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0d9488",
    lang: "id",
    categories: ["finance", "productivity"],
    dir: "ltr",
    icons: [
      {
        src: "/api/pwa-icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/api/pwa-icon?size=512",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/api/pwa-icon?size=512&maskable=1",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Buka Beranda",
        short_name: "Beranda",
        url: "/home",
      },
      {
        name: "Lihat Transaksi",
        short_name: "Transaksi",
        url: "/transactions",
      },
      {
        name: "Catat Cepat",
        short_name: "Catat",
        url: "/add-smart",
      },
    ],
    prefer_related_applications: false,
  };
}
