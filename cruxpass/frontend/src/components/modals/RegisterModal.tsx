// components/RegisterModal.tsx
import { useEffect, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { CompRegistrationRequestDto } from '@/types/dto'
import { useClimber } from '@/context/ClimberContext'
import { isEligibleForGroup } from '@/utils/ageEligibility'
import { CompetitionEnumMap, COMPETITOR_GROUPS, CompetitorGroup, Gender, GENDER_OPTIONS, GenderEnumMap, } from '@/constants/enum'
import api from '@/services/api'
import CustomRadioGroup from '@/components/ui/CustomRadioGroup'

interface Props {
  open: boolean
  onClose: () => void
  competition: Competition
  onSuccess: (registration: any) => void
}

export default function RegisterModal({ open, onClose, competition, onSuccess }: Props) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedGender, setSelectedGender] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { climber } = useClimber()

  const sortedGroups = COMPETITOR_GROUPS.filter(group => competition.competitorGroups.includes(group))
  const isYouthGroup = (group: string) => group.includes('YOUTH') || group.includes('JUNIOR')

  const handleSubmit = async () => {
    if (!selectedGroup || !climber) return

    const groupEnum = selectedGroup as CompetitorGroup
    const genderEnum = selectedGender as Gender;
    const isAgeEligible = isEligibleForGroup(climber.dob, groupEnum)

    if (!isAgeEligible && isYouthGroup(selectedGroup)) {
      setError('You must be within this group\'s defined age range.')
      return
    } else if (!isAgeEligible) {
      setError('You must be at least 18 years old to compete in this group.')
      return
    }

    if (!selectedGender) {
      setError('Please select a gender group to compete in.')
      return
    }

    const payload: CompRegistrationRequestDto = {
      id: climber.id,
      climberName: climber.name,
      email: climber.email,
      dob: climber.dob,
      competitorGroup: groupEnum,
      gender: genderEnum,
      paid: true
    }

    try {
      await api.post(`/gyms/${competition.gymId}/competitions/${competition.id}/registrations`, payload)
      onSuccess({
        gender: selectedGender!,
        competitorGroup: selectedGroup as CompetitorGroup
      })
      handleClose()
    } catch (err) {
      console.error(err)
      setError('Registration failed. You may already be registered.')
    }
  }

  useEffect(() => {
    if (open) {
      setError(null)
      setSelectedGroup(null)
      setSelectedGender(null)
      if (climber?.gender) {
        setSelectedGender(climber.gender)
      }
    }
  }, [open, climber])

  const handleClose = () => {
    setError(null)
    setSelectedGroup(null)
    setSelectedGender(null)
    onClose()
  }

  const handleGroupChange = (value: string) => {
    setSelectedGroup(value)
    setError(null)
  }

  const handleGenderChange = (gender: string) => {
    setSelectedGender(gender)
    setError(null)
  }

  useEffect(() => {
    if (climber?.gender) {
      setSelectedGender(climber.gender)
    }
  }, [climber])

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50 bg-background">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-background p-6 rounded-md shadow-xl w-96">
          <Dialog.Title className="text-xl text-green font-bold mb-4">Register for {competition.name}</Dialog.Title>

          <CustomRadioGroup
            label="Choose a competitor group:"
            name="group"
            options={sortedGroups.map(group => ({
              value: group,
              label: CompetitionEnumMap[group as keyof typeof CompetitionEnumMap]
            }))}
            selected={selectedGroup}
            onChange={handleGroupChange}
          />

          <CustomRadioGroup
            label="Which gender group will you compete in?"
            name="gender"
            options={GENDER_OPTIONS.map(g => ({ 
              value: g, 
              label: GenderEnumMap[g as keyof typeof GenderEnumMap] 
            }))}
            selected={selectedGender}
            onChange={handleGenderChange}
          />

          {error && <div className="text-accent mt-2">{error}</div>}

          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={handleClose} className="bg-accent text-background font-semibold px-4 py-2 rounded-md shadow hover:bg-accentHighlight">Cancel</button>
            <button onClick={handleSubmit} className="bg-green text-background font-semibold px-4 py-2 rounded-md shadow hover:bg-select">Submit</button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
