"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { update } = useSession();

  useEffect(() => {
    setMounted(true);
    update(); // Force session update on mount to handle soft navigations from unauthenticated state
  }, []);

  if (!mounted) {
    return (
      <div className="h-full relative">
        <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-50 md:w-56">
          <Sidebar />
        </div>
        <main className="md:pl-56 h-full relative flex flex-col">
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 z-50 transition-all duration-300 ease-in-out",
        collapsed ? "md:w-20" : "md:w-56"
      )}>
        <Sidebar collapsed={collapsed} toggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 bg-white shadow-md border-slate-200">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar onLinkClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <main className={cn(
        "h-full relative flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "md:pl-20" : "md:pl-56"
      )}>
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          {children}
        </div>
      </main>
    </div>
  );
}

