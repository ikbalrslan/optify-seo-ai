
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Settings, 
  Home, 
  Search,
  Globe 
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      color: "text-sky-500",
    },
    {
      label: "SEO Analyzer",
      icon: Search,
      href: "/analyzer",
      color: "text-violet-500",
    },
    {
        label: "Projects",
        icon: Globe,
        href: "/projects",
        color: "text-pink-700",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-sidebar/50 backdrop-blur-xl border-r border-sidebar-border/50 text-sidebar-foreground w-64 fixed left-0 top-0 bottom-0 z-50">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
             <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
             <BarChart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight">
            SEO<span className="text-primary">Engine</span>
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition duration-200",
                pathname === route.href ? "text-primary bg-primary/10" : "text-muted-foreground"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
         {/* Footer or User info can go here */}
         <div className="bg-card/50 p-4 rounded-xl border border-border/50">
             <p className="text-xs text-muted-foreground">Free Plan</p>
             <p className="text-xs text-muted-foreground mt-1">1/5 Analyses used</p>
             <div className="w-full bg-secondary h-1.5 rounded-full mt-2 overflow-hidden">
                 <div className="bg-primary h-full w-[20%]" />
             </div>
         </div>
      </div>
    </div>
  );
}
