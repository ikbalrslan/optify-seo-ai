import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <div className="h-full relative">
          <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
            <Sidebar />
          </div>
          <main className="md:pl-64 h-full relative flex flex-col">
            <Navbar />
            <div className="flex-1 p-8 overflow-y-auto">
               {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
