import { signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export function SignOutButton({ className, textClassName, showIcon = true, showText = true }: { className?: string, textClassName?: string, showIcon?: boolean, showText?: boolean }) {
    return (
        <form
            action={async () => {
                "use server"
                await signOut({ redirectTo: "/" })
            }}
            className="w-full"
        >
            <Button variant="ghost" className={cn("w-full justify-start pl-3", className)} type="submit">
                {showIcon && <LogOut className={cn("h-4 w-4 mr-3")} />}
                {showText && <span className={textClassName}>Logout</span>}
            </Button>
        </form>
    )
}
