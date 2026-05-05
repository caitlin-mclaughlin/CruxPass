import { BoulderGrade, CompetitionFormat, CompetitionStatus, CompetitionType, DefaultCompetitorGroup, Division, Gender } from "@/constants/enum";
import { Address, AgeRule, ClimberLocation, GroupRef, SubmittedRoute } from "./domain";

export type AuthRequestDto = {
  emailOrUsername: string;
  password: string;
};

/** COMPETITOR GROUPS **/
export type CreateCompetitorGroupDto = {
  ownerId: number;
  clientId: string;
  name: string;
  constrained: boolean;
  ageRule?: AgeRule;
}

export type CompetitorGroupDto = {
  id: number;
  ownerId: number;
  name: string;
  constrained: boolean;
  ageRule?: AgeRule;
}

export type ResolvedCompetitorGroup = {
  id: number;
  name: string;
  ageRule: AgeRule;
}

export type CreatedGroupResult = {
  clientId: string;
  dbId: number;
}

export type GroupMutationsDto = {
  created: CreateCompetitorGroupDto[];
  updated: CompetitorGroupDto[];
  deleted: number[];
}

export type GroupRefDto =
  | { type: 'DEFAULT'; key: DefaultCompetitorGroup }
  | { type: 'CUSTOM'; id: number };


/** PRICING RULES **/
export type PricingType = 'FLAT' | 'BY_AGE' | 'BY_GROUP';
export type PricingRuleType = 'AGE' | 'GROUP';

export type PricingRuleUpsertDto = {
  id?: number;
  ruleType: PricingRuleType;
  groups: GroupRefDto[];
  minAge?: number;
  maxAge?: number;
  amount: number;
  priority?: number;
}

export type PricingRuleDto = {
  id: number;
  ruleType: PricingRuleType;
  groups: ResolvedCompetitorGroup[];
  minAge?: number;
  maxAge?: number;
  amount: number;
  priority: number;
}

/** COMPETITIONS **/
export interface CreateCompetitionDto {
  gymId: number;
  name: string;
  startDate: string;
  deadline: string;
  types: CompetitionType[];
  compFormat: CompetitionFormat;
  pricingType: PricingType;
  flatFee?: number;
  feeCurrency: string;
  pricingRules: PricingRuleUpsertDto[];
  selectedGroups: GroupRefDto[];
  heats: CreateHeatDto[];
  hostGymName: string;
  location: Address;
}

export interface UpdateCompetitionDto {
  id: number;
  gymId: number;
  name: string;
  startDate: string;
  deadline: string;
  types: CompetitionType[];
  compFormat: CompetitionFormat;
  pricingType: PricingType;
  flatFee?: number;
  feeCurrency: string;
  pricingRules: PricingRuleUpsertDto[];
  selectedGroups: GroupRefDto[];
  heats: CreateHeatDto[];
  hostGymName: string;
  location: Address;
}

export interface CompetitionDto {
  id: number;
  gymId: number;
  name: string;
  startDate: string;
  deadline: string;
  types: CompetitionType[];
  compFormat: CompetitionFormat;
  pricingType: PricingType;
  flatFee?: number;
  feeCurrency: string;
  pricingRules: PricingRuleDto[];
  selectedGroups: ResolvedCompetitorGroup[];
  heats: HeatDto[];
  compStatus: CompetitionStatus;
  hostGymName: string;
  location: Address;
}

/** HEATS **/
export interface CreateHeatDto {
  heatName?: string;
  startTime: string;
  capacity: number;
  duration: number;
  groups: GroupRefDto[];
  divisions: Division[];
  divisionsEnabled: boolean;
}

export interface HeatDto {
  id: number;
  heatName?: string;
  startTime: string;
  capacity: number;
  duration: number;
  groups: ResolvedCompetitorGroup[];
  divisions: Division[];
  divisionsEnabled: boolean;
}

export type ClimberResponseDto = {
  id: number;
  name: string;
  email: string;
  phone: string;
  username: string;
  dob: string;
  gender: Gender;
  address: ClimberLocation;
  createdAt: string;
  emergencyName: string;
  emergencyPhone: string;
}

export type CompRegistrationRequestDto = {
  id?: number;
  climberName: string;
  email: string;
  dob: string;
  competitorGroup: ResolvedCompetitorGroup;
  division: Division;
  heat: HeatDto;
  paid: boolean;
};

