import { ClimberData } from "@/models/domain";
import { Input } from "@/components/ui/Input";
import SegmentedDateInput from "@/components/ui/SegmentedDateInput";
import CustomRadioGroup from "@/components/ui/CustomRadioGroup";
import { formatPhoneNumber } from "@/utils/formatters";
import { formatDateFromString, makeDateChangeHandler } from "@/utils/datetime";
import { GENDER_OPTIONS, GenderEnumMap, US_STATES, USState, USStateDisplay } from "@/constants/enum";
import { RenderInput } from "@/utils/uiRendering";
import { EnumSelect } from "../ui/EnumSelect";

interface Props {
  formData: ClimberData;
  setFormData: React.Dispatch<React.SetStateAction<ClimberData>>;
  editing: boolean;
}

export default function ClimberProfileForm({ formData, setFormData, editing }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "city" || name === "state") {
      setFormData((prev) => prev && ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else {
      setFormData((prev) => prev && ({ ...prev, [name]: value }));
    }
  };
  
  return (
    <>
      <RenderInput
        label="Email:"
        name="email"
        value={formData.email}
        editing={editing}
        onChange={handleChange}
      />
      <RenderInput
        label="Phone:"
        name="phone"
        value={formatPhoneNumber(formData.phone ?? "")}
        editing={editing}
        onChange={handleChange}
      />
      <RenderInput
        label="Username:"
        name="username"
        value={formData.username}
        editing={editing}
        onChange={handleChange}
      />

      {/* DOB */}
      <div className="relative flex-col">
        <div className="font-medium font-semibold text-green">Date of Birth:</div>
        <div className="text-green">
          {editing ? (
            <div className="bg-background rounded-md">
              <SegmentedDateInput
                mode="birthday"
                value={formData.dob}
                onChange={makeDateChangeHandler<ClimberData>("dob", setFormData, "date")}
              />
            </div>
          ) : (
            formData.dob && formatDateFromString(formData.dob)
          )}
        </div>
      </div>

      {/* Gender */}
      <div className="relative flex-col">
        <div className="font-medium font-semibold text-green">Gender (Division):</div>
        <div className="text-green">
          {editing ? (
            <CustomRadioGroup
              name="division"
              options={GENDER_OPTIONS.map(g => ({ 
                value: g, 
                label: GenderEnumMap[g as keyof typeof GenderEnumMap] 
              }))}
              selected={formData.gender}
              onChange={(g: string) => {
                setFormData((prev: any) => ({ 
                  ...prev, 
                  division: g
                }))
              }}
            />
          ) : (
            GenderEnumMap[formData.gender as keyof typeof GenderEnumMap]
          )}
        </div>
      </div>

      {/* Location */}
      <div className="relative flex-col">
        <div className="font-medium font-semibold text-green">City & State:</div>
        <div className="text-green">
          {editing ? (
            <div className="grid grid-cols-1 gap-2">
              <Input
                name="city"
                value={formData.address?.city || ""}
                placeholder="City"
                onChange={handleChange}
                className="bg-background"
              />
              <EnumSelect
                labelMap={USStateDisplay}
                options={US_STATES}
                value={formData.address.state}
                onChange={(val: USState) => {
                  setFormData(prev => ({
                    ...prev,
                    address: {
                      ...prev.address,
                      state: val,
                    },
                  }))
                }} 
              />
            </div>
          ) : (
            <div>
              {formData.address?.city && formData.address?.state
                ? `${formData.address.city}, ${formData.address.state}`
                : "—"}
            </div>
          )}
        </div>
      </div>
      <div className="relative flex-col">
        <div className="font-medium font-semibold text-green">Emergency Contact:</div>
        <div className="text-green">
          {editing ? (
            <div className="grid grid-cols-1 gap-2">
              <Input
                name="emergencyName"
                value={formData.emergencyName || ""}
                placeholder="Emergency Contact Name"
                onChange={handleChange}
                className="bg-background"
              />
              <Input
                name="emergencyPhone"
                value={formatPhoneNumber(formData.phone ?? "")}
                placeholder="Emergency Contact Phone"
                onChange={handleChange}
                className="bg-background"
              />
              </div>
          ) : (
            <div className="flex flex-col">
              <span>{formData.emergencyName}</span>
              <span>{formatPhoneNumber(formData.emergencyPhone ?? "")}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
