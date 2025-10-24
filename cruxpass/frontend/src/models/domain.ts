import { AccountType, CompetitionFormat, CompetitionStatus, CompetitionType, CompetitorGroup, Division, Gender } from "@/constants/enum";
import { AuthRequestDto, RegisterRequestDto } from "./dtos";

export interface Address {
  streetAddress: string;
  apartmentNumber?: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface ClimberData {
  id: number
  name: string
  email: string
  phone: string
  username: string
  gender: Gender
  dob: string
  address: Address
  createdAt: string
  emergencyName: string
  emergencyPhone: string
}

export type DependentClimber = Pick<
  SimpleClimber,
  "id" | "name" | "dob" | "gender" | "emergencyName" | "emergencyPhone"
>

export interface CompetitionSummary {
  id: number
  gymId: number
  name: string
  date: string
  duration: number
  deadline: string
  capacity: number
  types: CompetitionType[]
  compFormat: CompetitionFormat
  competitorGroups: CompetitorGroup[]
  divisions: Division[]
  divisionsEnabled?: boolean
  compStatus: CompetitionStatus
  location: Address
  hostGymName: string
  registered?: boolean
  registration: {
    division: Division
    competitorGroup: CompetitorGroup
  }
}

export interface CompetitionData {
  id: number
  name: string
  competitorGroups: CompetitorGroup[]
  divisions: Division[]
}

export interface GymData {
  id: number
  name: string
  email: string
  phone: string
  username: string
  address: Address
  createdAt: string
}

export interface LiveScoreEvent {
  competitionId: number;
  climberId: number;
  climberName: string;
  competitorGroup: CompetitorGroup;
  division: Division;
  routeId: number;
  routeNumber: number;
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
  competitorGroup: CompetitorGroup;
  division: Division;
  movement?: "up" | "down" | "same";
}

export type Registration = {
  climberName: string;
  climberDob: string;
  division: Division;
  competitorGroup: CompetitorGroup;
}

export type GymRegistration = {
  climberName: string;
  climberDob: string;
  climberEmail: string;
  competitorGroup: CompetitorGroup;
  division: Division;
  paid: boolean;
}

export interface Route {
  id: number | null;
  number: number;
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

export interface SimpleClimber {
  id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: Gender;
  address: Address;
  emergencyName: string;
  emergencyPhone: string;
}

export interface SubmittedRoute {
  routeId: number | null
  attempts: number
  send: boolean
}
