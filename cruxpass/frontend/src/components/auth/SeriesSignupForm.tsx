import DatePicker from "react-datepicker";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/Input";
import SegmentedDateInput from "@/components/ui/SegmentedDateInput";
import { Textarea } from "@/components/ui/Textarea";
import { AccountCredentialsFields } from "./AccountCredentialsFields";
import { AuthFormChangeHandler, AuthFormSetter, LoginFormData } from "./types";

type SeriesSignupFormProps = {
  formData: LoginFormData;
  setFormData: AuthFormSetter;
  onChange: AuthFormChangeHandler;
  clearInvalidField: (field: string) => void;
  isMobile: boolean;
};

export function SeriesSignupForm({
  formData,
  setFormData,
  onChange,
  clearInvalidField,
  isMobile,
}: SeriesSignupFormProps) {
  const setDateField = (
    field: "seriesStartDate" | "seriesEndDate" | "seriesDeadline",
    date: Date | null
  ) => {
    setFormData(prev => ({ ...prev, [field]: date }));
    if (date) clearInvalidField(field);
  };

  return (
    <div className="space-y-4">
      <AccountCredentialsFields
        formData={formData}
        setFormData={setFormData}
        onChange={onChange}
        namePlaceholder="Series Name"
        showPhone={false}
      />

      <div className="space-y-3 flex flex-col">
        <h2 className="font-semibold text-green text-lg border-b border-green/20 pb-1">Series Details (Optional)</h2>
        <Textarea
          name="seriesDescription"
          placeholder="Description (Optional)"
          value={formData.seriesDescription}
          onChange={onChange}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-green">Start Date</label>
            <div className="bg-shadow rounded-md">
              <SegmentedDateInput
                mode="generic"
                value={formData.seriesStartDate}
                onChange={(date) => setDateField("seriesStartDate", date)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-green">End Date</label>
            <div className="bg-shadow rounded-md">
              <SegmentedDateInput
                mode="generic"
                value={formData.seriesEndDate}
                onChange={(date) => setDateField("seriesEndDate", date)}
                minDate={formData.seriesStartDate ?? undefined}
              />
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-green">Registration Deadline</label>
          <div className="relative bg-shadow rounded-md">
            <DatePicker
              inline
              selected={formData.seriesDeadline}
              onChange={(date) => setDateField("seriesDeadline", date)}
              showTimeSelect={true}
              dateFormat="Pp"
              placeholderText="MM/DD/YYYY, hh:mm"
              customInput={<Input />}
              popperPlacement="bottom-start"
              portalId={isMobile ? "datepicker-portal" : undefined}
              popperClassName="z-[9999]"
            />
            <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-green" size={18} />
          </div>
        </div>
      </div>
    </div>
  );
}
