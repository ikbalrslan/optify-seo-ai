"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateOrganizationDialog } from "@/components/organization/CreateOrganizationDialog";

// Shown when getActiveOrganization() returns null - not just a fresh-signup edge case (that's
// auto-healed by ensurePersonalOrganization), but a real reachable state whenever an org owner
// removes someone who had no other membership. Offers a way forward instead of a dead end.
export function NoOrganizationState() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-slate-200 rounded-lg text-center px-4">
            <Building2 className="h-10 w-10 text-slate-300 mb-3" />
            <h3 className="text-lg font-semibold text-slate-900">You're not part of an organization</h3>
            <p className="text-slate-500 max-w-sm mt-1 mb-4">
                This can happen if you were removed from your last one, or a pending invite is still waiting on you.
                You can create your own to keep using the app on your own.
            </p>
            <Button onClick={() => setIsOpen(true)}>Create Organization</Button>
            <CreateOrganizationDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                description="This becomes your own workspace - its own team, sites, and billing. You'll be its owner."
            />
        </div>
    );
}
