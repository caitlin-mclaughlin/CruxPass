// components/ui/EnumSelect.tsx
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/react'
import { ChevronDown } from 'lucide-react'

interface EnumSelectProps<T extends string> {
  labelMap?: Record<T, string>
  options: T[]
  value: T
  onChange: (val: T) => void
  onOpen?: (open: boolean) => void
  placeholder?: string
  className?: string
}

export function EnumSelect<T extends string>({
  labelMap,
  options,
  value,
  onChange,
  onOpen,
  placeholder = 'Select an option...',
  className = '',
}: EnumSelectProps<T>) {
  return (

    <Listbox value={value} onChange={onChange}>
      {({ open }) => {
        if (onOpen) onOpen(open)

        return (
          <div className={`relative w-full ${className}`}>
            <ListboxButton
              className="relative w-full cursor-pointer rounded-md shadow-md bg-shadow border border-green \
                         px-3 py-1 pr-10 text-left items-center text-green h-9 text-md focus:outline-none"
            >
              {!value ? placeholder : (labelMap ? labelMap[value] : value)}
            </ListboxButton>

            <ChevronDown
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-green hover:text-prompt"
              size={18}
              aria-hidden="true"
            />

            {open && (
              <ListboxOptions
                className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-background border border-green text-green shadow-lg z-10 focus:outline-none"
              >
                {options.map((option) => (
                  <ListboxOption key={option} value={option}>
                    {({ selected, focus }) => (
                      <div
                        className={`cursor-pointer rounded-md select-none px-3 py-1 ${
                          focus
                            ? 'bg-green text-background font-semibold'
                            : 'text-green'
                        } ${selected ? 'font-semibold' : ''}`}
                      >
                        {labelMap ? labelMap[option] : option}
                      </div>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            )}
          </div>
        )
      }}
    </Listbox>
  )
}
