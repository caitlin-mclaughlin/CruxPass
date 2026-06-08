// utils/ageEligibility.ts
import { differenceInYears } from 'date-fns'
import { DefaultCompetitorGroup } from '@/constants/enum'

export function isEligibleForGroup(dob: string, group: DefaultCompetitorGroup): boolean {
  const age = differenceInYears(new Date(), new Date(dob))
  switch (group) {
    case 'JUNIOR': return age >= 18 && age <= 19
    case 'YOUTH_A': return age >= 16 && age <= 17
    case 'YOUTH_B': return age >= 14 && age <= 15
    case 'YOUTH_C': return age >= 12 && age <= 13
    case 'YOUTH_D': return age <= 11
    default: return true
  }
}
