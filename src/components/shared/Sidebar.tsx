"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getAppUrl } from "@/lib/utils";
import {
    BarChart,
    Settings,
    Home,
    FileText,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    MessageSquare,
    Newspaper,
    BookOpen,
    User,
    CalendarDays,
    Zap,
    Sparkles,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { OrgSwitcher } from "@/components/shared/OrgSwitcher";

interface SidebarProps {
    collapsed?: boolean;
    toggle?: () => void;
    onLinkClick?: () => void;
    subscription?: { isPro: boolean; planName: string } | null;
    quota?: { used: number; limit: number; remaining: number };
}

export function Sidebar({
    collapsed = false,
    toggle,
    onLinkClick,
    subscription = null,
    quota = { used: 0, limit: 0, remaining: 0 }
}: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();

    // State for sections
    const [isGeneratorsOpen, setIsGeneratorsOpen] = useState(true);

    // Translated reference menu structure separated by headers
    const menuGroups = [
        {
            header: null,
            items: [
                { label: "Dashboard", icon: Home, href: "/dashboard" },
                { label: "Autopilot", icon: CalendarDays, href: "/autopilot" },
                { label: "Keywords", icon: FileText, href: "/keywords" },
                { label: "Team", icon: Users, href: "/organization" },
                { label: "Settings", icon: Settings, href: "/settings" },
            ]
        },
        {
            header: "Generators",
            items: [
                { label: "Blog Gen", icon: Newspaper, href: "/generators/blog" },
                { label: "Keyword Gen", icon: Sparkles, href: "/generators/keyword" },
            ]
        }
    ];

    const toggleGenerators = () => {
        setIsGeneratorsOpen(!isGeneratorsOpen);
    };

    return (
        <div className={cn(
            "flex flex-col h-full bg-[#FDFBF7] dark:bg-sidebar text-slate-900 dark:text-sidebar-foreground shadow-xl transition-all duration-300 w-full border-r border-[#EAECC6] dark:border-sidebar-border"
        )}>
            {/* Header */}
            <div className={cn("flex items-center h-16 px-4 border-b border-[#EAECC6] dark:border-sidebar-border", collapsed ? "justify-center" : "justify-between")}>
                <Link href="/dashboard" onClick={onLinkClick} className={cn("flex items-center", collapsed && "justify-center")}>
                    <div className="bg-[#1DB954] p-1.5 rounded-lg">
                        <BarChart className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="ml-2 text-lg font-bold tracking-tight text-slate-900 dark:text-sidebar-foreground">Optify</span>
                    )}
                </Link>
                {!collapsed && toggle && (
                    <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8 text-slate-500 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-sidebar-foreground hover:bg-[#EAECC6]/50 dark:hover:bg-sidebar-accent/50 md:flex hidden">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {collapsed && toggle && (
                <div className="flex justify-center my-2 md:flex hidden">
                    <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8 text-slate-500 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-sidebar-foreground hover:bg-[#EAECC6]/50 dark:hover:bg-sidebar-accent/50">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <div className="px-3 pt-3">
                <OrgSwitcher collapsed={collapsed} />
            </div>

            <div className="flex-1 py-4 overflow-y-auto">
                {menuGroups.map((group, groupIndex) => {
                    const isGenerators = group.header === "Generators";
                    const isOpen = isGenerators ? isGeneratorsOpen : true; // Dashboard always open for now

                    return (
                        <div key={groupIndex} className="mb-6 px-3">
                            {!collapsed && (
                                <div
                                    className={cn(
                                        "mb-2 px-3 py-1.5 flex items-center justify-between group transition-colors rounded-md",
                                        isGenerators ? "cursor-pointer hover:bg-[#EAECC6]/50 dark:hover:bg-sidebar-accent/50" : "cursor-default"
                                    )}
                                    onClick={isGenerators ? toggleGenerators : undefined}
                                >
                                    <h3 className="text-xs font-semibold text-slate-500 dark:text-muted-foreground uppercase tracking-wider select-none">
                                        {group.header}
                                    </h3>
                                    {isGenerators && (
                                        <div className="text-slate-400 dark:text-muted-foreground/70 group-hover:text-slate-600 dark:group-hover:text-muted-foreground transition-colors">
                                            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* If collapsed, show all items (icons). If not collapsed, respect open state */}
                            {(collapsed || isOpen) && (
                                <div className={cn("space-y-0.5", !collapsed && isGenerators && !isOpen && "hidden")}>
                                    {group.items.map((route) => (
                                        <Link
                                            key={route.href}
                                            href={route.href}
                                            onClick={onLinkClick}
                                            className={cn(
                                                "flex items-center px-3 py-2 text-[13px] font-medium rounded-md transition-all duration-200 group",
                                                pathname === route.href
                                                    ? "bg-[#1DB954] text-white shadow-sm"
                                                    : "text-slate-600 dark:text-muted-foreground hover:bg-[#EAECC6]/50 dark:hover:bg-sidebar-accent/50 hover:text-slate-900 dark:hover:text-sidebar-foreground",
                                                collapsed && "justify-center px-2"
                                            )}
                                            title={collapsed ? route.label : undefined}
                                        >
                                            <route.icon className={cn("h-4 w-4 flex-shrink-0", !collapsed && "mr-3", (pathname === route.href ? "text-white" : "text-slate-500 dark:text-muted-foreground group-hover:text-slate-900 dark:group-hover:text-sidebar-foreground"))} />
                                            {!collapsed && <span className="truncate">{route.label}</span>}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer Section: Quota, Documentation, Feedback, Profile */}
            <div className="p-4 border-t border-[#EAECC6] space-y-3">
                {/* Monthly Quota */}
                {!collapsed && (
                    <div className="p-3 bg-slate-100 rounded-lg mb-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="text-xs font-semibold text-slate-700">Monthly Quota</span>
                        </div>
                        {quota.limit === -1 ? (
                            <p className="text-sm font-bold text-[#1DB954]">Unlimited</p>
                        ) : quota.limit === 0 ? (
                            <p className="text-xs text-slate-500">Not available on your plan</p>
                        ) : (
                            <TooltipProvider delayDuration={100}>
                                <div className="flex justify-between text-xs mb-1">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="text-slate-500 cursor-help">{quota.used} / {quota.limit}</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Generated articles this month</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="text-slate-500 cursor-help">{quota.remaining} left</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Remaining quota this month</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-1.5">
                                    <div
                                        className="bg-[#1DB954] h-1.5 rounded-full transition-all"
                                        style={{ width: `${Math.min(100, (quota.remaining / quota.limit) * 100)}%` }}
                                    />
                                </div>
                            </TooltipProvider>
                        )}
                    </div>
                )}
                {collapsed && (
                    <div className="flex justify-center mb-2" title="Monthly Quota">
                        <Zap className="h-4 w-4 text-yellow-500" />
                    </div>
                )}
                <Link
                    href={`${getAppUrl()}/docs`}
                    target="_blank"
                    onClick={onLinkClick}
                    className={cn(
                        "flex items-center px-3 py-2 text-[13px] font-medium rounded-md transition-all duration-200 text-slate-600 dark:text-muted-foreground hover:bg-[#EAECC6]/50 dark:hover:bg-sidebar-accent/50 hover:text-slate-900 dark:hover:text-sidebar-foreground active:scale-95 group",
                        collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? "Documentation" : undefined}
                >
                    <BookOpen className={cn("h-4 w-4 flex-shrink-0 text-slate-500 dark:text-muted-foreground group-hover:text-slate-900 dark:group-hover:text-sidebar-foreground", !collapsed && "mr-3")} />
                    {!collapsed && <span className="truncate">Documentation</span>}
                </Link>
                <Link
                    href="/feedback"
                    onClick={onLinkClick}
                    className={cn(
                        "flex items-center px-3 py-2 text-[13px] font-medium rounded-md transition-all duration-200 group active:scale-95",
                        pathname === "/feedback"
                            ? "bg-[#1DB954] text-white shadow-sm"
                            : "text-slate-600 dark:text-muted-foreground hover:bg-[#EAECC6]/50 dark:hover:bg-sidebar-accent/50 hover:text-slate-900 dark:hover:text-sidebar-foreground",
                        collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? "Feedback" : undefined}
                >
                    <MessageSquare className={cn("h-4 w-4 flex-shrink-0", !collapsed && "mr-3", pathname === "/feedback" ? "text-white" : "text-slate-500 dark:text-muted-foreground group-hover:text-slate-900 dark:group-hover:text-sidebar-foreground")} />
                    {!collapsed && <span className="truncate">Feedback</span>}
                </Link>

                <div className="pt-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "relative w-full h-auto p-2 rounded-xl hover:bg-[#EAECC6]/50 dark:hover:bg-sidebar-accent/50 transition-colors flex items-center gap-3",
                                    collapsed ? "justify-center" : "justify-start"
                                )}
                            >
                                <div className="relative">
                                    {session?.user?.image ? (
                                        <img
                                            src={session.user.image}
                                            alt="Profile"
                                            className="h-9 w-9 rounded-full object-cover border border-[#EAECC6]"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-9 w-9 bg-slate-100 rounded-full border border-slate-200">
                                            <User className="h-5 w-5 text-slate-400" />
                                        </div>
                                    )}
                                    {/* Pro Badge */}
                                    {subscription?.isPro ? (
                                        <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-[#1DB954] to-[#1ed760] text-white text-[7px] font-bold px-1 py-0.5 rounded-full shadow-sm uppercase">
                                            Pro
                                        </div>
                                    ) : (
                                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>

                                {!collapsed && (
                                    <div className="flex flex-col items-start min-w-0">
                                        <span className="text-sm font-semibold text-slate-900 dark:text-sidebar-foreground truncate w-full text-left">
                                            {session?.user?.name || "User"}
                                        </span>
                                        <span className="text-[11px] text-slate-500 dark:text-muted-foreground truncate w-full text-left">
                                            {session?.user?.email}
                                        </span>
                                    </div>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 mb-2" align="start" side="right" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{session?.user?.name || "User"}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {session?.user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem asChild>
                                <Link href="/settings" onClick={onLinkClick}>Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive cursor-pointer"
                                onClick={() => signOut({ callbackUrl: window.location.origin })}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

            </div>
        </div>
    );
}
