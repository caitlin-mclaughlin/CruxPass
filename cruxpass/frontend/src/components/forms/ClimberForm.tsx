import { ClimberData } from "@/models/domain";
import { Input } from "@/components/ui/Input";
import SegmentedDateInput from "@/components/ui/SegmentedDateInput";
import CustomRadioGroup from "@/components/ui/CustomRadioGroup";
import { formatDate, formatAddress, formatPhoneNumber } from "@/utils/formatters";
import { makeDateChangeHandler, normalizeBackendDateOrDateTime } from "@/utils/datetime";
import { GENDER_OPTIONS, GenderEnumMap } from "@/constants/enum";
import { RenderInput } from "@/utils/uiRendering";

interface Props {
  formData: ClimberData;
  setFormData: React.Dispatch<React.SetStateAction<ClimberData>>;
  editing: boolean;
}

export default function ClimberProfileForm({ formData, setFormData, editing }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => prev && ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => prev && ({ ...prev, [name]: value }));
    }
  };
  
  return (
    <>
      {RenderInput({
        label: "Email:",
        name: "email",
        value: formData.email,
        editing,
        onChange: handleChange
      })}
      {RenderInput({
        label: "Phone:", 
        name: "phone",
        value: formatPhoneNumber(formData.phone ?? ""),
        editing,
        onChange: handleChange
      })}
      {RenderInput({
        label: "Username:",
        name: "username",
        value: formData.username,
        editing,
        onChange: handleChange
      })}

      {/* DOB */}
      <div className="relative flex-col">
        <div className="font-medium text-green">Date of Birth:</div>
        <div className="text-green">
          {editing ? (
            <SegmentedDateInput
              mode="birthday"
              value={normalizeBackendDateOrDateTime(formData.dob)}
              onChange={makeDateChangeHandler<ClimberData>("dob", setFormData)}
            />
          ) : (
            formData.dob && formatDate(new Date(formData.dob + "T00:00:00"))
          )}
        </div>
      </div>

      {/* Gender */}
      <div className="relative flex-col">
        <div className="font-medium text-green">Gender (Division):</div>
        <div className="text-green">
          {editing ? (
            <CustomRadioGroup
              name="division"
              options={GENDER_OPTIONS.map(g => ({ 
                value: g, 
                label: GenderEnumMap[g as keyof typeof GenderEnumMap] 
              }))}
              selected={formData.division}
              onChange={(g: string) => {
                setFormData((prev: any) => ({ 
                  ...prev, 
                  division: g
                }))
              }}
                  />
          ) : (
            GenderEnumMap[formData.division as keyof typeof GenderEnumMap]
          )}
        </div>
      </div>

      {/* Address */}
      <div className="relative flex-col">
        <div className="font-medium text-green">Address:</div>
        <div className="text-green">
          {editing ? (
            <div className="grid grid-cols-1 gap-2">
              <Input
                name="address.streetAddress"
                value={formData.address?.streetAddress || ""}
                placeholder="Street Address"
                onChange={handleChange}
              />
              <Input
                name="address.apartmentNumber"
                value={formData.address?.apartmentNumber || ""}
                placeholder="Apartment Number"
                onChange={handleChange}
              />
              <Input
                name="address.city"
                value={formData.address?.city || ""}
                placeholder="City"
                onChange={handleChange}
              />
              <Input
                name="address.state"
                value={formData.address?.state || ""}
                placeholder="State"
                onChange={handleChange}
              />
              <Input
                name="address.zipCode"
                value={formData.address?.zipCode || ""}
                placeholder="Zip Code"
                onChange={handleChange}
              />
            </div>
          ) : (
            formData.address &&
            formatAddress(formData.address)
              .split("\n")
              .map((line, idx) => <div key={idx}>{line}</div>)
          )}
        </div>
      </div>
    </>
  );
}
