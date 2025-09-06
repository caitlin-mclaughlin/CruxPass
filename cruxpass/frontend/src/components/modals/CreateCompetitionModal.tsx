import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { COMPETITION_TYPES, COMPETITION_FORMATS, COMPETITOR_GROUPS, CompetitionEnumMap, CompetitionStatus, GENDER_OPTIONS, Gender, GenderEnumMap } from '@/constants/enum'
import { CompetitionFormat, CompetitionType, CompetitorGroup } from '@/constants/enum'
import DatePicker from 'react-datepicker'
import { useEffect, useState } from 'react'
import { COMP_DURATION } from '@/constants/literal'
import { parseAddress } from '@/utils/formatters'
import { CompetitionFormPayload } from '@/models/dtos'
import { format, isValid, parse } from 'date-fns'
import { displayDateTime, parseBackendLocal } from '@/utils/datetime'
import { useIsMobile } from '@/hooks/isMobile'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: CompetitionFormPayload) => void
  gymName: string
  gymAddress: string
  initialData?: {
    name: string
    date: string
    duration: number
    deadline: string
    capacity: number
    types: CompetitionType[]
    compFormat: CompetitionFormat
    competitorGroups: CompetitorGroup[]
    divisions: Gender[]
    divisionsEnabled: boolean
  }
}

type FormState = {
  name: string
  date: Date | null
  duration: number | ''
  deadline: Date | null
  capacity: number | ''
  types: CompetitionType[]
  compFormat: CompetitionFormat
  groups: CompetitorGroup[]
  divisions: Gender[]
  divisionsEnabled: boolean
}

function buildInitialForm(data?: Props['initialData']): FormState {
  return data
    ? {
        name: data.name,
        date: parseBackendLocal(data.date),
        duration: data.duration ?? 180, 
        deadline: parseBackendLocal(data.deadline),
        capacity: data.capacity,
        types: data.types,
        compFormat: data.compFormat,
        groups: data.competitorGroups,
        divisions: data?.divisions ?? [],
        divisionsEnabled: !!data?.divisions?.length, // true if any were prefilled
      }
    : {
        name: '',
        date: null,
        duration: '',
        deadline: null,
        capacity: '',
        types: [],
        compFormat: '' as CompetitionFormat,
        groups: [],
        divisions: [],
        divisionsEnabled: false,
      }
}

