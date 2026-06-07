import { AccountType, Gender, USState } from "@/constants/enum";

export type LoginFormData = {
  accountType: AccountType;
  name: string;
  email: string;
  username: string;
  phone: string;
  dob: Date | null;
  gender: Gender | null;
  password: string;
  confirmPassword: string;
  emailOrUsername: string;
  address: {
    streetAddress: string;
    apartmentNumber: string;
    city: string;
    state: USState;
    zipCode: string;
  };
  emergencyName: string;
  emergencyPhone: string;
  seriesDescription: string;
  seriesStartDate: Date | null;
  seriesEndDate: Date | null;
  seriesDeadline: Date | null;
};

export type AuthFormChangeHandler = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => void;

export type AuthFormSetter = React.Dispatch<React.SetStateAction<LoginFormData>>;

