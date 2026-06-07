import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { CompRegistrationRequestDto } from '@/models/dtos'
import { useClimberSession } from '@/context/ClimberSessionContext'
import { useGymSession } from '@/context/GymSessionContext'
import { useClimberCompetition } from '@/context/ClimberCompetitionContext'
import { useClimberLookup } from '@/context/ClimberLookupContext'
import { isEligibleForGroup } from '@/utils/ageEligibility'
import {
  DEFAULT_COMPETITOR_GROUPS,
  DivisionEnumMap,
  Division,
  DIVISION_OPTIONS,
  SearchType,
  SearchTypeDisplay,
  DefaultCompetitorGroupMap
} from '@/constants/enum'
import type { DefaultCompetitorGroup } from '@/constants/enum'
import { differenceInYears } from 'date-fns'
import CustomRadioGroup from '@/components/ui/CustomRadioGroup'
import { Button } from '@/components/ui/Button'
import { CompetitionEntity, DependentClimber, SimpleClimber } from '@/models/domain'
import { EnumSelect } from '../ui/EnumSelect'
import { SearchResults } from '../ui/SearchResults'
import { Input } from '../ui/Input'
import { Search } from 'lucide-react'
import { formatDate, formatPhoneNumber } from '@/utils/formatters'
import DependentSelect from '../ui/DependentSelect'
import { displayDateTime, formatHeatTimeRange } from '@/utils/datetime'
import { getSummaryDivisions, heatSupportsGroup } from '@/utils/competitionSummary'
import { updateRegistrationForComp as updateGymRegistration } from '@/services/gymCompetitionService'
import { createStripeCheckoutSession } from '@/services/stripeService'
import { updateMyRegistrationForComp } from '@/services/climberCompetitionService'

interface Props {
  open: boolean
  onClose: () => void
  competition: CompetitionEntity
  onSuccess: () => void
  mode?: 'climber' | 'gym'
  dependentOnly?: boolean
}

