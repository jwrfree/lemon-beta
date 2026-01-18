
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeTransition } from "@/components/theme-transition";
import { AppProvider } from "@/components/app-provider";
import { UIProvider } from "@/components/ui-provider";
import { ServiceWorkerProvider } from "@/components/service-worker-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Lemon - Personal Finance Tracker",
  description: "Take control of your finances with Lemon.",
  applicationName: "Lemon",
  manifest: "/manifest.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a8a" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lemon",
  },
  icons: {
    icon: [
      { url: "/api/pwa-icon?size=192", sizes: "192x192", type: "image/png" },
      { url: "/api/pwa-icon?size=512", sizes: "512x512", type: "image/png" },
      { url: "/api/pwa-icon?size=512&maskable=1", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/api/pwa-icon?size=192" }],
    other: [{ rel: "mask-icon", url: "/icons/safari-pinned-tab.svg", color: "#2563eb" }],
  },
  category: "finance",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a8a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ThemeTransition />
          <UIProvider>
            <AppProvider>
              <ServiceWorkerProvider />
              <Toaster />
              {children}
            </AppProvider>
          </UIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
