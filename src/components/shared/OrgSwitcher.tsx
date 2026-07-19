"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronsUpDown, Check, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getMyOrganizations, switchActiveOrganization } from "@/actions/organizations";

type Org = { id: string; name: string; role: string };

export function OrgSwitcher({ collapsed }: { collapsed?: boolean }) {
    const [orgs, setOrgs] = useState<Org[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isSwitching, setIsSwitching] = useState(false);

    const load = useCallback(async () => {
        const { organizations, activeOrganizationId } = await getMyOrganizations();
        setOrgs(organizations);
        setActiveId(activeOrganizationId);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // Only one organization (the common case) - nothing to switch between.
    if (orgs.length <= 1) {
        return null;
    }

    const activeOrg = orgs.find((o) => o.id === activeId) ?? orgs[0];

    const handleSwitch = async (orgId: string) => {
        if (orgId === activeId) return;
        setIsSwitching(true);
        try {
            const result = await switchActiveOrganization(orgId);
            if (result.success) {
                setActiveId(orgId);
                window.location.reload();
            }
        } finally {
            setIsSwitching(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    disabled={isSwitching}
                    className={cn(
                        "w-full h-auto py-2 px-2 rounded-md hover:bg-[#EAECC6]/50 flex items-center gap-2",
                        collapsed ? "justify-center" : "justify-between"
                    )}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <Building2 className="h-4 w-4 flex-shrink-0 text-slate-500" />
                        {!collapsed && (
                            <span className="text-sm font-medium truncate">{activeOrg?.name}</span>
                        )}
                    </div>
                    {!collapsed && <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Organizations</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {orgs.map((org) => (
                    <DropdownMenuItem key={org.id} onClick={() => handleSwitch(org.id)} className="cursor-pointer">
                        <Check className={cn("mr-2 h-4 w-4", org.id === activeId ? "opacity-100" : "opacity-0")} />
                        <span className="truncate flex-1">{org.name}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
