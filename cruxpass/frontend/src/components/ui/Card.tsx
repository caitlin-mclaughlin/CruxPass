import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("flex gap-1 p-3 overflow-hidden rounded-md border border-green/20 bg-shadow shadow-lg items-center", className)}>
            {children}
        </div>
    )
}