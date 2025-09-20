import { AccountType, AccountTypeDisplay } from '@/constants/enum'
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/react'
import { ChevronDown } from 'lucide-react'

const accountTypes: AccountType[] = [AccountType.CLIMBER, AccountType.GYM, AccountType.SERIES]

export function AccountTypeSelect({
  value,
  onChange,
}: {
  value: AccountType
  onChange: (val: AccountType) => void
}) {
  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className="relative w-full shadow-md">
          <ListboxButton
            className="relative w-full cursor-pointer rounded-md bg-shadow border border-green px-3 py-1 pr-10 text-left text-green focus:outline-none"
          >
            {AccountTypeDisplay[value]}
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
              {accountTypes.map((type) => (
                <ListboxOption key={type} value={type}>
                  {({ selected, focus }) => (
                    <div
                      className={`cursor-pointer rounded-md select-none px-3 py-1 ${
                        focus ? 'bg-green text-background font-semibold' : 'text-green'
                      } ${selected ? 'font-semibold' : ''}`}
                    >
                      {AccountTypeDisplay[type]}
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
