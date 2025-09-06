// /components/ui/dateinput.tsx
import React from 'react'
import { Input } from '@/components/ui/Input'

export const DateInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ value, onClick, placeholder, onChange }, ref) => (
  <Input
    ref={ref}
    value={value}
    onClick={onClick}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full"
  />
))
DateInput.displayName = 'DateInput'
