
export type CompRegistrationRequestDto = {
  id?: number;
  climberName: string;
  email: string;
  dob: string; // ISO 8601 string format (e.g. "2000-01-01")
  competitorGroup: String;
  gender: String;
  paid: boolean;
};

export type SimpleRegistrationDto = {
  gender: string;
  compGroup: string;
};

interface AddressDto {
  streetAddress: string
  apartmentNumber?: string | null
  city: string
  state: string
  zipCode: string
}

export type CompetitionFormPayload = {
  name: string
  date: string
  deadline: string
  capacity: number
  types: string[]
  format: string
  competitorGroups: string[]
  divisions: string[]
  status: string
  location: {
    streetAddress: string
    apartmentNumber: string | null
    city: string
    state: string
    zipCode: string
  }
}
