
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface SuccessPopupProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
}

export function SuccessPopup({ isOpen, onClose, title = "Success", message }: SuccessPopupProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-6 bg-white rounded-2xl border-none shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#1a1a1a] text-center">
                        {title}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-4 py-4">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-center text-slate-600 text-[15px]">
                        {message}
                    </p>
                    <Button
                        onClick={onClose}
                        className="w-full bg-[#1a1a1a] hover:bg-black text-white rounded-xl h-11"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
