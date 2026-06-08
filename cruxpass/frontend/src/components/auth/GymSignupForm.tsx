import { EnumSelect } from "@/components/ui/EnumSelect";
import { Input } from "@/components/ui/Input";
import { US_STATES, USState, USStateDisplay } from "@/constants/enum";
import { AccountCredentialsFields } from "./AccountCredentialsFields";
import { AuthFormChangeHandler, AuthFormSetter, LoginFormData } from "./types";

type GymSignupFormProps = {
  formData: LoginFormData;
  setFormData: AuthFormSetter;
  onChange: AuthFormChangeHandler;
  clearInvalidField: (field: string) => void;
};

export function GymSignupForm({ formData, setFormData, onChange, clearInvalidField }: GymSignupFormProps) {
  return (
    <div className="space-y-4">
      <AccountCredentialsFields
        formData={formData}
        setFormData={setFormData}
        onChange={onChange}
        namePlaceholder="Gym Name"
      />

      <div className="space-y-3">
        <label htmlFor="address" className="font-medium text-green">Address</label>
        <Input name="address.streetAddress" value={formData.address.streetAddress} onChange={onChange} placeholder="Street Address" required />
        <Input name="address.apartmentNumber" value={formData.address.apartmentNumber} onChange={onChange} placeholder="Apartment (optional)" />
        <Input name="address.city" value={formData.address.city} onChange={onChange} placeholder="City" required />
        <EnumSelect
          labelMap={USStateDisplay}
          options={US_STATES}
          value={formData.address.state}
          onChange={(state: USState) => {
            setFormData(prev => ({
              ...prev,
              address: { ...prev.address, state },
            }));
            clearInvalidField("address.state");
          }}
        />
        <Input name="address.zipCode" value={formData.address.zipCode} onChange={onChange} placeholder="Zip Code" required />
      </div>
    </div>
  );
}

