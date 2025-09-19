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
                toast: 'w-full max-w-sm p-4 rounded-full data-[state=open]:animate-toast-enter data-[state=closed]:animate-toast-exit',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
