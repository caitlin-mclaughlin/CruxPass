import { ActionOptions, AgeRuleType, BoulderGrade, CompetitionFormat, CompetitionStatus, CompetitionType, DefaultCompetitorGroup, Division, Gender, USState } from "@/constants/enum";
import { PricingRuleType, PricingType, ResolvedCompetitorGroup } from "./dtos";

export interface Address {
  streetAddress: string;
  apartmentNumber?: string;
  city: string;
  state: USState;
  zipCode: string;
}

export interface ClimberLocation {
  city: string;
  state: USState;
  zipCode: string;
}

/** COMPETITOR GROUPS **/
export interface AgeRule {
  id?: number
  type: AgeRuleType;
  min?: number;
  max?: number;
}

export interface CompetitorGroupData {
  id?: number;          // backend id (optional)
  clientId: string;     // frontend id (required)
  ownerId: number;
  name: string;
  constrained: boolean;
  ageRule?: AgeRule;
}

export type GroupRef =
  | { type: 'DEFAULT'; key: DefaultCompetitorGroup }
  | { type: 'CUSTOM'; clientId: string };
  
export type GroupMutationsData = {
  created: CompetitorGroupData[];
  updated: CompetitorGroupData[];
  deleted: string[];
}

export type GroupMutationAction = { 
  type: ActionOptions; 
  group: CompetitorGroupData;
}

/** COMPETITIONS **/
export type CompetitionDraftState = {
  id?: number;
  name: string;
  startDate:  Date | null;
  deadline: Date | null;
  types: CompetitionType[];
  compFormat: CompetitionFormat;
  pricingType: PricingType;
  flatFee: number | '';
  feeCurrency: string;
  pricingRules: PricingRuleDraft[];
  selectedGroups: GroupRef[];
  heats: HeatDraft[];
  hostGymName: string;
  location: Address;
}

export interface CompetitionEntity {
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
  pricingRules: PricingRuleData[];
  selectedGroups: ResolvedCompetitorGroup[];
  heats: HeatData[];
  compStatus: CompetitionStatus;
  hostGymName: string;
  location: Address;
}

export interface PricingRuleDraft {
  id?: number;
  clientId: string;
  name?: string;
  ruleType: PricingRuleType;
  groups: GroupRef[];
  minAge?: number;
  maxAge?: number;
  amount: number | '';
  priority: number | '';
}

export interface PricingRuleData {
  id: number;
  name?: string;
  ruleType: PricingRuleType;
  groups: ResolvedCompetitorGroup[];
  minAge?: number;
  maxAge?: number;
  amount: number;
  priority: number;
}

export interface SimpleCompetitionData {
  id: number;
  name: string;
  competitorGroups: ResolvedCompetitorGroup[];
  divisions: Division[];
}

/** HEATS **/
export interface HeatData {
  id: number;
  heatName?: string;
  startTime: string;
  capacity: number;
  duration: number;
  groups: ResolvedCompetitorGroup[];
  divisions: Division[];
  divisionsEnabled: boolean;
}

export interface HeatDraft {
  id?: number;
  clientId: string;
  heatName?: string;
  startTime: Date | null;
  capacity: number | '';
  duration: number | '';
  groups: GroupRef[];
  divisions: Division[];
  divisionsEnabled: boolean;
}

export interface ClimberData {
  id: number;
  name: string;
  email: string;
  phone: string;
  username: string;
  gender: Gender;
  dob: string;
  address: ClimberLocation;
  createdAt: string;
  emergencyName: string;
  emergencyPhone: string;
}

export type DependentClimber = Pick<
  ClimberData,
  "id" | "name" | "dob" | "gender" | "emergencyName" | "emergencyPhone"
>

export interface GymData {
  id: number;
  name: string;
  email: string;
  phone: string;
  username: string;
  address: Address;
  createdAt: string;
}

export interface LiveScoreEvent {
  competitionId: number;
  climberId: number;
  climberName: string;
  competitorGroup: ResolvedCompetitorGroup;
  division: Division;
  routeId: number;
  routeNumber: number;
  routeGrade: BoulderGrade;
  routePoints: number;
  attempts: number;
  totalPointsAfterUpdate: number;
  totalAttemptsAfterUpdate: number;
  timestamp: string;
}

export interface PublicSeries {
  id: number;
  name: string;
  email: string;
  description?: string;
  startDate: string;
  endDate: string;
  deadline: string;
  seriesStatus: CompetitionStatus;
  registered?: boolean;
  seriesRegistration: SeriesRegistration;
}

export type RankedSubmission = {
  place: number;
  climberName: string;
  totalPoints: number;
  totalAttempts: number;
  competitorGroup: ResolvedCompetitorGroup;
  division: Division;
  movement?: "up" | "down" | "same";
}

export type Registration = {
  climberName: string;
  climberDob: string;
  division: Division;
  competitorGroup: ResolvedCompetitorGroup;
  heat: HeatData;
  feeamount: number;
  feeCurrency: string;
}

export type GymRegistration = {
  climberName: string;
  climberDob: string;
  climberEmail: string;
  competitorGroup: ResolvedCompetitorGroup;
  division: Division;
  feeamount: number;
  feeCurrency: string;
  paid: boolean;
}

export interface Route {
  id: number | null;
  number: number;
  grade: BoulderGrade;
  pointValue: number;
}

export interface SeriesData {
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

export interface SeriesRegistration {
    seriesId: number;
    climberId: number;
    climberName: string;
    birthYear: number;
    division: Division;
}

export type SimpleClimber = Pick<
  ClimberData,
  "id" | "name" | "email" | "phone" | "dob" | "gender" | "address" | "emergencyName" | "emergencyPhone"
>

export type SimpleCompetition = Pick<
  CompetitionEntity,
  "id" | "gymId" | "name" | "startDate" | "hostGymName" | "compStatus"
>

export type SimpleGym = Pick<
  GymData,
  "id" | "name" | "email" | "phone" | "address"
>

export type SimpleSeries = Pick<
  SeriesData,
  "id" | "name" | "email" | "startDate" | "endDate" | "deadline"
>

export interface SubmittedRoute {
  routeId: number | null
  attempts: number
  send: boolean
}
