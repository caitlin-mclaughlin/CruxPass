// enum.ts

import { AgeRule } from "@/models/domain";

/** AGE RULE TYPE ENUMS **/
export type AgeRuleType = 'AGE' | 'BIRTHYEAR';

/** COMPETITION ENUMS **/
export type CompetitionStatus = 'UPCOMING' | 'LIVE' | 'FINISHED';

/** COMPETITION TYPES **/
export const COMPETITION_TYPES = ['BOULDERING', 'SPORT_CLIMBING', 'SPEED_CLIMBING'] as const;

// Enum string mappings for API requests
export const CompetitionTypeMap = {
  BOULDERING: 'Bouldering',
  SPORT_CLIMBING: 'Sport Climbing',
  SPEED_CLIMBING: 'Speed Climbing',  
} as const;

export type CompetitionType = typeof COMPETITION_TYPES[number];

/** COMPETITION FORMATS **/
export const COMPETITION_FORMATS = ['CLASSIC_REDPOINT', 'MODIFIED_REDPOINT', 'JUDGED', 'OTHER'] as const;

export const CompetitionFormatMap = {
  MODIFIED_REDPOINT: 'Modified Redpoint',
  CLASSIC_REDPOINT: 'Classic Redpoint',
  JUDGED: 'Judged',
  OTHER: 'Other',
} as const;

export type CompetitionFormat = typeof COMPETITION_FORMATS[number];

/** DEFAULT COMPETITOR GROUPS **/
export const DEFAULT_COMPETITOR_GROUPS = [
  'REC', 'INTERMEDIATE', 'ADVANCED', 'OPEN', 'YOUTH_D',
  'YOUTH_C', 'YOUTH_B', 'YOUTH_A', 'JUNIOR'
] as const;

export const DefaultCompetitorGroupMap = {
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

export type DefaultCompetitorGroup = typeof DEFAULT_COMPETITOR_GROUPS[number];

export const DefaultGroupMeta: Record<
  DefaultCompetitorGroup,
  {
    label: string;
    ageRule?: AgeRule;
  }
> = {
  REC: { label: 'Rec' },
  INTERMEDIATE: { label: 'Intermediate' },
  ADVANCED: { label: 'Advanced' },
  OPEN: { label: 'Open' },
  YOUTH_D: { label: 'Ages: 11 and Under', ageRule: { type: 'AGE', max: 11 } },
  YOUTH_C: { label: 'Ages: 12-13', ageRule: { type: 'AGE', min: 12, max: 13 } },
  YOUTH_B: { label: 'Ages: 14-15', ageRule: { type: 'AGE', min: 14, max: 15 } },
  YOUTH_A: { label: 'Ages: 16-17', ageRule: { type: 'AGE', min: 16, max: 17 } },
  JUNIOR: { label: 'Ages: 18-19', ageRule: { type: 'AGE', min: 18, max: 19 } },
};

const DefaultGroupLabelToKeyMap: Record<string, DefaultCompetitorGroup> =
  Object.entries(DefaultGroupMeta).reduce(
    (acc, [key, meta]) => {
      acc[meta.label] = key as DefaultCompetitorGroup;
      return acc;
    },
    {} as Record<string, DefaultCompetitorGroup>
  );

export function labelToDefaultKey(
  label: string
): DefaultCompetitorGroup {
  const key = DefaultGroupLabelToKeyMap[label];
  if (!key) {
    throw new Error(`Unknown default competitor group label: ${label}`);
  }
  return key;
}

export enum ActionOptions {
  CREATE = 'CREATE', 
  UPDATE = 'UPDATE', 
  DELETE = 'DELETE'
};

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
export type GroupDivisionKey = `${DefaultCompetitorGroup}-${Division}`

/** ROUTE GRADES **/
export const BOULDER_GRADE = [
    'UNGRADED', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17'
] as const;

export type BoulderGrade = typeof BOULDER_GRADE[number];

export const BoulderGradeMap: Record<BoulderGrade, string> = {
  UNGRADED: '--',
  V0: 'V0',
  V1: 'V1',
  V2: 'V2',
  V3: 'V3',
  V4: 'V4',
  V5: 'V5',
  V6: 'V6',
  V7: 'V7',
  V8: 'V8',
  V9: 'V9',
  V10: 'V10',
  V11: 'V11',
  V12: 'V12',
  V13: 'V13',
  V14: 'V14',
  V15: 'V15',
  V16: 'V16',
  V17: 'V17',
};

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
  NAME = "Name",
  EMAIL = "Email",
  PHONE = "Phone"
}

export const SearchTypeDisplay: Record<SearchType, string> = {
  [SearchType.NAME]: "Name",
  [SearchType.EMAIL]: "Email",
  [SearchType.PHONE]: "Phone"
}

export const searchTypeOptions = Object.values(SearchType).map((role) => ({
  value: role,
  label: SearchTypeDisplay[role],
}));

/** US STATES **/
export const US_STATES = [
  "UNSET","AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
] as const;

export type USState = typeof US_STATES[number];

export const USStateDisplay: Record<USState, string> = {
  UNSET: "-- Select State --",
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};
