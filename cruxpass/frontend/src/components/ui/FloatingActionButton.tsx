import React from 'react';
import { cn } from "@/lib/utils"; // optional – use your own helper if needed

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function FloatingActionButton({
  onClick,
  label,
  icon,
  className
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        `
        fixed
        right-6

        /* Default (mobile) — keep above bottom nav + safe-area inset */
        bottom-[calc(60px+env(safe-area-inset-bottom)+1.5rem)]

        /* Desktop — no bottom nav */
        md:bottom-6

        z-[60]
        px-4 py-2
        rounded-full
        bg-green
        text-background
        font-semibold
        shadow-lg
        flex items-center gap-2
        text-base
        hover:bg-select
        transition
        active:scale-95
        `,
        className
      )}
    >
      {icon}
      <span className="relative top-[1px]">{label}</span>
    </button>
  );
}
