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
}

export default function CustomRadioGroup({ label, options, selected, onChange, name }: Props) {
  const groupId = useId()

  return (
    <div className="space-y-1">
      {label && <p className="text-green font-semibold mb-1 mt-4">{label}</p>}

      <RadioGroup value={selected} onChange={onChange} name={name} className="space-y-2">
        {options.map(option => (
          <RadioGroup.Option
            key={option.value}
            value={option.value}
            className={({ checked }) =>
              `flex items-center gap-2 cursor-pointer focus:outline-none
               ${checked ? 'text-highlight font-semibold' : 'text-green'}`
            }
          >
            {({ checked }) => (
              <>
                <span
                  className={`w-4 h-4 border rounded-full flex items-center justify-center transition
                    ${checked ? 'border-highlight border-2 bg-background' : 'border-green bg-background'}`}
                >
                  {checked && <span className="w-2 h-2 bg-highlight rounded-full"></span>}
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
