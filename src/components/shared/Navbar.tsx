import { ThemeToggle } from "@/components/shared/ThemeToggle";

export function Navbar() {

    return (
        <div className="sticky top-0 z-30 flex items-center justify-end px-4 h-12 border-b border-border/40 bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <ThemeToggle />
        </div>
    );
}
