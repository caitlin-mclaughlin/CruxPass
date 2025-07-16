import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const accountTypes = [
  { label: 'Climber', value: 'climber' },
  { label: 'Gym', value: 'gym' }
]

export function AccountTypeSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className="relative w-full">
          <ListboxButton
            className="relative w-full cursor-default rounded bg-shadow border border-base py-2 pl-3 pr-10 text-left text-green text-green focus:outline-none"
          >
            {accountTypes.find(t => t.value === value)?.label}
            <ChevronDownIcon
              className="pointer-events-none absolute inset-y-2 right-2 h-5 w-5 text-green"
              aria-hidden="true"
            />
          </ListboxButton>

          {open && (
            <ListboxOptions
              className="absolute mt-1 max-h-60 w-full overflow-auto rounded bg-background border border-base text-green shadow-lg z-10"
            >
              {accountTypes.map(({ label, value: val }) => (
                <ListboxOption key={val} value={val}>
                  {({ selected, focus }) => (
                    <div
                      className={`cursor-pointer rounded select-none px-4 py-2 ${
                        focus ? 'bg-green text-background font-semibold' : 'text-green'
                      } ${selected ? 'font-semibold' : ''}`}
                    >
                      {label}
                    </div>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          )}
        </div>
      )}
    </Listbox>
  )
}
