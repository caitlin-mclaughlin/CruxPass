import { useState, useEffect } from "react";
import { useGymSession } from "@/context/GymSessionContext";
import ProfileLayout from "./ProfileLayout";
import { GymData } from "@/models/domain";
import GymProfileForm from "@/components/forms/GymForm";

export default function GymProfilePage() {
  const { gym, updateGymProfile } = useGymSession();
  const [formData, setFormData] = useState<GymData>();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (gym) {
      setFormData(gym);
      setLoading(false);
    }
  }, [gym]);

  const handleSubmit = async () => {
    if (!formData) return;
    try {
      await updateGymProfile(formData);
      setEditing(false);
    } catch (err) {
      console.error("Failed to update gym profile:", err);
      alert("Profile update failed.");
    }
  };

  return (
    <ProfileLayout
      title="Gym Profile"
      name={formData?.name}
      editing={editing}
      setEditing={setEditing}
      handleSubmit={handleSubmit}
      loading={loading}
    >
      {formData && (
        <GymProfileForm
          formData={formData}
          setFormData={setFormData as React.Dispatch<React.SetStateAction<GymData>>}
          editing={editing}
        />
      )}
      
      {/* Created At */}
      <div className="relative flex-col">
        <div className="font-medium text-green">Gym User Since:</div>
        <div className="text-green">{new Date(formData?.createdAt ?? "").toLocaleDateString()}</div> 
      </div>
    </ProfileLayout>
  );
}
