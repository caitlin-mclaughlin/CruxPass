import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'

import {
  COMPETITION_TYPES,
  COMPETITION_FORMATS,
  COMPETITOR_GROUPS,
  CompetitionEnumMap
} from '@/constants/enum'
import DatePicker from 'react-datepicker'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  gymName: string
  gymAddress: string // Expected format: "123 Main St, Madison, WI 53703"
}

export default function CreateCompetitionModal({ open, onClose, onSubmit, gymName, gymAddress }: Props) {
  const [form, setForm] = useState({
    name: '',
    dateTime: null as Date | null,
    types: [] as string[],
    format: '',
    groups: [] as string[],
  })

  const toggleCheckbox = (field: 'types' | 'groups', value: string) => {
    setForm(prev => {
      const list = prev[field]
      return {
        ...prev,
        [field]: list.includes(value) ? list.filter(v => v !== value) : [...list, value]
      }
    })
  }

  const handleSubmit = () => {
    if (!form.name || !form.dateTime || !form.types.length || !form.format || !form.groups.length) {
      alert('Please complete all required fields.')
      return
    }

    const payload = {
      name: form.name,
      date: form.dateTime.toISOString(),
      types: form.types,
      format: form.format,
      competitorGroups: form.groups,
      location: parseAddress(gymAddress) // parse into structured fields
    }

    onSubmit(payload)
    onClose()
  }

  const parseAddress = (address: string) => {
    // Naive parser: assumes "123 Main St, Madison, WI 53703"
    const parts = address.split(',')
    const streetAddress = parts[0]?.trim() || ''
    const city = parts[1]?.trim() || ''
    const stateZip = parts[2]?.trim().split(' ') || []

    return {
      streetAddress,
      apartmentNumber: null,
      city,
      state: stateZip[0] || '',
      zipCode: stateZip[1] || ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-bold">Create Competition</DialogTitle>
          <DialogDescription>Fill out the details for your gym's new competition.</DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Competition Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <div className="flex gap-4 w-full">
          <DatePicker 
            selected={form.dateTime}
            onChange={(date) => setForm(prev => ({ ...prev, dateTime: date }))}
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Select date & time"
            className="rounded-md border px-3 py-1 w-full bg-shadow placeholder-prompt border-green text-green focus:outline-none focus:ring-0 selection:bg-highlight selection:text-background"
          />
        </div>

        <div>
          <p className="font-semibold mb-1">Type</p>
          <div className="flex gap-4 flex-wrap px-2.5 py-1 shadow rounded-md border border-green bg-shadow">
            {COMPETITION_TYPES.map(typeKey => (
              <label key={typeKey} className="flex items-center gap-1">
                <Checkbox
                  checked={form.types.includes(typeKey)}
                  onCheckedChange={() => toggleCheckbox('types', typeKey)}
                />
                {CompetitionEnumMap[typeKey]}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold mb-1">Format</p>
          <Select value={form.format} onValueChange={(value: any) => setForm({ ...form, format: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {COMPETITION_FORMATS.map(format => (
                <SelectItem key={format} value={format}>
                  {CompetitionEnumMap[format]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="font-semibold mb-1">Competitor Groups</p>
          <div className="flex gap-4 flex-wrap px-2.5 py-1 shadow rounded-md border border-green bg-shadow">
            {COMPETITOR_GROUPS.map(competitorGroup => (
              <label key={competitorGroup} className="flex items-center gap-1">
                <Checkbox
                  checked={form.groups.includes(competitorGroup)}
                  onCheckedChange={() => toggleCheckbox('groups', competitorGroup)}
                />
                {CompetitionEnumMap[competitorGroup]}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-2 border-t border-green pt-4">
          <p className="font-semibold mb-1">Host Gym</p>
          <div className="px-3 py-1 shadow rounded-md border border-green bg-shadow">
            <div>{gymName}</div>
            <div>{gymAddress}</div>
          </div>
        </div>

        <Button onClick={handleSubmit}>Submit</Button>
      </DialogContent>
    </Dialog>
  )
}
