import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/react'
import { ChevronDown } from 'lucide-react'
import { DependentClimber } from '@/models/domain'

interface DependentSelectProps {
  dependents: DependentClimber[]
  selectedClimberId: number | null
  onChange: (id: number | null) => void
  defaultLabel?: string
  className?: string
}

export default function DependentSelect({
  dependents,
  selectedClimberId,
  onChange,
  defaultLabel = 'Myself',
  className = ''
}: DependentSelectProps) {
  // Build combined list (includes the "self" placeholder)
  const options = [
    { id: null, name: `-- ${defaultLabel} --` },
    ...dependents.map((c) => ({ id: c.id, name: c.name })),
  ]

  const selectedOption =
    options.find((opt) => opt.id === selectedClimberId)?.name ??
    `-- ${defaultLabel} --`

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="font-semibold text-green">Select Climber:</label>
      <Listbox
        value={selectedClimberId}
        onChange={(val) => onChange(val ?? null)}
      >
        {({ open }) => (
          <div className="relative w-full">
            <ListboxButton
              className="relative w-full cursor-pointer rounded-md shadow-md bg-shadow border border-green \
                         px-3 py-1 pr-10 text-left items-center text-md text-green focus:outline-none"
            >
              {selectedOption}
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
                  <ListboxOption key={option.id ?? 'self'} value={option.id}>
                    {({ selected, focus }) => (
                      <div
                        className={`cursor-pointer rounded-md select-none px-3 py-1 ${
                          focus
                            ? 'bg-green text-background font-semibold'
                            : 'text-green'
                        } ${selected ? 'font-semibold' : ''}`}
                      >
                        {option.name}
                      </div>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            )}
          </div>
        )}
      </Listbox>
    </div>
  )
}
