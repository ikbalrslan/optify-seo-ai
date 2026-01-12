"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
       <div className="h-full relative">
         <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-50 md:w-56">
           <Sidebar />
         </div>
         <main className="md:pl-56 h-full relative flex flex-col">
           <Navbar />
           <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950">
             {children}
           </div>
         </main>
       </div>
    );
  }

  return (
    <div className="h-full relative">
      <div className={cn(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0 z-50 transition-all duration-300 ease-in-out",
          collapsed ? "md:w-20" : "md:w-56"
      )}>
        <Sidebar collapsed={collapsed} toggle={() => setCollapsed(!collapsed)} />
      </div>
      <main className={cn(
          "h-full relative flex flex-col transition-all duration-300 ease-in-out",
          collapsed ? "md:pl-20" : "md:pl-56"
      )}>
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950">
           {children}
        </div>
      </main>
    </div>
  );
}
