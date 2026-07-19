import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { useState } from "react";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 h-12 border-b border-border/40 bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="md:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="mr-2">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72">
                        <Sidebar onLinkClick={() => setIsOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
