"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AccountDeletedPopup() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (searchParams.get("account_deleted") === "true") {
            setIsOpen(true);
            // Clean up the URL
            const url = new URL(window.location.href);
            url.searchParams.delete("account_deleted");
            window.history.replaceState({}, "", url);
        }
    }, [searchParams, router]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md p-6 bg-white rounded-2xl border-none shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#1a1a1a] text-center">
                        Account Deleted
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-4 py-4">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-center text-slate-600 text-[15px]">
                        Your account has been successfully deleted. We&apos;re sorry to see you go!
                    </p>
                    <Button
                        onClick={() => setIsOpen(false)}
                        className="w-full bg-[#1a1a1a] hover:bg-black text-white rounded-xl h-11"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
