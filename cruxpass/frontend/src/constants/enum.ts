// enum.ts

/** COMPETITION ENUMS **/
export const COMPETITION_TYPES = ['BOULDERING', 'SPORT_CLIMBING', 'SPEED_CLIMBING'] as const;
export const COMPETITION_FORMATS = ['MODIFIED_RED_POINT', 'JUDGED', 'OTHER'] as const;
export const COMPETITOR_GROUPS = [
  'REC', 'INTERMEDIATE', 'ADVANCED', 'OPEN', 'YOUTH_D',
  'YOUTH_C', 'YOUTH_B', 'YOUTH_A', 'JUNIOR'
] as const;

// Enum string mappings for API requests
export const CompetitionEnumMap = {
  BOULDERING: 'Bouldering',
  SPORT_CLIMBING: 'Sport Climbing',
  SPEED_CLIMBING: 'Speed Climbing',
  MODIFIED_RED_POINT: 'Modified Red Point',
  JUDGED: 'Judged',
  OTHER: 'Other',
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
export const DIVISION_OPTIONS = ['MALE', 'FEMALE', 'NONBINARY'] as const;
export const GENDER_OPTIONS = ['MALE', 'FEMALE', 'NONBINARY', 'PASS'] as const;
export type Division = typeof DIVISION_OPTIONS[number];
export type Gender = typeof GENDER_OPTIONS[number];

export const DivisionEnumMap = {
  MALE: 'Men',
  FEMALE: 'Women',
  NONBINARY: 'Non-Binary'
} as const;

export const GenderEnumMap = {
  MALE: 'Male',
  FEMALE: 'Female',
  NONBINARY: 'Non-Binary',
  PASS: 'Prefer not to answer'
} as const;

/** COMPETITOR GROUP - DIVISION KEY **/
export type GroupDivisionKey = `${CompetitorGroup}-${Division}`

/** ACCOUNT TYPES **/
export enum AccountType {
  CLIMBER = "CLIMBER",
  GYM = "GYM",
  SERIES = "SERIES"
}

export const AccountTypeDisplay: Record<AccountType, string> = {
  [AccountType.CLIMBER]: "Climber",
  [AccountType.GYM]: "Gym",
  [AccountType.SERIES]: "Series Organizer"
}

export const accountTypeOptions = Object.values(AccountType).map((role) => ({
  value: role,
  label: AccountTypeDisplay[role],
}));

/** SEARCH TYPES **/
export enum SearchType {
  EMAIL = "Email",
  PHONE = "Phone",
  NAME = "Name"
}

export const SearchTypeDisplay: Record<SearchType, string> = {
  [SearchType.EMAIL]: "Email",
  [SearchType.PHONE]: "Phone",
  [SearchType.NAME]: "Name"
}

export const searchTypeOptions = Object.values(SearchType).map((role) => ({
  value: role,
  label: SearchTypeDisplay[role],
}));

