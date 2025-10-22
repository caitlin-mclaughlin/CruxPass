import { GymData } from "@/models/domain";
import { Input } from "@/components/ui/Input";
import { formatAddress, formatPhoneNumber } from "@/utils/formatters";
import { RenderInput } from "@/utils/uiRendering";

interface Props {
  formData: GymData;
  setFormData: React.Dispatch<React.SetStateAction<GymData>>;
  editing: boolean;
}

export default function GymProfileForm({ formData, setFormData, editing }: Props) {
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
        label: "Name:", 
        name: "name",
        value: formData.name, 
        editing,
        onChange: handleChange
      })}
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
    </>
  );
}
