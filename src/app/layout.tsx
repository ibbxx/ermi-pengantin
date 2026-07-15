import type { Metadata } from "next";
import { Playfair_Display, Geist } from "next/font/google";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { ToastProvider } from "@/components/ui/toast-simple";
import "./globals.css";
import { cn } from "@/lib/utils";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Ermi Pengantin - Sewa Baju Pengantin, Makeup & Dekorasi Modern",
  description: "Layanan pernikahan premium di Indonesia. Sewa gaun pengantin modern, kebaya, baju adat, makeup artist (MUA) profesional, dan dekorasi pernikahan impian dalam satu tempat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={cn("h-full", "antialiased", playfair.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
        <ToastProvider>
          <Navbar />
          <main className="flex-grow pt-16">{children}</main>
          <Footer />
          <WhatsAppFloatingButton />
        </ToastProvider>
      </body>
    </html>
  );
}
