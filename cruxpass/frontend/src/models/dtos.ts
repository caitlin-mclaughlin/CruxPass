import { CompetitionFormat, CompetitionStatus, CompetitionType, CompetitorGroup, Gender } from "@/constants/enum";
import { Address, SubmittedRoute } from "./domain";

export type AuthRequestDto = {
  emailOrUsername: string;
  password: string;
};

export type CompetitionFormPayload = {
  name: string
  date: string
  duration: number
  deadline: string
  capacity: number
  types: CompetitionType[]
  compFormat: CompetitionFormat
  competitorGroups: CompetitorGroup[]
  divisions: Gender[]
  compStatus: CompetitionStatus
  location: {
    streetAddress: string
    apartmentNumber: string | null
    city: string
    state: string
    zipCode: string
  }
};

export type CompRegistrationRequestDto = {
  id?: number;
  climberName: string;
  email: string;
  dob: string;
  competitorGroup: CompetitorGroup;
  division: Gender;
  paid: boolean;
};

export type GymResponseDto = {
  id: number
  name: string
  email: string
  phone: string
  username: string
  address: Address
  createdAt: string
}

export type RankedSubmissionDto = {
  place: number;
  name: string;
  totalPoints: number;
  points: number[];
  attempts: number[];
  competitorGroup: CompetitorGroup;
  division: Gender;
};

export type RegisterRequestDto = {
  name: string;
  username: string | null;
  email: string;
  phone: string;
  dob: string | null;
  division: Gender | null;
  password: string;
  address: Address;
};

export type RegistrationResponseDto = {
  id: number;
  ymId: number;
  compId: number;
  competitorGroup: CompetitorGroup;
  division: Gender;
  climberName: string;
  email: string;
  paid: boolean;
}

export type RouteDto = {
  number: number,
  pointValue: number
};

export type RouteResponseDto = {
  id: number,
  number: number,
  pointValue: number
};

export type SimpleRegistrationDto = {
  division: Gender;
  compGroup: CompetitorGroup;
};

export type SubmittedRouteDto = {
  routeId: number,
  attempts: number,
  send: boolean
};

export type SubmittedRouteResponseDto = {
  routeId: number,
  number: number,
  pointValue: number,
  attempts: number,
  send: boolean
};

export type SubmissionRequestDto = {
  competitorGroup: CompetitorGroup
  division: Gender
  routes: SubmittedRoute[]
};

export type SubmissionResponseDto = {
  submissionId: number,
  competitionId: number,
  climberId: number,
  routes: SubmittedRouteDto[]
};
