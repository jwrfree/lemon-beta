
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import NextTopLoader from 'nextjs-toploader';
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/components/app-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Lemon - Personal Finance Tracker",
  description: "Take control of your finances with Lemon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AppProvider>
            <NextTopLoader color="hsl(var(--primary))" showSpinner={false} />
            {children}
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
