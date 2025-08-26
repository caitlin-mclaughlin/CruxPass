import { AccountType, AccountTypeDisplay } from '@/constants/enum'
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const accountTypes: AccountType[] = [AccountType.CLIMBER, AccountType.GYM]

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
            className="relative w-full cursor-default rounded-md bg-shadow border border-green px-3 py-1 pr-10 text-left text-green text-green focus:outline-none"
          >
            {AccountTypeDisplay[value]}
            <ChevronDownIcon
              className="pointer-events-none absolute inset-y-1.5 right-2 h-5 w-5 text-green"
              aria-hidden="true"
            />
          </ListboxButton>

          {open && (
            <ListboxOptions
              className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-background border border-green text-green shadow-lg z-10"
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
