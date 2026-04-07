import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ProgressBar } from "@/components/progress-bar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inmio",
  description: "Mini SaaS inmobiliario para cobros y comprobantes",
  icons: { icon: "/logoinmio.png", apple: "/logoinmio.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <Suspense fallback={null}>
            <ProgressBar />
          </Suspense>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}