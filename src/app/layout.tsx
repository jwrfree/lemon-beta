import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./mobile-home-enhancements.css";
import "./fab-enhancements.css";
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeTransition } from "@/components/theme-transition";
import { AppProvider } from "@/providers/app-provider";
import { UIProvider } from "@/components/ui-provider";
import { ServiceWorkerProvider } from "@/components/service-worker-provider";
import { InstallPrompt } from "@/components/install-prompt";
import { BalanceVisibilityProvider } from "@/providers/balance-visibility-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Lemon - Personal Finance Tracker",
  description: "Take control of your finances with Lemon.",
  applicationName: "Lemon",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lemon",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/api/pwa-icon?size=192", sizes: "192x192", type: "image/png" },
      { url: "/api/pwa-icon?size=512", sizes: "512x512", type: "image/png" },
      { url: "/api/pwa-icon?size=512&maskable=1", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/api/pwa-icon?size=192" }],
    other: [{ rel: "mask-icon", url: "/icons/safari-pinned-tab.svg", color: "#FBBF24" }],
  },
  category: "finance",
};

export const viewport: Viewport = {
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
    <html lang="en" className={`${inter.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans bg-background text-foreground h-full overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ThemeTransition />
          <TooltipProvider delayDuration={300}>
            <UIProvider>
              <AppProvider>
                <BalanceVisibilityProvider>
                  <ServiceWorkerProvider />
                  <InstallPrompt />
                  <Toaster />
                  {children}
                </BalanceVisibilityProvider>
              </AppProvider>
            </UIProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}