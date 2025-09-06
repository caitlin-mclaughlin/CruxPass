import { AccountType, CompetitionFormat, CompetitionStatus, CompetitionType, CompetitorGroup, Gender } from "@/constants/enum";
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
  division: Gender
  dob: string
  address: Address
  createdAt: string
}

export interface CompetitionSummary {
  id: number;
  gymId: number;
  name: string;
  date: string;
  duration: number;
  deadline: string;
  capacity: number;
  types: CompetitionType[];
  compFormat: CompetitionFormat;
  competitorGroups: CompetitorGroup[];
  divisions: Gender[];
  divisionsEnabled?: boolean;
  compStatus: CompetitionStatus;
  location: Address;
  hostGymName: string;
  registered?: boolean;
  registration: {
    division: Gender
    competitorGroup: CompetitorGroup
  }
}

export interface CompetitionData {
  id: number
  name: string
  competitorGroups: CompetitorGroup[]
  divisions: Gender[]
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

export type RankedSubmission = {
  place: number
  climberName: string
  totalPoints: number
  totalAttempts: number
  competitorGroup: CompetitorGroup
  division: Gender
  movement?: "up" | "down" | "same";
};

export type Registration = {
  climberName: string
  climberDob: string
  division: Gender
  competitorGroup: CompetitorGroup
}

export type GymRegistration = {
  climberName: string
  climberDob: string
  climberEmail: string
  competitorGroup: CompetitorGroup
  division: Gender
  paid: boolean
}

export interface Route {
  id: number | null
  number: number
  pointValue: number
}

export interface Series {
  name: string
  description?: string
  startDate: string
  endDate: string
}

export interface SeriesRegistration {
    seriesId: number
    climberId: number
    group: CompetitorGroup
    division: Gender
}

export interface SubmittedRoute {
  routeId: number | null
  attempts: number
  send: boolean
}

/** Context Session Models **/
export interface AuthContextType {
  token: string | null
  accountType: AccountType | null,
  login: (credentials: AuthRequestDto) => void
  register: (type: AccountType, credentials: RegisterRequestDto) => void
  logout: () => void
  skipLogin: () => void
  guest: boolean
}
