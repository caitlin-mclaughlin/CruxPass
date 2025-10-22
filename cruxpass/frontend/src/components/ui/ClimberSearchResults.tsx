import { SimpleClimber } from '@/models/domain'
import { formatDate, formatPhoneNumber } from '@/utils/formatters'
import { format } from 'date-fns'

interface Props {
  results: SimpleClimber[]
  selectedClimberId: number | null
  onSelect: (climberId: number) => void
  loading?: boolean
}

export function ClimberSearchResults({
  results,
  selectedClimberId,
  onSelect,
  loading = false,
}: Props) {
  if (loading) {
    return (
      <div className="absolute left-6 right-6 border border-green bg-shadow rounded-md shadow-lg z-10 p-2 text-center text-green text-sm">
        Searching...
      </div>
    )
  }

  if (!results.length) {
    return (
      <div className="absolute left-6 right-6 border border-green bg-shadow rounded-md shadow-lg z-10 p-2 text-center text-green italic text-sm">
        No climbers found.
      </div>
    )
  }

  return (
    <div className="absolute left-6 right-6 max-h-56 overflow-y-auto border border-green bg-shadow rounded-md shadow-lg z-10 text-sm">
      {/* Header row */}
      <div className="grid grid-cols-[115px_auto_105px_70px] gap-2 px-3 py-1 bg-green text-background font-semibold border-b border-green text-">
        <span className="border-r border-bg">Name</span>
        <span className="border-r border-bg">Email</span>
        <span className="border-r border-bg">Phone</span>
        <span>Birthday</span>
      </div>

      {/* Result rows */}
      {results.map((climber) => (
        <button
          key={climber.id}
          type="button"
          onClick={() => onSelect(climber.id)}
          className={`grid grid-cols-[115px_auto_105px_70px] gap-2 w-full px-3 py-1 text-left transition ${
            selectedClimberId === climber.id
              ? 'bg-highlight text-background font-semibold'
              : 'text-green bg-background hover:bg-shadow hover:font-semibold'
          }`}
        >
          <span className={`truncate border-r ${
            selectedClimberId === climber.id 
              ? 'border-background' : 'border-green'
          }`}>{climber.name}</span>
          <span className={`truncate border-r ${
            selectedClimberId === climber.id 
              ? 'border-background' : 'border-green'
          }`}>{climber.email}</span>
          <span className={`border-r ${
            selectedClimberId === climber.id 
              ? 'border-background' : 'border-green'
          }`}>{formatPhoneNumber(climber.phone )|| '-'}</span>
          <span>
            {climber.dob ? formatDate(new Date(climber.dob)) : '-'}
          </span>
        </button>
      ))}
    </div>
  )
}
