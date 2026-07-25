"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInvitePreview, acceptInvite } from "@/actions/organizations";

type Preview = { organizationName: string; email: string; role: string };

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const router = useRouter();
    const { token } = use(params);
    const [preview, setPreview] = useState<Preview | null | undefined>(undefined);
    const [error, setError] = useState("");
    const [isAccepting, setIsAccepting] = useState(false);

    useEffect(() => {
        getInvitePreview(token).then(setPreview);
    }, [token]);

    const handleAccept = async () => {
        setIsAccepting(true);
        setError("");
        try {
            const result = await acceptInvite(token);
            if (!result.success) {
                setError(result.error);
                return;
            }
            router.push("/organization");
        } finally {
            setIsAccepting(false);
        }
    };

    if (preview === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (preview === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 text-center">
                <h1 className="text-xl font-semibold text-slate-900 mb-2">Invite not found</h1>
                <p className="text-slate-500 mb-6">This invite link is invalid, expired, or has already been used.</p>
                <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-[#009E8A] mb-4" />
            <h1 className="text-xl font-semibold text-slate-900 mb-2">Join {preview.organizationName}</h1>
            <p className="text-slate-500 mb-1">
                You've been invited as <span className="font-medium">{preview.role.toLowerCase()}</span>.
            </p>
            <p className="text-slate-400 text-sm mb-6">Invited email: {preview.email}</p>
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            <Button onClick={handleAccept} disabled={isAccepting}>
                {isAccepting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Accept Invite
            </Button>
        </div>
    );
}
