// enum.ts

import { RankedSubmissionDto } from "@/models/dtos";

/** COMPETITION ENUMS **/
export const COMPETITION_TYPES = ['BOULDERING', 'SPORT_CLIMBING', 'SPEED_CLIMBING'] as const;
export const COMPETITION_FORMATS = ['RED_POINT', 'MODIFIED_RED_POINT', 'ON_SIGHT', 'FLASH'] as const;
export const COMPETITOR_GROUPS = [
  'REC', 'INTERMEDIATE', 'ADVANCED', 'OPEN', 'YOUTH_D',
  'YOUTH_C', 'YOUTH_B', 'YOUTH_A', 'JUNIOR'
] as const;

// Enum string mappings for API requests
export const CompetitionEnumMap = {
  BOULDERING: 'Bouldering',
  SPORT_CLIMBING: 'Sport Climbing',
  SPEED_CLIMBING: 'Speed Climbing',
  RED_POINT: 'Red Point',
  MODIFIED_RED_POINT: 'Modified Red Point',
  ON_SIGHT: 'On Sight',
  FLASH: 'Flash',
  REC: 'Rec',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  OPEN: 'Open',
  YOUTH_D: 'Ages: 11 and Under',
  YOUTH_C: 'Ages: 12-13',
  YOUTH_B: 'Ages: 14-15',
  YOUTH_A: 'Ages: 16-17',
  JUNIOR: 'Ages: 18-19',
} as const;

export type CompetitionStatus = 'UPCOMING' | 'LIVE' | 'FINISHED';
export type CompetitionType = typeof COMPETITION_TYPES[number];
export type CompetitionFormat = typeof COMPETITION_FORMATS[number];
export type CompetitorGroup = typeof COMPETITOR_GROUPS[number];
export type CompetitionEnumKey = keyof typeof CompetitionEnumMap

export const CompetitionLabelMap = Object.fromEntries(
  Object.entries(CompetitionEnumMap).map(([label, value]) => [value, label])
);

/** GENDER ENUMS **/
export const GENDER_OPTIONS = ['MALE', 'FEMALE', 'NONBINARY'] as const;
export type Gender = typeof GENDER_OPTIONS[number];

export const GenderEnumMap = {
  MALE: 'Men',
  FEMALE: 'Women',
  NONBINARY: 'Non-Binary',
} as const;

/** COMPETITOR GROUP - GENDER KEY **/
export type GroupGenderKey = `${CompetitorGroup}-${Gender}`

/** ACCOUNT TYPES **/
export enum AccountType {
  CLIMBER = "CLIMBER",
  GYM = "GYM"
}

export const AccountTypeDisplay: Record<AccountType, string> = {
  [AccountType.CLIMBER]: "Climber",
  [AccountType.GYM]: "Gym"
}

export const accountTypeOptions = Object.values(AccountType).map((role) => ({
  value: role,
  label: AccountTypeDisplay[role],
}));

