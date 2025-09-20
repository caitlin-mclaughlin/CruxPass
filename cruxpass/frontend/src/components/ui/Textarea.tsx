import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn("px-3 py-2 border border-green rounded-md text-green bg-shadow shadow-md focus:outline-none", className)}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea }
