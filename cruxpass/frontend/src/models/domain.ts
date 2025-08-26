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
  division: Gender
  dob: string
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
  gymName: string
  gymAddress: string
}

export type Registration = {
  climberName: string
  email: string
  division: Gender
  competitorGroup: CompetitorGroup
}

export interface Route {
  id: number | null
  number: number
  pointValue: number
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
