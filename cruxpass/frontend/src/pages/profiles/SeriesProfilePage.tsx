import { useState, useEffect } from "react";
import { useSeriesSession } from "@/context/SeriesSessionContext";
import ProfileLayout from "./ProfileLayout";
import { SeriesData } from "@/models/domain";
import SeriesProfileForm from "@/components/forms/SeriesForm";
import { Textarea } from "@/components/ui/Textarea"

export default function SeriesProfilePage() {
  const { series, updateSeriesProfile } = useSeriesSession();
  const [formData, setFormData] = useState<SeriesData>();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (series) {
      setFormData(series);
      setLoading(false);
    }
  }, [series]);

  const handleSubmit = async () => {
    if (!formData) return;
    try {
      await updateSeriesProfile(formData);
      setEditing(false);
    } catch (err) {
      console.error("Failed to update series profile:", err);
      alert("Profile update failed.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => prev && ({ ...prev, [name]: value }))
  }

  return (
    <div>
      <ProfileLayout
        title="Series Profile"
        name={formData?.name}
        editing={editing}
        setEditing={setEditing}
        handleSubmit={handleSubmit}
        loading={loading}
      >
        {formData && (
          <SeriesProfileForm
            formData={formData}
            setFormData={setFormData as React.Dispatch<React.SetStateAction<SeriesData>>}
            editing={editing}
          />
        )}
        
        {/* Created At */}
        <div className="relative flex-col">
          <div className="flex-1 font-medium text-green">Series User Since:</div>
          <div className="flex-1 text-green">{new Date(formData?.createdAt ?? "").toLocaleDateString()}</div> 
        </div>
      </ProfileLayout>
      {(formData?.description || editing) && (
        <>
          <label className="font-semibold">Series Description (Optional)</label>
          <Textarea
            name="description"
            placeholder="Your description"
            value={formData?.description}
            onChange={handleChange}
          />
        </>
      )}
    </div>
  );
}