export default function RegisterModal({ open, onClose, competition, onSuccess, mode = 'climber', dependentOnly = false }: Props) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
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
  const {
    competition: detailedCompetition,
    refreshCompetition,
    refreshRegistration
  } = useClimberCompetition()
  const { results, climberSearchLoading, searchClimbers, getDependents, clearSearch } = useClimberLookup()

  const activeCompetition = (detailedCompetition ?? competition) as CompetitionEntity
  const heats = activeCompetition?.heats ?? []
  const availableGroups = activeCompetition?.selectedGroups ?? []
  const divisions = getSummaryDivisions(activeCompetition)
  const availableDivisions = divisions.length > 0 ? divisions : [...DIVISION_OPTIONS]
  const isYouthGroup = (group: string) => group.includes('YOUTH') || group.includes('JUNIOR')

  const getTargetClimber = () => {
    if (mode === 'climber') {
      if (climberDependents?.length && selectedClimberId) {
        return climberDependents.find(c => c.id === selectedClimberId) ?? null
      }
      return climber ?? null
    }

    if (!selectedClimber) return null
    if (dependents?.length && selectedClimberId) {
      return dependents.find(c => c.id === selectedClimberId) ?? null
    }
    return selectedClimber
  }

  const targetClimber = getTargetClimber()
  const climberDependentOptions = dependentOnly ? (climberDependents ?? []) : (climberDependents ?? [])

  const defaultKeyForGroupName = (groupName: string): DefaultCompetitorGroup | null => {
    if ((DEFAULT_COMPETITOR_GROUPS as readonly string[]).includes(groupName)) {
      return groupName as DefaultCompetitorGroup
    }

    return (Object.entries(DefaultCompetitorGroupMap) as Array<[DefaultCompetitorGroup, string]>)
      .find(([, label]) => label === groupName)?.[0] ?? null
  }

  const heatHasGroup = (heat: any, groupName: string): boolean => {
    const defaultKey = defaultKeyForGroupName(groupName)
    if (defaultKey && heatSupportsGroup(heat, defaultKey)) return true
    return (heat.groups ?? []).some((group: any) => group?.name === groupName)
  }

  const heatAllowsDivision = (heat: any, division: Division): boolean => {
    if (!heat?.divisionsEnabled) return true
    const heatDivisions = Array.isArray(heat?.divisions) ? heat.divisions : []
    if (heatDivisions.length === 0) return true
    return heatDivisions.includes(division)
  }

  const matchingHeatsFor = (group: string, division?: Division | null) => {
    return heats.filter((heat: any) => {
      if (!heatHasGroup(heat, group)) return false
      if (!division) return true
      return heatAllowsDivision(heat, division)
    })
  }

  const hasEligibleHeatForGroup = (group: string) => {
    if (availableDivisions.length === 0) {
      return matchingHeatsFor(group).length > 0
    }
    return availableDivisions.some(d => matchingHeatsFor(group, d).length > 0)
  }

  const isEligibleForResolvedGroup = (dob: string, group: { name: string; ageRule?: any }) => {
    if (group.ageRule) {
      const age = differenceInYears(new Date(), new Date(dob))
      if (group.ageRule.min != null && age < group.ageRule.min) return false
      if (group.ageRule.max != null && age > group.ageRule.max) return false
      return true
    }

    const defaultKey = defaultKeyForGroupName(group.name)
    return defaultKey ? isEligibleForGroup(dob, defaultKey) : true
  }

  const priceForGroup = (groupName: string) => {
    if (activeCompetition.pricingType === 'FLAT') return activeCompetition.flatFee
    if (activeCompetition.pricingType !== 'BY_GROUP') return undefined

    return activeCompetition.pricingRules
      ?.filter(rule => rule.ruleType === 'GROUP')
      .find(rule => (rule.groups ?? []).some(group => group.name === groupName))
      ?.amount
  }

  const groupOptions = availableGroups.map(group => {
    const ageEligible = targetClimber ? isEligibleForResolvedGroup(targetClimber.dob, group) : true
    const hasHeat = heats.length > 0 ? hasEligibleHeatForGroup(group.name) : true
    const price = priceForGroup(group.name)
    return {
      value: group.name,
      label: price ? `${group.name} $${price}` : group.name,
      disabled: !ageEligible || !hasHeat
    }
  })
  const validGroupOptions = groupOptions.filter(option => !option.disabled)
  const visibleGroupOptions = mode === 'gym' && !targetClimber ? [] : validGroupOptions

  const selectedGroupHeats = selectedGroup ? matchingHeatsFor(selectedGroup, selectedDivision) : []
  const divisionOptions = availableDivisions.map(d => {
    const hasHeat = selectedGroup
      ? matchingHeatsFor(selectedGroup, d).length > 0
      : true
    return {
      value: d,
      label: DivisionEnumMap[d as keyof typeof DivisionEnumMap],
      disabled: !hasHeat
    }
  })
  const validDivisionOptions = divisionOptions.filter(option => !option.disabled)

  useEffect(() => {
    if (!selectedGroup) return
    const selectedGroupOption = groupOptions.find(o => o.value === selectedGroup)
    if (selectedGroupOption?.disabled) {
      setSelectedGroup(null)
      setSelectedDivision(null)
    }
  }, [selectedGroup, targetClimber, heats.length])

  useEffect(() => {
    if (!selectedDivision || !selectedGroup) return
    const stillValid = matchingHeatsFor(selectedGroup, selectedDivision).length > 0
    if (!stillValid) {
      setSelectedDivision(null)
    }
  }, [selectedDivision, selectedGroup, heats.length])

  useEffect(() => {
    if (!open) return
    if (dependentOnly && mode === 'climber' && climberDependentOptions.length > 0 && selectedClimberId == null) {
      setSelectedClimberId(climberDependentOptions[0].id)
    }
    if (mode === 'gym' && !targetClimber) return
    if (selectedGroup !== null) return
    if (validGroupOptions.length !== 1) return

    setSelectedGroup(validGroupOptions[0].value)
  }, [open, mode, targetClimber, selectedGroup, validGroupOptions.length, dependentOnly, climberDependentOptions.length, selectedClimberId])

  useEffect(() => {
    if (!open) return
    if (!selectedGroup) return
    if (selectedDivision !== null) return
    if (validDivisionOptions.length !== 1) return

    setSelectedDivision(validDivisionOptions[0].value as Division)
  }, [open, selectedGroup, selectedDivision, validDivisionOptions.length])

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
      if (mode === 'gym' && !selectedClimber) {
        setError('Please select a climber from search results.')
        return
      }

      if (!selectedGroup || !selectedDivision || !targetClimber) {
        setError('Please complete all required fields.')
        return
      }

      const selectedGroupData = availableGroups.find(group => group.name === selectedGroup)
      const isAgeEligible = selectedGroupData
        ? isEligibleForResolvedGroup(targetClimber.dob, selectedGroupData)
        : true
      if (!isAgeEligible && isYouthGroup(selectedGroup)) {
        setError("This climber must be within this group's age range.")
        return
      } else if (!isAgeEligible) {
        setError('This climber must be at least 19 years old to compete in this group.')
        return
      }

      if (matchingHeatsFor(selectedGroup, selectedDivision).length === 0) {
        setError('No valid heat is available for this group/division selection.')
        return
      }

      const chosenHeat = matchingHeatsFor(selectedGroup, selectedDivision)[0]
      if (!chosenHeat) {
        setError('No valid heat is available for this group/division selection.')
        return
      }

      const payload: CompRegistrationRequestDto = {
        id: targetClimber.id,
        climberName: targetClimber.name,
        email: (targetClimber as any).email ?? selectedClimber?.email ?? "",
        dob: targetClimber.dob,
        competitorGroup: {
          id: availableGroups.find(group => group.name === selectedGroup)?.id ?? null,
          name: selectedGroup,
          ageRule: availableGroups.find(group => group.name === selectedGroup)?.ageRule ?? null,
        } as any,
        division: selectedDivision,
        heat: chosenHeat as any,
        paid: false
      }

      if (mode === 'gym') {
        await updateGymRegistration(competition.id, payload)
      } else {
        const savedRegistration = await updateMyRegistrationForComp(competition.id, payload)
        if (savedRegistration?.id) {
          const currentUrl = window.location.href.split('?')[0]
          const session = await createStripeCheckoutSession(
            savedRegistration.id,
            `${currentUrl}?payment=success`,
            `${currentUrl}?payment=cancel`
          )
          if (session.sessionUrl) {
            window.location.assign(session.sessionUrl)
            return
          }
        }
      }
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
    await refreshCompetition(competition.id)
    await refreshRegistration(competition.id)
  }

  useEffect(() => {
    if (open) refresh()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen) handleClose()
    }}>
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
                    disabled={climberSearchLoading}
                  >
                    <Search size={18} />
                    <span className="relative top-[1px]">{climberSearchLoading ? 'Searching...' : 'Search'}</span>
                  </Button>
                </div>

                {showResults && (
                  <SearchResults
                    mode="climber"
                    results={results}
                    selectedId={selectedClimber?.id ?? null}
                    onSelect={(id) => {
                      handleSelectClimber(id)
                      setShowResults(false)
                    }}
                    loading={climberSearchLoading}
                  />
                )}
              </div>

              {/* Selected climber info (persistent after dropdown closes) */}
              {selectedClimber && (
                <div className="grid grid-cols-[auto_auto_105px_70px] items-center gap-2 border border-green/20 bg-shadow rounded-md px-3 py-1 text-green shadow-md">
                  <span className="border-r border-green/20 font-semibold">{selectedClimber.name}</span>
                  <span className="border-r border-green/20 text-sm font-semibold">{selectedClimber.email}</span>
                  {selectedClimber.phone && (
                    <span className="border-r border-green/20 text-sm font-semibold">{formatPhoneNumber(selectedClimber.phone)}</span>
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
              dependents={climberDependentOptions}
              selectedClimberId={selectedClimberId}
              onChange={setSelectedClimberId}
              includeSelf={!dependentOnly}
            />
          )}

          {mode === 'climber' && targetClimber && (
            <div className="text-sm text-muted">
              Showing groups available to {targetClimber.name}.
            </div>
          )}

          {/* Group Selection */}
          <div>
            <label className="font-semibold">Competitor Group:</label>
            <div className="px-3 py-1 bg-shadow border border-green/20 rounded-md shadow-md">
              {mode === 'gym' && !targetClimber ? (
                <div className="text-sm text-muted">Choose a climber before selecting a group.</div>
              ) : visibleGroupOptions.length === 0 ? (
                <div className="text-sm text-muted">No eligible competitor groups are available for this climber.</div>
              ) : (
                <CustomRadioGroup
                  name="group"
                  options={visibleGroupOptions}
                  selected={selectedGroup}
                  onChange={setSelectedGroup}
                />
              )}
            </div>
          </div>

          {/* Division Selection */}
          {availableDivisions.length > 0 && (
            <div>
              <label className="font-semibold">Gender Division:</label>
              <div className="flex flex-wrap px-3 py-1 bg-shadow border border-green/20 rounded-md shadow-md">
                <CustomRadioGroup
                  name="division"
                  options={divisionOptions}
                  selected={selectedDivision}
                  onChange={setSelectedDivision}
                />
              </div>
            </div>
          )}

          {selectedGroup && selectedDivision && (
            <div className="border border-green/20 rounded-md bg-shadow px-3 py-2">
              <div className="font-semibold mb-1">Your Assigned Heat{selectedGroupHeats.length > 1 ? 's' : ''}:</div>
              {selectedGroupHeats.length === 0 ? (
                <div className="text-accent">No eligible heat found for this selection.</div>
              ) : (
                <div className="space-y-1">
                  {selectedGroupHeats.map((heat: any) => (
                    <div key={heat.id}>
                      <strong>{heat.heatName || 'Heat'}</strong>
                      {' • '}
                      {formatHeatTimeRange(heat.startTime, heat.duration, { showDate: true })}
                      {heat.capacity ? ` • Capacity ${heat.capacity}` : ''}
                    </div>
                  ))}
                </div>
              )}
              {detailedCompetition?.startDate && (
                <div className="text-sm opacity-80 mt-1">
                  Competition Start: {displayDateTime(detailedCompetition.startDate)}
                </div>
              )}
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
