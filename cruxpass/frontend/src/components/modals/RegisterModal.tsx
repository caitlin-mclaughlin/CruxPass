import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { CompRegistrationRequestDto } from '@/models/dtos'
import { useClimberSession } from '@/context/ClimberSessionContext'
import { useGymSession } from '@/context/GymSessionContext'
import { useClimberCompetition } from '@/context/ClimberCompetitionContext'
import { useClimberLookup } from '@/context/ClimberLookupContext'
import { isEligibleForGroup } from '@/utils/ageEligibility'
import {
  CompetitionEnumMap,
  COMPETITOR_GROUPS,
  CompetitorGroup,
  DivisionEnumMap,
  Division,
  SearchType,
  SearchTypeDisplay
} from '@/constants/enum'
import CustomRadioGroup from '@/components/ui/CustomRadioGroup'
import { Button } from '@/components/ui/Button'
import { CompetitionSummary, DependentClimber, SimpleClimber } from '@/models/domain'
import { EnumSelect } from '../ui/EnumSelect'
import { ClimberSearchResults } from '../ui/ClimberSearchResults'
import { Input } from '../ui/Input'
import { Search } from 'lucide-react'
import { formatDate, formatPhoneNumber } from '@/utils/formatters'
import DependentSelect from '../ui/DependentSelect'

interface Props {
  open: boolean
  onClose: () => void
  competition: CompetitionSummary
  onSuccess: () => void
  mode?: 'climber' | 'gym'
}

