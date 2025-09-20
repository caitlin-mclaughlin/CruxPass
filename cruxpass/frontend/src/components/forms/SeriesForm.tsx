import { SeriesData } from "@/models/domain";
import { RenderInput } from "@/utils/uiRendering";
import SegmentedDateInput from "../ui/SegmentedDateInput";
import { normalizeBackendDateOrDateTime, makeDateChangeHandler } from "@/utils/datetime";

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
        label: "Username:",
        name: "username",
        value: formData.username,
        editing,
        onChange: handleChange
      })}

      {/* Start Date */}
      <div className="flex-col relative">
        <div className="font-medium text-green">Start Date:</div>
        <div className="text-green">
          {editing ? (
            <div className="bg-background">
              <SegmentedDateInput
                mode="generic"
                value={normalizeBackendDateOrDateTime(formData.startDate)}
                onChange={makeDateChangeHandler<SeriesData>("endDate", setFormData, "datetime")}
              />
            </div>
          ) : (
              new Date(formData.startDate + "T00:00:00").toLocaleDateString()
          )}
        </div>
      </div>

      {/* End Date */}
      <div className="flex-col relative">
        <div className="font-medium text-green">End Date:</div>
        <div className="text-green">
          {editing ? (
            <div className="bg-background">
              <SegmentedDateInput
                mode="generic"
                value={normalizeBackendDateOrDateTime(formData.endDate)}
                onChange={makeDateChangeHandler<SeriesData>("startDate", setFormData, "datetime")}
              />
            </div>
          ) : (
            new Date(formData.endDate + "T00:00:00").toLocaleDateString()
          )}
        </div>
      </div>

      {/* Registration Deadline */}
      <div className="flex-col relative">
        <div className="font-medium text-green">Registration Deadline:</div>
        <div className="text-green">
          {editing ? (
            <div className="bg-background">
              <SegmentedDateInput
                mode="generic"
                value={normalizeBackendDateOrDateTime(formData.deadline)}
                onChange={makeDateChangeHandler<SeriesData>("deadline", setFormData, "datetime")}
              />
            </div>
          ) : (
            new Date(formData.deadline + "T00:00:00").toLocaleDateString()
          )}
        </div>
      </div>
    </>
  );
}
