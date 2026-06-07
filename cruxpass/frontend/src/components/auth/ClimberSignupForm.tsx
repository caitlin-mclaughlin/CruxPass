import { EnumSelect } from "@/components/ui/EnumSelect";
import { Input } from "@/components/ui/Input";
import SegmentedDateInput from "@/components/ui/SegmentedDateInput";
import CustomRadioGroup from "@/components/ui/CustomRadioGroup";
import { GenderEnumMap, GENDER_OPTIONS, US_STATES, USState, USStateDisplay } from "@/constants/enum";
import { AccountCredentialsFields } from "./AccountCredentialsFields";
import { AuthFormChangeHandler, AuthFormSetter, LoginFormData } from "./types";

type ClimberSignupFormProps = {
  formData: LoginFormData;
  setFormData: AuthFormSetter;
  onChange: AuthFormChangeHandler;
  clearInvalidField: (field: string) => void;
};

export function ClimberSignupForm({ formData, setFormData, onChange, clearInvalidField }: ClimberSignupFormProps) {
  return (
    <div className="space-y-4">
      <AccountCredentialsFields
        formData={formData}
        setFormData={setFormData}
        onChange={onChange}
        namePlaceholder="Full Name"
      />

      <div className="flex flex-col">
        <label htmlFor="dob" className="mb-1 font-medium text-green">Date of Birth</label>
        <div className="w-full bg-shadow rounded-md">
          <SegmentedDateInput
            mode="birthday"
            value={formData.dob}
            onChange={(date) => {
              setFormData(prev => ({ ...prev, dob: date }));
              if (date) clearInvalidField("dob");
            }}
          />
        </div>

        <label htmlFor="gender" className="mt-3 mb-1 font-medium text-green">Gender (For Competition Divisions)</label>
        <div className="px-3 py-1 bg-shadow border border-green/20 rounded-md shadow-lg">
          <CustomRadioGroup
            name="gender"
            options={GENDER_OPTIONS.map(g => ({
              value: g,
              label: GenderEnumMap[g as keyof typeof GenderEnumMap],
            }))}
            selected={formData.gender}
            onChange={(gender: string) => {
              setFormData(prev => ({ ...prev, gender: gender as LoginFormData["gender"] }));
              clearInvalidField("gender");
            }}
          />
        </div>

        <div className="space-y-3 mt-3">
          <label className="font-medium text-green">Location</label>
          <Input name="address.city" value={formData.address.city} onChange={onChange} placeholder="City" required />
          <div className="flex gap-3 justify-between">
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

        <div className="space-y-3 mt-3 mb-1">
          <label className="font-medium text-green">Emergency Contact</label>
          <Input name="emergencyName" value={formData.emergencyName} onChange={onChange} placeholder="Full Name (Emergency Contact)" required />
          <Input name="emergencyPhone" value={formData.emergencyPhone} onChange={onChange} placeholder="Phone Number (Emergency Contact)" required />
        </div>
      </div>
    </div>
  );
}

