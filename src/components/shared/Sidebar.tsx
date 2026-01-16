"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    BarChart,
    Settings,
    Home,
    FileText,
    Users,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ScrollText,
    Shield,
    PenTool,
    Type,
    ShoppingBag,
    MessageSquare,
    Search,
    Globe,
    Newspaper
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    collapsed?: boolean;
    toggle?: () => void;
}

export function Sidebar({ collapsed = false, toggle }: SidebarProps) {
    const pathname = usePathname();

    // Translated reference menu structure separated by headers
    const menuGroups = [
        {
            header: "Dashboard",
            items: [
                { label: "Dashboard", icon: Home, href: "/dashboard" },
                { label: "Settings", icon: Settings, href: "/settings" },
                { label: "Keywords", icon: FileText, href: "/keywords" },
                { label: "Logs", icon: ScrollText, href: "/logs" },
                { label: "License", icon: Shield, href: "/license" },
            ]
        },
        {
            header: "Generators",
            items: [
                { label: "Keyword Gen", icon: PenTool, href: "/generators/keyword" },
                { label: "Title Gen", icon: Type, href: "/generators/title" },
                { label: "Product Desc", icon: ShoppingBag, href: "/generators/product" },
                { label: "Comment Gen", icon: MessageSquare, href: "/generators/comment" },
                { label: "Blog Gen", icon: Newspaper, href: "/generators/blog" },
            ]
        }
    ];

    return (
        <div className={cn(
            "flex flex-col h-full bg-[#E55F37] text-white shadow-xl transition-all duration-300 w-full"
        )}>
            {/* Header */}
            <div className={cn("flex items-center h-16 px-4 border-b border-white/10", collapsed ? "justify-center" : "justify-between")}>
                <Link href="/dashboard" className={cn("flex items-center", collapsed && "justify-center")}>
                    <div className="bg-[#9a3412] p-1.5 rounded-lg">
                        <BarChart className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="ml-2 text-lg font-bold tracking-tight text-white">SEO<span className="text-white/90">Engine</span></span>
                    )}
                </Link>
                {!collapsed && toggle && (
                    <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 md:flex hidden">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {collapsed && toggle && (
                <div className="flex justify-center my-2 md:flex hidden">
                    <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <div className="flex-1 py-4 overflow-y-auto">
                {menuGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-6 px-3">
                        {!collapsed && (
                            <h3 className="mb-2 px-3 text-xs font-semibold text-white/60 uppercase tracking-wider">
                                {group.header}
                            </h3>
                        )}
                        <div className="space-y-0.5">
                            {group.items.map((route) => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "flex items-center px-3 py-2 text-[13px] font-medium rounded-md transition-all duration-200 group",
                                        pathname === route.href
                                            ? "bg-white/20 text-white shadow-sm"
                                            : "text-white/70 hover:bg-white/5 hover:text-white",
                                        collapsed && "justify-center px-2"
                                    )}
                                    title={collapsed ? route.label : undefined}
                                >
                                    <route.icon className={cn("h-4 w-4 flex-shrink-0", !collapsed && "mr-3", (pathname === route.href || "group-hover:text-white"))} />
                                    {!collapsed && <span className="truncate">{route.label}</span>}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

        </div >
    );
}
