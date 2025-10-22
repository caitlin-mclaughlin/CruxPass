import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import SegmentedDateInput from "@/components/ui/SegmentedDateInput";
import { makeDateChangeHandler } from "@/utils/datetime";
import { ClimberData, DependentClimber } from "@/models/domain";
import { useClimberSession } from "@/context/ClimberSessionContext";
import { Gender, GENDER_OPTIONS, GenderEnumMap } from "@/constants/enum";
import CustomRadioGroup from "../ui/CustomRadioGroup";
import { MIN_AGE } from "@/constants/literal";
import { formatPhoneNumber } from "@/utils/formatters";
import clsx from "clsx";
import { Ban, Save } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (dependent: DependentClimber) => Promise<void>;
  initialData?: DependentClimber;
}

function buildInitialForm (data?: Props['initialData']): DependentClimber {
  return data
    ? {
      id: data.id,
      name: data.name,
      dob: data.dob,
      gender: data.gender,
      emergencyName: data.emergencyName,
      emergencyPhone: data.emergencyPhone,
    }
  : {
    id: NaN,
    name: "",
    dob: "",
    gender: "" as Gender,
    emergencyName: "",
    emergencyPhone: "",
  }
}

export default function AddDependentModal({ open, onClose, onSubmit, initialData }: Props) {
  const { climber } = useClimberSession();
  const [formData, setFormData] = useState<DependentClimber>(() => buildInitialForm(initialData));
  const [useGuardianAsEmergency, setUseGuardianAsEmergency] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [showInvalid, setShowInvalid] = useState(false);
  const [shake, setShake] = useState(false);

  const today = new Date();
  const birthdayMin = new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate());
  const birthdayMax = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate());

  // Reset modal when closed
  useEffect(() => {
    if (!open) {
      handleCancel();
      return;
    }
    if (initialData) {
      setFormData(buildInitialForm(initialData));
    }
  }, [initialData, open]);

  // Prefill or clear emergency contact when toggled
  useEffect(() => {
    if (useGuardianAsEmergency && climber) {
      setFormData(prev => ({
        ...prev,
        emergencyName: climber.name,
        emergencyPhone: climber.phone,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        emergencyName: "",
        emergencyPhone: "",
      }));
    }
  }, [useGuardianAsEmergency, climber]);

  const handleChange = (
    eOrField: React.ChangeEvent<HTMLInputElement> | { field: string; value: any }
  ) => {
    let field: string;
    let value: any;

    if ("target" in eOrField) {
      // Standard <Input /> change
      field = eOrField.target.name;
      value = eOrField.target.value;
    } else {
      // Custom updates (date, gender, etc.)
      field = eOrField.field;
      value = eOrField.value;
    }

    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Clean invalid state for this field
      setInvalidFields(prevInvalid => {
        const updatedInvalid = new Set(prevInvalid);
        updatedInvalid.delete(field);
        return updatedInvalid;
      });

      // Check if all required fields are now valid
      const required = ["name", "dob", "gender", "emergencyName", "emergencyPhone"];
      const allValid = required.every(f => !!(updated as any)[f]?.toString().trim());

      if (allValid) {
        setErrorMessage("");
        setShowInvalid(false);
      }

      return updated;
    });
  };

  const handleCancel = () => {
    // Reset everything before closing
    setFormData(buildInitialForm(initialData));
    setUseGuardianAsEmergency(true);
    setErrorMessage("");
    setInvalidFields(new Set());
    setShowInvalid(false);
    setShake(false);
    onClose();
  };

  const validateForm = (): boolean => {
    const required = ["name", "dob", "gender", "emergencyName", "emergencyPhone"];
    
    const invalid = required.filter(f => {
      const rawValue = getFieldValue(f);
      const strValue = rawValue != null ? String(rawValue).trim() : "";
      return strValue.length === 0;
    });

    if (invalid.length > 0) {
      setInvalidFields(new Set(invalid));
      setErrorMessage("Please fill out all fields.");
      setShowInvalid(true);
      // Trigger shake animation
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return false;
    }
    setInvalidFields(new Set());
    setShowInvalid(false);
    setErrorMessage("");
    return true;
  };

  const getInputClass = (field: string) =>
    clsx(
      "bg-shadow rounded-md border transition-all",
      invalidFields.has(field)
        ? "border-accent text-accent placeholder:text-accent"
        : "border-green text-green",
      shake && invalidFields.has(field) && "animate-shake"
    );

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await onSubmit(formData);
      handleCancel();
    } finally {
      setLoading(false);
    }
  };

  const getFieldValue = (field: string): string | number | boolean | Date | undefined => (formData as any)[field];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Dependent</DialogTitle>
          <DialogDescription>
            Parents, guardians, and coaches can add a dependent to their account to enter scores for them.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full space-y-3">
          <label className="font-semibold">Full Name of Dependent:</label>
          <Input
            name="name"
            placeholder="Dependent's Name"
            value={formData.name || ""}
            onChange={handleChange}
            className={getInputClass("name")}
          />

          <label className="font-semibold">Date of Birth:</label>
          <div className="bg-shadow rounded-md">
            <SegmentedDateInput
              mode="birthday"
              value={formData.dob}
              minDate={birthdayMin}
              maxDate={birthdayMax}
              invalid={showInvalid && invalidFields.has("dob")}
              onChange={makeDateChangeHandler<DependentClimber>("dob", setFormData, "date")}
            />
          </div>

          <label className="font-semibold">Gender (For Competition Genders):</label>
          <div className={clsx(getInputClass("gender"), "px-3 py-1 shadow-md")}>
            <CustomRadioGroup
              name="gender"
              options={GENDER_OPTIONS.map(g => ({
                value: g,
                label: GenderEnumMap[g as keyof typeof GenderEnumMap],
              }))}
              selected={formData.gender ?? null}
              invalid={showInvalid && invalidFields.has("gender")}
              onChange={(g: string) => handleChange({ field: "gender", value: g as Gender })}
            />
          </div>
        </div>

        {/* Emergency Contact Toggle */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold">Use Self as Emergency Contact</label>
            <button
              type="button"
              role="switch"
              aria-checked={useGuardianAsEmergency}
              onClick={() => setUseGuardianAsEmergency(prev => !prev)}
              className={`relative inline-flex h-6 w-11 border border-green items-center rounded-full transition-colors ${
                useGuardianAsEmergency ? "bg-green" : "bg-shadow"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full border border-green bg-background transition-transform ${
                  useGuardianAsEmergency ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {useGuardianAsEmergency ? (
            <div className="px-3 py-1 border border-green bg-shadow shadow-md rounded-md text-green">
              <div className="mb-2">{climber?.name}</div>
              <div>{formatPhoneNumber(climber?.phone ?? "")}</div>
            </div>
          ) : (
            <div className="grid gap-2">
              <Input
                name="emergencyName"
                placeholder="Emergency Contact Name"
                value={formData.emergencyName || ""}
                onChange={handleChange}
                className={getInputClass("emergencyName")}
              />
              <Input
                name="emergencyPhone"
                placeholder="Emergency Contact Phone"
                value={formData.emergencyPhone || ""}
                onChange={handleChange}
                className={getInputClass("emergencyPhone")}
              />
            </div>
          )}
        </div>

        {errorMessage && <div className="text-accent">{errorMessage}</div>}

        <DialogFooter>
          <Button onClick={handleCancel} className="bg-accent text-background hover:bg-accentHighlight">
            <Ban size={18} />
            <span>Cancel</span>
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save size={18} />
            <span>{loading ? "Saving..." : "Save Dependent"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
