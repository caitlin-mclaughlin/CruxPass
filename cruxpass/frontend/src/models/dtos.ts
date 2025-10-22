import { CompetitionFormat, CompetitionStatus, CompetitionType, CompetitorGroup, Division, Gender } from "@/constants/enum";
import { Address, SubmittedRoute } from "./domain";

export type AuthRequestDto = {
  emailOrUsername: string
  password: string
};

export type ClimberResponseDto = {
  id: number
  name: string
  email: string
  phone: string
  username: string
  dob: string
  gender: Gender
  address: Address
  createdAt: string
  emergencyName: string
  emergencyPhone: string
}

export type CompetitionFormPayload = {
  name: string
  date: string
  duration: number
  deadline: string
  capacity: number
  types: CompetitionType[]
  compFormat: CompetitionFormat
  competitorGroups: CompetitorGroup[]
  divisions: Division[]
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
  id?: number
  climberName: string
  email: string
  dob: string
  competitorGroup: CompetitorGroup
  division: Division
  paid: boolean
};

export type CompRegistrationResponseDto = {
  id: number
  gymId: number
  compId: number
  climberName: string
  climberDob: string
  climberEmail: string
  competitorGroup: CompetitorGroup
  division: Division
  paid: boolean
}

export type CompetitionSummaryDto = {
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

export type DependentClimberDto = Pick<
  SimpleClimberDto,
  "id" | "name" | "dob" | "gender" | "emergencyName" | "emergencyPhone"
>

export type GroupLeaderboardUpdateDto = {
  competitionId: number
  group: CompetitorGroup
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

export type PublicRegistrationDto = {
  id: number;
  compId: number
  climberName: string
  climberDob: string
  competitorGroup: CompetitorGroup
  division: Division
}

export type PublicSeriesDto = {
  id: number
  name: string
  email: string
  description?: string
  startDate: string
  endDate: string
  deadline: string
  seriesStatus: CompetitionStatus
  registered?: boolean
  seriesRegistration: SeriesRegistrationDto
}

export type RankedSubmissionDto = {
  place: number
  climberName: string
  totalPoints: number
  totalAttempts: number
  competitorGroup: CompetitorGroup
  division: Division
};

export type RegisterRequestDto = {
  name: string
  username: string | null
  email: string
  phone?: string
  dob?: string | null
  gender?: Gender | null
  password: string
  address?: Address | null
  emergencyName?: string
  emergencyPhone?: string
};

export type RouteDto = {
  number: number
  pointValue: number
};

export type RouteResponseDto = {
  id: number
  number: number
  pointValue: number
};

export type SeriesDto = {
  id: number
  name: string
  email: string
  username: string
  description?: string
  startDate: string
  endDate: string
  deadline: string
  seriesStatus: CompetitionStatus
  createdAt: string
}

export type SeriesRegistrationDto = {
    seriesId: number
    climberId: number
    climberName: string
    birthYear: number
    division: Division
}

export type SeriesLeaderboardEntryDto = {
  climberId: number
  name: string
  group: string
  division: string
  totalSeriesPoints: number
  placementCounts: number[] // index 0 = 1st place count, etc.
  rawClimbingPoints: number
  totalAttempts: number
  competitionResults: {
    competitionId: number
    competitionName: string
    placement: number
    seriesPoints: number
  }[]
}

export type SimpleClimberDto = {
  id: number
  name: string
  email: string
  phone: string
  dob: string
  gender: Gender
  address: Address
  emergencyName: string
  emergencyPhone: string
}

export type SimpleRegistrationDto = {
  division: Division
  compGroup: CompetitorGroup
};

export type SubmittedRouteDto = {
  routeId: number
  attempts: number
  send: boolean
};

export type SubmittedRouteResponseDto = {
  routeId: number
  number: number
  pointValue: number
  attempts: number
  send: boolean
};

export type SubmissionRequestDto = {
  competitorGroup: CompetitorGroup
  division: Division
  routes: SubmittedRoute[]
};

export type SubmissionResponseDto = {
  submissionId: number
  competitionId: number
  climberId: number
  routes: SubmittedRouteDto[]
};