export default function RegisterModal({ open, onClose, competition, onSuccess, mode = 'climber' }: Props) {
  const [selectedGroup, setSelectedGroup] = useState<CompetitorGroup | null>(null)
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedClimberId, setSelectedClimberId] = useState<number | null>(null)

  // Gym-specific state
  const [searchMode, setSearchMode] = useState<SearchType>(SearchType.EMAIL)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClimber, setSelectedClimber] = useState<SimpleClimber | null>(null)
  const [dependents, setDependents] = useState<DependentClimber[]>([])

  const { climber, dependents: climberDependents, refreshClimber } = useClimberSession()
  const { gym, refreshGym } = useGymSession()
  const { updateRegistration, refreshRegistration } = useClimberCompetition()
  const { results, loading, searchClimbers, getDependents, clearSearch } = useClimberLookup()

  const divisions = competition.divisions || []
  const sortedGroups = COMPETITOR_GROUPS.filter(group => competition.competitorGroups.includes(group))
  const isYouthGroup = (group: string) => group.includes('YOUTH') || group.includes('JUNIOR')

  const searchRef = useRef<HTMLDivElement>(null)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


  // Search handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setError(null)
    await searchClimbers(`${searchMode}:${searchQuery.trim()}`)
  }

  // When a gym selects a climber, fetch dependents if they exist
  const handleSelectClimber = async (climberId: number) => {
    const found = results.find(c => c.id === climberId)
    if (!found) return
    setSelectedClimber(found)
    const deps = await getDependents(climberId)
    if (deps && deps.length > 0) setDependents(deps)
    else setDependents([])
  }

  const handleSubmit = async () => {
    try {
      let targetClimber: any = null

      if (mode === 'climber') {
        if (climberDependents?.length && selectedClimberId) {
          targetClimber = climberDependents.find(c => c.id === selectedClimberId)
        } else {
          targetClimber = climber
        }
      } else if (mode === 'gym') {
        if (!selectedClimber) {
          setError('Please select a climber from search results.')
          return
        }
        if (dependents?.length && selectedClimberId) {
          targetClimber = dependents.find(c => c.id === selectedClimberId)
        } else {
          targetClimber = selectedClimber
        }
      }

      if (!selectedGroup || !selectedDivision || !targetClimber) {
        setError('Please complete all required fields.')
        return
      }

      const isAgeEligible = isEligibleForGroup(targetClimber.dob, selectedGroup)
      if (!isAgeEligible && isYouthGroup(selectedGroup)) {
        setError("This climber must be within this group's age range.")
        return
      } else if (!isAgeEligible) {
        setError('This climber must be at least 19 years old to compete in this group.')
        return
      }

      const payload: CompRegistrationRequestDto = {
        id: targetClimber.id,
        climberName: targetClimber.name,
        email: targetClimber.email,
        dob: targetClimber.dob,
        competitorGroup: selectedGroup,
        division: selectedDivision,
        paid: true
      }

      await updateRegistration(competition.gymId, competition.id, payload)
      onSuccess()
      handleClose()
    } catch (err) {
      console.error(err)
      setError('Registration failed. You may already be registered.')
    }
  }

  const handleClose = () => {
    setSelectedClimber(null)
    setDependents([])
    setSearchQuery('')
    clearSearch()
    setError(null)
    setSelectedGroup(null)
    setSelectedDivision(null)
    setSelectedClimberId(null)
    onClose()
  }

  const refresh = async () => {
    if (mode === 'gym') await refreshGym()
    else await refreshClimber()
    await refreshRegistration(competition.gymId, competition.id)
  }

  useEffect(() => {
    if (open) refresh()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'gym'
              ? `Register a Climber for ${competition.name}`
              : `Register for ${competition.name}`}
          </DialogTitle>
          <DialogDescription>
            {mode === 'gym'
              ? 'Find a climber by email, name, or phone, then complete their registration.'
              : 'Select your climber and division to register.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-green">
          {/* Gym Mode: Climber Lookup */}
          {mode === 'gym' && (
            <div className="space-y-3" ref={searchRef}>
              <div className="space-y-1">
                <div className="flex gap-2">
                  <EnumSelect
                    labelMap={SearchTypeDisplay}
                    options={Object.values(SearchType)}
                    value={searchMode}
                    onChange={(val: SearchType) => {
                      setShowResults(false)
                      setSearchMode(val)
                    }}
                    onOpen={(isOpen) => {
                      if (isOpen) setShowResults(false)
                    }}
                    className="flex-1 w-fit"
                  />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setShowResults(true)
                      setSearchQuery(e.target.value)
                    }}
                    placeholder={`Search by ${searchMode}`}
                    onFocus={() => {
                      if (searchQuery) setShowResults(true)
                    }} // show when focused
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        await handleSearch()
                        setShowResults(true)
                      }
                    }}
                  />
                  <Button
                    onClick={async () => {
                      await handleSearch()
                      setShowResults(true)
                    }}
                    disabled={loading}
                  >
                    <Search size={18} />
                    <span>{loading ? 'Searching...' : 'Search'}</span>
                  </Button>
                </div>

                {showResults && (
                  <ClimberSearchResults
                    results={results}
                    selectedClimberId={selectedClimber?.id ?? null}
                    onSelect={(id) => {
                      handleSelectClimber(id)
                      setShowResults(false)
                    }}
                    loading={loading}
                  />
                )}
              </div>

              {/* Selected climber info (persistent after dropdown closes) */}
              {selectedClimber && (
                <div className="grid grid-cols-[auto_auto_105px_70px] items-center gap-2 border border-green bg-shadow rounded-md px-3 py-1 text-green shadow-md">
                  <span className="border-r border-green font-semibold">{selectedClimber.name}</span>
                  <span className="border-r border-green text-sm font-semibold">{selectedClimber.email}</span>
                  {selectedClimber.phone && (
                    <span className="border-r border-green text-sm font-semibold">{formatPhoneNumber(selectedClimber.phone)}</span>
                  )}
                  {selectedClimber.dob && (
                    <span className="flex text-sm font-semibold">
                      {formatDate(new Date(selectedClimber.dob))}
                    </span>
                  )}
                </div>
              )}

              {/* Dependents (if any) */}
              {dependents.length > 0 && (
                <DependentSelect
                  dependents={dependents}
                  selectedClimberId={selectedClimberId}
                  onChange={setSelectedClimberId}
                  defaultLabel="Primary Account"
                />
              )}
            </div>
          )}

          {/* Climber Mode: Dependent Selector */}
          {mode === 'climber' && climberDependents?.length > 0 && (
            <DependentSelect
              dependents={climberDependents}
              selectedClimberId={selectedClimberId}
              onChange={setSelectedClimberId}
            />
          )}

          {/* Group Selection */}
          <div>
            <label className="font-semibold">Competitor Group:</label>
            <div className="px-3 py-1 bg-shadow border border-green rounded-md shadow-md">
              <CustomRadioGroup
                name="group"
                options={sortedGroups.map(group => ({
                  value: group,
                  label: CompetitionEnumMap[group as keyof typeof CompetitionEnumMap]
                }))}
                selected={selectedGroup}
                onChange={setSelectedGroup}
              />
            </div>
          </div>

          {/* Division Selection */}
          {divisions.length > 0 && (
            <div>
              <label className="font-semibold">Gender Division:</label>
              <div className="flex flex-wrap px-3 py-1 bg-shadow border border-green rounded-md shadow-md">
                <CustomRadioGroup
                  name="division"
                  options={divisions.map(g => ({
                    value: g,
                    label: DivisionEnumMap[g as keyof typeof DivisionEnumMap]
                  }))}
                  selected={selectedDivision}
                  onChange={setSelectedDivision}
                />
              </div>
            </div>
          )}

          {error && <div className="text-accent mt-2">{error}</div>}

          <Button onClick={handleSubmit} className="w-full mt-2">
            {mode === 'gym'
              ? `Register Climber for ${competition.name}`
              : `Register for ${competition.name}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
