"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { useState, useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      color: "text-blue-400",
    },
    {
      label: "Users",
      icon: Users,
      href: "/admin/users",
      color: "text-violet-400",
    },
    {
      label: "Plans",
      icon: CreditCard,
      href: "/admin/plans",
      color: "text-[#E55F37]",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/admin/settings",
      color: "text-gray-400",
    },
  ];

  if (!mounted) {
    return (
      <div className="h-full relative flex">
        <div className="hidden md:flex flex-col w-56 bg-slate-900 border-r border-slate-800 text-white fixed inset-y-0 z-50">
          {/* Static sidebar for SSR/Initial Load */}
        </div>
        <main className="flex-1 md:pl-56 bg-slate-50 min-h-screen">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="h-full relative flex">
      {/* Admin Sidebar - Dark Blue/Slate Theme */}
      <div className={cn(
        "hidden md:flex flex-col bg-slate-900 border-r border-slate-800 text-white fixed inset-y-0 z-50 transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-56"
      )}>
        <div className={cn("flex items-center h-16 px-4 border-b border-slate-800", collapsed ? "justify-center" : "justify-between")}>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="flex items-center gap-2">
              <ShieldCheck className={cn("text-blue-500", collapsed ? "h-8 w-8" : "h-8 w-8")} />
              {!collapsed && (
                <span className="text-xl font-bold tracking-tight">Admin<span className="text-blue-500">Panel</span></span>
              )}
            </Link>
          </div>
          {!collapsed && (
            <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Collapsed Toggle Button (Visible only when collapsed) */}
        {collapsed && (
          <div className="flex justify-center my-2">
            <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {!collapsed && (
            <div className="mb-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Management
            </div>
          )}
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center px-3 py-2 text-[13px] font-medium rounded-lg transition-colors duration-200 group",
                pathname === route.href
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? route.label : undefined}
            >
              <route.icon className={cn("h-5 w-5 transition-colors flex-shrink-0", route.color, !collapsed && "mr-3")} />
              {!collapsed && route.label}
            </Link>
          ))}
        </div>
        <div className="p-4 border-t border-slate-800">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center px-3 py-2 text-[13px] font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Exit Admin" : undefined}
          >
            <LogOut className={cn("h-5 w-5 flex-shrink-0", !collapsed && "mr-3")} />
            {!collapsed && "Exit Admin"}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className={cn(
        "flex-1 bg-slate-50 min-h-screen transition-all duration-300 ease-in-out",
        collapsed ? "md:pl-20" : "md:pl-56"
      )}>
        <div className="h-16 border-b bg-white flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-slate-800 uppercase tracking-wide">
            Admin Administration
          </h2>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">AD</div>
          </div>
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
