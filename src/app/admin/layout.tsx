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
  LogOut
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
      color: "text-emerald-400",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/admin/settings",
      color: "text-gray-400",
    },
  ];

  return (
    <div className="h-full relative flex">
      {/* Admin Sidebar - Dark Blue/Slate Theme */}
      <div className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-white fixed inset-y-0 z-50">
        <div className="px-6 py-6 border-b border-slate-800 flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold tracking-tight">Admin<span className="text-blue-500">Panel</span></span>
        </div>
        <div className="flex-1 py-6 px-4 space-y-1">
            <div className="mb-4 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Management
            </div>
            {routes.map((route) => (
                <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 group",
                        pathname === route.href 
                            ? "bg-slate-800 text-white" 
                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    )}
                >
                    <route.icon className={cn("h-5 w-5 mr-3 transition-colors", route.color)} />
                    {route.label}
                </Link>
            ))}
        </div>
        <div className="p-4 border-t border-slate-800">
             <Link
                href="/dashboard"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
                <LogOut className="h-5 w-5 mr-3" />
                Exit Admin
            </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 bg-slate-50 dark:bg-slate-950 min-h-screen">
         <div className="h-16 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-8">
             <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
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
