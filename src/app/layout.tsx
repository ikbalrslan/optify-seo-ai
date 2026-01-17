import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const fontHeading = Inter({
  variable: "--font-heading",
  subsets: ["latin"],
});

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SEO Engine - Premium SEO Analysis",
  description: "Advanced SEO analysis tool for modern websites",
};

import { Providers } from "./providers";

// ... existing imports ...

import { auth } from "@/auth";

// ... existing imports ...

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className="h-full">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
