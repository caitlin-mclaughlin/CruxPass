import { useState, useEffect } from 'react'
import InputMask from 'react-input-mask'
import { Input } from './input'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Calendar } from 'lucide-react'
import { MAX_AGE, MIN_AGE } from '@/constants/literal'

export default function SegmentedDateInput({
  value,
  onChange
}: {
  value?: Date | null
  onChange: (date: Date | null) => void
}) {
  const [date, setDate] = useState<Date | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [inputValue, setInputValue] = useState('') // MM/DD/YYYY masked string

  const today = new Date()
  const minDate = new Date(today.getFullYear() - MAX_AGE, today.getMonth(), today.getDate())
  const maxDate = new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate())

  // Sync inputValue & date when prop 'value' changes
  useEffect(() => {
    if (value) {
      const mm = String(value.getMonth() + 1).padStart(2, '0')
      const dd = String(value.getDate()).padStart(2, '0')
      const yyyy = String(value.getFullYear())
      setInputValue(`${mm}/${dd}/${yyyy}`)
      setDate(value)
    } else {
      setInputValue('')
      setDate(null)
    }
  }, [value])

  // Validate date string "MM/DD/YYYY" and call onChange if valid or null if invalid
  const validateAndSetDate = (val: string) => {
    // If input is incomplete (e.g., too short or missing parts), treat as invalid
    if (!val || val.length !== 10 || val.includes('_')) {
      setDate(null)
      onChange(null)
      return
    }

    const [mm, dd, yyyy] = val.split('/')

    // Basic regex and range checks for month, day, year
    const validMonth = /^\d{2}$/.test(mm) && Number(mm) >= 1 && Number(mm) <= 12
    const validDay = /^\d{2}$/.test(dd) && Number(dd) >= 1 && Number(dd) <= 31
    const validYear = /^\d{4}$/.test(yyyy)

    if (!validMonth || !validDay || !validYear) {
      setDate(null)
      onChange(null)
      return
    }

    const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
    parsed.setHours(12) // avoid timezone issues

    // Check if parsed date is valid and within allowed min/max range
    if (!isNaN(parsed.getTime()) && parsed >= minDate && parsed <= maxDate) {
      setDate(parsed)
      onChange(parsed)
    } else {
      setDate(null)
      onChange(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    validateAndSetDate(val)
  }

  const handleDateSelect = (selectedDate: Date | null) => {
    if (selectedDate) {
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const dd = String(selectedDate.getDate()).padStart(2, '0')
      const yyyy = String(selectedDate.getFullYear())
      const formatted = `${mm}/${dd}/${yyyy}`
      setInputValue(formatted)
      setDate(selectedDate)
      onChange(selectedDate)
      setShowPicker(false)
    }
  }

  return (
    <div className="flex items-center w-full">
      <InputMask
        mask="99/99/9999"
        maskChar={null}
        value={inputValue}
        onChange={handleInputChange}
        placeholder="MM/DD/YYYY"
        className="text-left bg-transparent border-none shadow-none focus:outline-none"
      >
        {(inputProps: any) => <Input {...inputProps} />}
      </InputMask>

      <div className="relative ml-auto">
        <button
          type="button"
          onClick={() => setShowPicker((prev) => !prev)}
          className="flex items-center text-green ml-2"
          aria-label="Toggle calendar date picker"
        >
          <Calendar size={18} className="mr-2" />
        </button>

        {showPicker && (
          <div className="absolute left-1/2 top-full mt-2 transform -translate-x-1/2 z-50">
            <DatePicker
              inline
              selected={date}
              onChange={handleDateSelect}
              onClickOutside={() => setShowPicker(false)}
              maxDate={maxDate}
              minDate={minDate}
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={50}
              calendarClassName="react-datepicker"
            />
          </div>
        )}
      </div>
    </div>
  )
}
