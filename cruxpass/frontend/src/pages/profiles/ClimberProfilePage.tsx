import { useState, useEffect } from "react";
import { useClimberSession } from "@/context/ClimberSessionContext";
import ProfileLayout from "./ProfileLayout";
import { ClimberData } from "@/models/domain";
import ClimberProfileForm from "@/components/forms/ClimberForm";

export default function ClimberProfilePage() {
  const { climber, updateClimberProfile } = useClimberSession();
  const [formData, setFormData] = useState<ClimberData>();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (climber) {
      setFormData(climber);
      setLoading(false);
    }
  }, [climber]);

  const handleSubmit = async () => {
    if (!formData) return;
    try {
      await updateClimberProfile(formData);
      setEditing(false);
    } catch (err) {
      console.error("Failed to update climber profile:", err);
      alert("Profile update failed.");
    }
  };

  return (
    <div className="h-screen p-8 bg-background text-green">
      <h1 className="text-2xl font-bold mb-2">{formData?.name}</h1>
      <ProfileLayout
        editing={editing}
        setEditing={setEditing}
        handleSubmit={handleSubmit}
        loading={loading}
      >
        {formData && (
          <ClimberProfileForm
            formData={formData}
            setFormData={setFormData as React.Dispatch<React.SetStateAction<ClimberData>>}
            editing={editing}
          />
        )}
        
        {/* Created At */}
        <div className="relative flex-col">
          <div className="font-medium text-green">User Since:</div>
          <div className="text-green">{new Date(formData?.createdAt ?? "").toLocaleDateString()}</div>
        </div>
      </ProfileLayout>

      {/* Competitions */}
      <div className="relative flex-col mt-6">
        <h2 className="text-xl font-semibold text-green mb-1">My Competitions</h2>
        <div className="gap-y-3 rounded-md shadow-md px-3 py-2 bg-shadow border border-green">Register for a competition and it will show up here!</div>
      </div>

      {/* Badges */}
      <div className="relative flex-col mt-6">
        <h2 className="text-xl font-semibold text-green mb-1">My Badges</h2>
        <div className="gap-y-3 rounded-md shadow-md px-3 py-2 bg-shadow border border-green">Compete in competitions and series to earn badges!</div>
      </div>
    </div>
  );
}
