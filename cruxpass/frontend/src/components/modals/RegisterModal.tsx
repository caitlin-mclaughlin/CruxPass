// components/RegisterModal.tsx
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CompRegistrationRequestDto } from '@/models/dtos'
import { useClimberSession } from '@/context/ClimberSessionContext'
import { isEligibleForGroup } from '@/utils/ageEligibility'
import {
  CompetitionEnumMap,
  COMPETITOR_GROUPS,
  CompetitorGroup,
  Gender,
  GENDER_OPTIONS,
  GenderEnumMap
} from '@/constants/enum'
import CustomRadioGroup from '@/components/ui/CustomRadioGroup'
import { Button } from '@/components/ui/button'
import { CompetitionSummary, Registration } from '@/models/domain'
import { useCompetition } from '@/context/GymCompetitionContext'

interface Props {
  open: boolean
  onClose: () => void
  competition: CompetitionSummary
  onSuccess: (registration: Registration) => void
}

export default function RegisterModal({ open, onClose, competition, onSuccess }: Props) {
  const [selectedGroup, setSelectedGroup] = useState<CompetitorGroup | null>(null)
  const [selectedDivision, setSelectedDivision] = useState<Gender | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { climber } = useClimberSession()
  const { registerClimber } = useCompetition()

  const divisions = competition.divisions || []

  // Groups available
  const sortedGroups = COMPETITOR_GROUPS.filter(group => competition.competitorGroups.includes(group))

  const isYouthGroup = (group: string) => group.includes('YOUTH') || group.includes('JUNIOR')

  const handleSubmit = async () => {
    if (!selectedGroup || !climber || !selectedDivision) {
      setError('Please select both a competitor group and division.')
      return
    }

    const groupEnum = selectedGroup as CompetitorGroup
    const genderEnum = selectedDivision as Gender

    const isAgeEligible = isEligibleForGroup(climber.dob, groupEnum)

    if (!isAgeEligible && isYouthGroup(selectedGroup)) {
      setError('You must be within this group\'s defined age range.')
      return
    } else if (!isAgeEligible) {
      setError('You must be at least 18 years old to compete in this group.')
      return
    }

    const payload: CompRegistrationRequestDto = {
      id: climber.id,
      climberName: climber.name,
      email: climber.email,
      dob: climber.dob,
      competitorGroup: groupEnum,
      division: genderEnum,
      paid: true
    }

    try {
      const res = await registerClimber(competition.gymId, competition.id, payload)
      onSuccess(res as Registration)
      handleClose()
    } catch (err) {
      console.error(err)
      setError('Registration failed. You may already be registered.')
    }
  }

  const handleClose = () => {
    setError(null)
    setSelectedGroup(null)
    setSelectedDivision(climber?.division || null)
    onClose()
  }

  const handleGroupChange = (value: CompetitorGroup) => {
    setSelectedGroup(value)
    setError(null)
  }

  const handleGenderChange = (division: Gender) => {
    setSelectedDivision(division)
    setError(null)
  }

  useEffect(() => {
    if (open && climber?.division) {
      setSelectedDivision(climber.division)
    }
  }, [open, climber])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Register for {competition.name}</DialogTitle>
          <DialogDescription>Fill out your information for this competition.</DialogDescription>
        </DialogHeader>

          <div>
            <label className="font-semibold">Competitor Group:</label>
            <div className="px-3 py-1 bg-shadow border border-green rounded-md shadow">
              <CustomRadioGroup
                name="group"
                options={sortedGroups.map(group => ({
                  value: group,
                  label: CompetitionEnumMap[group as keyof typeof CompetitionEnumMap]
                }))}
                selected={selectedGroup}
                onChange={handleGroupChange}
              />
            </div>
          </div>
 
          {competition.divisions && (
            <div>          
              <label className="font-semibold">Gender Division:</label>
              <div className="flex flex-wrap px-3 py-1 bg-shadow border border-green rounded-md shadow">
                <CustomRadioGroup
                  name="division"
                  options={GENDER_OPTIONS.map(g => ({
                    value: g,
                    label: GenderEnumMap[g as keyof typeof GenderEnumMap]
                  }))}
                  selected={selectedDivision}
                  onChange={handleGenderChange}
                />
              </div>
            </div>
          )}

          {error && <div className="text-accent mt-2">{error}</div>}

          <Button onClick={handleSubmit} className="w-full">
            Register For {competition.name}
          </Button>

      </DialogContent>
    </Dialog>

  )
}
