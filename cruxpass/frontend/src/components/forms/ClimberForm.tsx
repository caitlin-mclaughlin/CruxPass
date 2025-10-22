import { ClimberData } from "@/models/domain";
import { Input } from "@/components/ui/Input";
import SegmentedDateInput from "@/components/ui/SegmentedDateInput";
import CustomRadioGroup from "@/components/ui/CustomRadioGroup";
import { formatAddress, formatPhoneNumber } from "@/utils/formatters";
import { formatDateFromString, makeDateChangeHandler } from "@/utils/datetime";
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
        <div className="font-medium text-green">Gender (Division):</div>
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
                className="bg-background"
              />
              <Input
                name="address.apartmentNumber"
                value={formData.address?.apartmentNumber || ""}
                placeholder="Apartment Number"
                onChange={handleChange}
                className="bg-background"
              />
              <Input
                name="address.city"
                value={formData.address?.city || ""}
                placeholder="City"
                onChange={handleChange}
                className="bg-background"
              />
              <Input
                name="address.state"
                value={formData.address?.state || ""}
                placeholder="State"
                onChange={handleChange}
                className="bg-background"
              />
              <Input
                name="address.zipCode"
                value={formData.address?.zipCode || ""}
                placeholder="Zip Code"
                onChange={handleChange}
                className="bg-background"
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
      <div className="relative flex-col">
        <div className="font-medium text-green">Emergency Contact:</div>
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