export type CompRegistrationResponseDto = {
  id: number;
  gymId: number;
  compId: number;
  climberName: string;
  climberDob: string;
  climberEmail: string;
  competitorGroup: ResolvedCompetitorGroup;
  division: Division;
  heat: HeatDto;
  feeamount: number;
  feeCurrency: string;
  paid: boolean;
}

export type DependentClimberDto = Pick<
  SimpleClimberDto,
  "id" | "name" | "dob" | "gender" | "emergencyName" | "emergencyPhone"
>

export type GroupLeaderboardUpdateDto = {
  competitionId: number
  group: ResolvedCompetitorGroup
  division: Division
  leaderboard: RankedSubmissionDto[]
}

export type GymResponseDto = {
  id: number
  name: string
  email: string
  phone: string
  username: string
  address: Address
  createdAt: string
}

export type LiveSubmissionEventDto = {
  competitionId: number;
  climberId: number;
  climberName: string;
  competitorGroup: ResolvedCompetitorGroup;
  division: Division;
  routeId: number;
  routeNumber: number;
  routePoints: number;
  attempts: number;
  send: boolean;
  totalPointsAfterUpdate: number;
  totalAttemptsAfterUpdate: number;
  timestamp: string;
};

export type PublicRegistrationDto = {
  id: number;
  compId: number;
  climberName: string;
  climberDob: string;
  competitorGroup: ResolvedCompetitorGroup;
  division: Division;
  heat: HeatDto;
  feeamount: number;
  feeCurrency: string;
}

export type PublicSeriesDto = {
  id: number;
  name: string;
  email: string;
  description?: string;
  startDate: string;
  endDate: string;
  deadline: string;
  seriesStatus: CompetitionStatus;
  registered?: boolean;
  seriesRegistration: SeriesRegistrationDto;
}

export type RankedSubmissionDto = {
  place: number;
  climberName: string;
  totalPoints: number;
  totalAttempts: number;
  competitorGroup: ResolvedCompetitorGroup;
  division: Division;
};

export type RegisterRequestDto = {
  name: string;
  username: string | null;
  email: string;
  phone?: string;
  dob?: string | null;
  gender?: Gender | null;
  password: string;
  address?: Address | ClimberLocation | null;
  emergencyName?: string;
  emergencyPhone?: string;
};

export type RouteDto = {
  number: number;
  grade: BoulderGrade;
  pointValue: number;
};

export type RouteResponseDto = {
  id: number;
  number: number;
  grade: BoulderGrade;
  pointValue: number;
};

export type SeriesDto = {
  id: number;
  name: string;
  email: string;
  username: string;
  description?: string;
  startDate: string;
  endDate: string;
  deadline: string;
  seriesStatus: CompetitionStatus;
  createdAt: string;
}

export type SeriesRegistrationDto = {
  seriesId: number;
  climberId: number;
  climberName: string;
  birthYear: number;
  division: Division;
}

export type SeriesLeaderboardEntryDto = {
  climberId: number;
  climberName: string;
  group: ResolvedCompetitorGroup;
  division: Division;
  totalSeriesPoints: number;
  placementCounts: number[]; // index 0 = 1st place count, etc.
  rawClimbingPoints: number;
  totalAttempts: number;
  rank: number;
  results: {
    competitionId: number;
    seriesId: number;
    placement: number;
    seriesPoints: number;
  }[]
}

export type SimpleClimberDto = {
  id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: Gender;
  address: ClimberLocation;
  emergencyName: string;
  emergencyPhone: string;
}

export type SimpleCompetitionDto = {
  id: number;
  gymId: number;
  name: string;
  startDate: string;
  hostGymName: string;
  compStatus: CompetitionStatus;
}

export type SimpleGymDto = {
  id: number;
  name: string;
  email: string
  phone: string;
  address: Address;
};

export type SimpleRegistrationDto = {
  division: Division;
  compGroup: ResolvedCompetitorGroup;
  heat: HeatDto;
};

export type SimpleSeriesDto = {
  id: number;
  name: string;
  email: string;
  startDate: string;
  endDate: string;
  deadline: string;
}

export type SubmittedRouteDto = {
  routeId: number;
  attempts: number;
  send: boolean;
};

export type SubmittedRouteResponseDto = {
  routeId: number;
  number: number;
  grade: BoulderGrade;
  pointValue: number;
  attempts: number;
  send: boolean;
};

export type SubmissionRequestDto = {
  routes: SubmittedRoute[];
};

export type SubmissionResponseDto = {
  submissionId: number;
  competitionId: number;
  climberId: number;
  routes: SubmittedRouteDto[];
};
