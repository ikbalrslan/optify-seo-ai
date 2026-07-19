"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { createOrganization } from "@/actions/organizations";

export function CreateOrganizationDialog({
    open,
    onOpenChange,
    description,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    description: string;
}) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        setError("");
        setIsCreating(true);
        try {
            const result = await createOrganization(name);
            if (!result.success) {
                setError(result.error);
                return;
            }
            // createOrganization() makes the new org active - AppLayoutClient keys the
            // sidebar+content subtree on organizationId, so this remounts and refetches
            // everything org-scoped instead of needing a full page reload.
            router.refresh();
            setName("");
            onOpenChange(false);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new organization</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                    <Input
                        placeholder="Organization name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={isCreating || !name.trim()}>
                        {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
