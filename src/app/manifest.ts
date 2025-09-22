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
    background_color: "#f8fafc",
    theme_color: "#2563eb",
    lang: "en",
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
        name: "Open dashboard",
        short_name: "Dashboard",
        url: "/",
      },
      {
        name: "View transactions",
        short_name: "Transactions",
        url: "/transactions",
      },
      {
        name: "Manage wallets",
        short_name: "Wallets",
        url: "/wallets",
      },
    ],
    prefer_related_applications: false,
  };
}
