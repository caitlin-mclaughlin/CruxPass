// components/CustomRadioGroup.tsx
import { useId } from 'react'
import { RadioGroup } from '@headlessui/react'

interface Option {
  value: string
  label: string
}

interface Props {
  label?: string
  options: Option[]
  selected: string | null
  onChange: (value: any) => void
  name: string
  invalid?: boolean // 👈 added
}

export default function CustomRadioGroup({ label, options, selected, onChange, name, invalid = false }: Props) {
  const groupId = useId()

  return (
    <div className="space-y-1">
      {label && (
        <p
          className={`font-semibold mb-1 mt-4 ${
            invalid ? 'text-accent' : 'text-green'
          }`}
        >
          {label}
        </p>
      )}

      <RadioGroup value={selected} onChange={onChange} name={name} className="space-y-2">
        {options.map(option => (
          <RadioGroup.Option
            key={option.value}
            value={option.value}
            className={({ checked }) =>
              `flex items-center gap-2 cursor-pointer focus:outline-none transition
               ${
                 invalid
                   ? 'text-accent'
                   : checked
                   ? 'text-highlight font-semibold'
                   : 'text-green'
               }`
            }
          >
            {({ checked }) => (
              <>
                <span
                  className={`w-4 h-4 border rounded-full flex items-center bg-background justify-center transition
                    ${
                      invalid
                        ? 'border-accent'
                        : checked
                        ? 'border-highlight border-2'
                        : 'border-green'
                    }`}
                >
                  {checked && (
                    <span
                      className={`w-2 h-2 ${
                        invalid ? 'bg-accent' : 'bg-highlight'
                      } rounded-full`}
                    ></span>
                  )}
                </span>
                <span className="select-none text-sm">{option.label}</span>
              </>
            )}
          </RadioGroup.Option>
        ))}
      </RadioGroup>
    </div>
  )
}
