interface Address {
  streetAddress: string;
  apartmentNumber?: string;
  city: string;
  state: string;
  zipCode: string;
}

interface AuthContextType {
  token: string | null
  login: (token: string) => void
  logout: () => void
  skipLogin: () => void
  guest: boolean
}

interface Climber {
  id: number
  name: string
  email: string
  gender: string
  dob: string // ISO format
}

interface ClimberContextType {
  climber: Climber | null
  setClimber: (climber: Climber | null) => void
}

interface Competition {
  id: number;
  gymId: number;
  name: string;
  date: string;
  types: string[];
  format: string;
  competitorGroups: string[];
  status: string;
  location: Address;
  hostGymName: string;
  registered?: boolean;
  registration: {
    gender: string
    competitorGroup: string
  }
}

interface GymSession {
  id: number
  gymName: string
  gymAddress: string
}

interface GymSessionContextType {
  gymSession: GymSession | null
  setGymSession: (session: GymSession | null) => void
}

interface Option {
  value: string
  label: string
}

type Registration = {
  climberName: string
  email: string
  gender: string
  competitorGroup: string
}