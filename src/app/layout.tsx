import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import NextTopLoader from 'nextjs-toploader';
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextTopLoader color="hsl(var(--primary))" showSpinner={false} />
          {children}
          <Toaster 
            position="bottom-center" 
            richColors 
            toastOptions={{
              classNames: {
                toast: 'data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-12 data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-12 data-[state=closed]:fade-out-0',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
