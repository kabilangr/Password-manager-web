import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { AutoLockProvider } from "@/components/auto-lock-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CipherVault - Zero-Knowledge Password Manager",
  description: "Secure, Enterprise-Grade Password Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen overflow-x-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Decorative background gradients (Blobs) */}
          <div className="pointer-events-none fixed -top-40 -right-40 z-0 h-96 w-96 rounded-full bg-primary/10 blur-[80px]" />
          <div className="pointer-events-none fixed -bottom-40 -left-40 z-0 h-96 w-96 rounded-full bg-secondary/10 blur-[80px]" />

          <div className="relative z-10">
            <AutoLockProvider>
              {children}
              <Toaster />
            </AutoLockProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