export default function CreateCompetitionModal(props: Props) {
  const { open, onClose, onSubmit, gymName, gymAddress, initialData } = props;
  const [form, setForm] = useState<FormState>(() => buildInitialForm(initialData));
  
  useEffect(() => {
    setForm(buildInitialForm(initialData));
  }, [initialData, open]);

  const handleSubmit = async () => {
    const { name, date, deadline, capacity, types, compFormat, groups, divisions, divisionsEnabled } = form

    if (!name || !date || !deadline || capacity === '' || !types.length || !compFormat 
      || !groups.length || (divisionsEnabled && !divisions.length)
    ) {
      alert('Please complete all fields before submitting.')
      return
    }
    
    const now = new Date()
    const compStart = form.date!
    const compEnd = new Date(compStart.getTime() + Number(form.duration))

    let compStatus: CompetitionStatus
    if (now < compStart) {
      compStatus = 'UPCOMING'
    } else if (now >= compStart && now <= compEnd) {
      compStatus = 'LIVE'
    } else {
      compStatus = 'FINISHED'
    }

    const payload = {
      name: name,
      date: form.date ? format(form.date, 'yyyy-MM-dd HH:mm:ss') : null,
      duration: form.duration,
      deadline: form.deadline ? format(form.deadline, 'yyyy-MM-dd HH:mm:ss') : null,
      capacity: capacity,
      types: types as CompetitionType[],
      compFormat: compFormat as CompetitionFormat,
      competitorGroups: groups as CompetitorGroup[],
      divisions: divisions as Gender[],
      compStatus: compStatus as CompetitionStatus,
      location: parseAddress(gymAddress) // parse into structured fields
    }

    onSubmit(payload as CompetitionFormPayload)
    onClose()
  }

  const toggleArrayValue = <T,>(value: T, arr: T[]): T[] =>
    arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]

  const portalTarget = typeof document !== 'undefined'
  ? document.getElementById("datepicker-portal")
  : undefined;

  const isMobile = useIsMobile();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Competition' : 'Create Competition'}</DialogTitle>
          <DialogDescription>Fill out the details for your gym's new competition.</DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Competition Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <div className="flex gap-4 w-full">
          <DatePicker
            wrapperClassName="flex-1"
            selected={form.date}
            onChange={(date) => setForm((prev: any) => ({ ...prev, date }))}
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Competition Date & Time"
            customInput={<Input />}
            popperPlacement="bottom-start"
            popperClassName="datepicker-popper"
            popperContainer={(props) => <div {...props} />}
            portalId={isMobile ? "datepicker-portal" : undefined} 
          />
          <DatePicker
            wrapperClassName="flex-1"
            selected={form.deadline}
            onChange={(deadline) => setForm((prev: any) => ({ ...prev, deadline }))}
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Registration Deadline"
            customInput={<Input />}
            popperPlacement="bottom-start"
            popperClassName="datepicker-popper"
            popperContainer={(props) => <div {...props} />}
            portalId={isMobile ? "datepicker-portal" : undefined} 
          />
        </div>

        
        <div className="flex gap-4 w-full">
          <div className="flex-1">
            <label className="font-semibold">Duration (Minutes)</label>
            <Input
              type="number"
              placeholder="Competition duration"
              step={30}
              value={form.duration}
              onChange={e =>
                setForm({
                  ...form,
                  duration: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                })
              }
            />
          </div>

          <div className="flex-1">
            <label className="font-semibold">Capacity</label>
            <Input
              type="number"
              placeholder="Max number of registrations"
              step={10}
              value={form.capacity}
              onChange={e =>
                setForm({ ...form, capacity: e.target.value === '' ? '' : parseInt(e.target.value, 10) })
              }
            />
          </div>
        </div>

        <div>
            <label className="font-semibold">Types</label>
            <div className="flex flex-wrap space-x-5 gap-2 border border-green bg-shadow px-3 py-1 rounded-md shadow">
              {COMPETITION_TYPES.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    checked={form.types.includes(type)}
                    onCheckedChange={() =>
                      setForm({ ...form, types: toggleArrayValue(type, form.types) })
                    }
                  />
                  <span>{CompetitionEnumMap[type]}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold">Format</label>
            <Select
              value={form.compFormat}
              onValueChange={(val: CompetitionFormat) => setForm({ ...form, compFormat: val as CompetitionFormat })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Format" />
              </SelectTrigger>
              <SelectContent>
                {COMPETITION_FORMATS.map(f => (
                  <SelectItem key={f} value={f}>
                    {CompetitionEnumMap[f]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="font-semibold">Competitor Groups</label>
            <div className="flex flex-wrap space-x-5 gap-2 border border-green bg-shadow px-3 py-1 rounded-md shadow">
              {COMPETITOR_GROUPS.map(group => (
                <div key={group} className="flex items-center space-x-2">
                  <Checkbox
                    checked={form.groups.includes(group)}
                    onCheckedChange={() =>
                      setForm({ ...form, groups: toggleArrayValue(group, form.groups) })
                    }
                  />
                  <span>{CompetitionEnumMap[group]}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold">Group Divisions</label>
              <div className="flex items-center">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.divisionsEnabled}
                  onClick={() =>
                    setForm(prev => ({
                      ...prev,
                      divisionsEnabled: !prev.divisionsEnabled,
                      divisions: !prev.divisionsEnabled ? prev.divisions : [],
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 border border-green items-center rounded-full transition-colors focus:outline-none ${
                    form.divisionsEnabled ? 'bg-green' : 'bg-shadow'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full border border-green bg-background transition-transform ${
                      form.divisionsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>


            <div
              className={`flex flex-wrap space-x-5 gap-2 border px-3 py-1 rounded-md shadow transition-opacity ${
                form.divisionsEnabled
                  ? 'border-green bg-shadow opacity-100'
                  : 'border-border bg-muted text-muted opacity-50 pointer-events-none'
              }`}
            >
              {GENDER_OPTIONS.map(division => (
                <div key={division} className="flex items-center space-x-2">
                  <Checkbox
                    checked={form.divisions.includes(division)}
                    onCheckedChange={() =>
                      setForm(prev => ({
                        ...prev,
                        divisions: toggleArrayValue(division, prev.divisions),
                      }))
                    }
                  />
                  <span>{GenderEnumMap[division]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-1 border-t border-green pt-3">
            <p className="font-semibold mb-1">Host Gym</p>
            <div className="px-3 py-1 shadow rounded-md border border-green bg-shadow">
              <div>{gymName}</div>
              <div>{gymAddress}</div>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            {initialData ? 'Save Changes' : 'Create Competition'}
          </Button>

      </DialogContent>
    </Dialog>
  )
}
