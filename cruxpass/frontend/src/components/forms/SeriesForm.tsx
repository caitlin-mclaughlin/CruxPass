import { SeriesData } from "@/models/domain";
import { RenderInput } from "@/utils/uiRendering";
import SegmentedDateInput from "../ui/SegmentedDateInput";
import { makeDateChangeHandler, displayDateTime, formatDateFromString, normalizeBackendDateOrDateTime } from "@/utils/datetime";
import DatePicker from "react-datepicker";
import { useIsMobile } from "@/hooks/isMobile";
import { Calendar } from "lucide-react";
import { Input } from "../ui/Input";

interface Props {
  formData: SeriesData;
  setFormData: React.Dispatch<React.SetStateAction<SeriesData>>;
  editing: boolean;
}

export default function SeriesProfileForm({ formData, setFormData, editing }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => prev && ({ ...prev, [name]: value }));
  };
  
  const isMobile = useIsMobile();

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
        label="Username:"
        name="username"
        value={formData.username}
        editing={editing}
        onChange={handleChange}
      />

      {/* Start Date */}
      <div className="flex-col relative">
        <div className="font-medium font-semibold text-green">Start Date:</div>
        <div className="text-green">
          {editing ? (
            <div className="bg-background rounded-md">
              <SegmentedDateInput
                mode="generic"
                value={formData.startDate}
                onChange={makeDateChangeHandler<SeriesData>("startDate", setFormData, "date")}
              />
            </div>
          ) : (
            formData.startDate && formatDateFromString(formData.startDate)
          )}
        </div>
      </div>

      {/* End Date */}
      <div className="flex-col relative">
        <div className="font-medium font-semibold text-green">End Date:</div>
        <div className="text-green">
          {editing ? (
            <div className="bg-background rounded-md">
              <SegmentedDateInput
                mode="generic"
                value={formData.endDate}
                onChange={makeDateChangeHandler<SeriesData>("endDate", setFormData, "date")}
              />
            </div>
          ) : (
            formData.endDate && formatDateFromString(formData.endDate)
          )}
        </div>
      </div>

      {/* Registration Deadline */}
      <div className="flex-col relative">
        <div className="font-medium font-semibold text-green">Registration Deadline:</div>
        <div className="text-green">
          {editing ? (
            <div className="bg-background rounded-md">
              <DatePicker
                selected={normalizeBackendDateOrDateTime(formData.deadline)}
                onChange={makeDateChangeHandler<SeriesData>("deadline", setFormData, "datetime")}
                showTimeSelect={true}
                dateFormat="Pp"
                placeholderText="MM/DD/YYYY, hh:mm"
                customInput={<Input className="bg-background"/>}
                popperPlacement="bottom-start"
                portalId="datepicker-portal"
                popperClassName="z-[9999]"
                popperContainer={(props) => <div {...props} />}
              />
              <Calendar className="absolute right-2 top-5/9 focus-visible:outline-none pointer-events:none" size={18} />
            </div>
          ) : (
            displayDateTime(formData.deadline)
          )}
        </div>
      </div>
    </>
  );
}
