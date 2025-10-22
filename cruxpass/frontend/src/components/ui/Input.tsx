import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-green bg-shadow px-3 py-1 text-green shadow-md \
          transition-colors duration-200 placeholder:text-prompt placeholder:font-normal text-left \
          focus-visible:outline-none disabled:cursor-not-allowed text-md items-center",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
