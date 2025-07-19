// utils/ageEligibility.ts
import { differenceInYears } from 'date-fns'
import { CompetitorGroup } from '@/constants/enum'

export function isEligibleForGroup(dob: string, group: CompetitorGroup): boolean {
  const age = differenceInYears(new Date(), new Date(dob))
  switch (group) {
    case 'JUNIOR': return age <= 19
    case 'YOUTH_A': return age <= 17
    case 'YOUTH_B': return age <= 15
    case 'YOUTH_C': return age <= 13
    case 'YOUTH_D': return age <= 11
    default: return age >= 18
  }
}
