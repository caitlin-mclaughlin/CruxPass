import { useState, useEffect } from "react";
import { useClimberSession } from "@/context/ClimberSessionContext";
import ProfileLayout from "./ProfileLayout";
import { ClimberData, DependentClimber } from "@/models/domain";
import ClimberProfileForm from "@/components/forms/ClimberForm";
import { Button } from "@/components/ui/Button";
import AddDependentModal from "@/components/modals/AddDependentModal";
import { Trash2, UserPen } from "lucide-react";
import { GenderEnumMap } from "@/constants/enum";
import { formatDateFromString } from "@/utils/datetime";

export default function ClimberProfilePage() {
  const {
    climber, 
    dependents, 
    addDependentProfile,
    refreshClimber,
    removeDependentProfile,
    updateClimberProfile
  } = useClimberSession();
  const [formData, setFormData] = useState<ClimberData>();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // State for editing dependents
  const [editingDependent, setEditingDependent] = useState<DependentClimber | null>(null);
  // State for delete confirmation
  const [deletingDependent, setDeletingDependent] = useState<DependentClimber | null>(null);
  
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

  const handleAddOrEditDependent = async (dependent: DependentClimber) => {
    if (editingDependent) {
      // Update logic: assume you have an update function
      await addDependentProfile({ ...editingDependent, ...dependent });
      setEditingDependent(null);
    } else {
      await addDependentProfile(dependent);
    }
    await refreshClimber();
    setModalOpen(false);
  };

  const handleDeleteDependent = async () => {
    if (!deletingDependent) return;
    try {
      await removeDependentProfile(deletingDependent.id!);
      await refreshClimber();
      setDeletingDependent(null);
    } catch (err) {
      console.error("Failed to delete dependent:", err);
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

      {/* Dependents Section (only if exist) */}
      {dependents.length > 0 && (
        <div className="relative flex-col mt-5">
          <h2 className="text-xl font-semibold text-green mb-2">My Dependents</h2>
          <div className="grid grid-cols-3 gap-3">
            {dependents.map((dep) => (
              <div
                key={dep.id}
                className="px-3 py-2 flex-1 items-center justify-center rounded-md shadow-md bg-shadow border border-green"
              >
                <div className="font-medium">{dep.name}</div>
                <div className="text-sm text-green">
                  Birthday: {dep.dob && formatDateFromString(dep.dob)}
                </div>
                <div className="text-sm text-green">
                  Gender (Division): {GenderEnumMap[dep.gender as keyof typeof GenderEnumMap]}
                </div>
                <div className="flex justify-between gap-x-3 mt-2">
                  <Button 
                    disabled={loading}
                    className="flex-1"
                    onClick={() => {
                      setEditingDependent(dep);
                      setModalOpen(true);
                    }}
                  >
                    <UserPen size={18} />
                    <span className="relative top-[1px]">Edit</span>
                  </Button>
                  <Button 
                    onClick={() => setDeletingDependent(dep)}
                    className="flex-1 bg-accent text-background hover:bg-accentHighlight"
                  >
                    <Trash2 size={18} />
                    <span className="relative top-[1px]">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Add Dependent Button */}
      <button
        onClick={() => {
          setEditingDependent(null);
          setModalOpen(true);
        }}
        className="fixed bottom-6 right-6 px-3.5 py-2 rounded-full bg-green font-semibold text-background shadow-md flex items-center justify-center text-lg hover:bg-select transition"
      >
        + Add Dependent
      </button>

      {/* Competitions */}
      <div className="relative flex-col mt-5">
        <h2 className="text-xl font-semibold text-green mb-1">My Competitions</h2>
        <div className="gap-y-3 rounded-md shadow-md px-3 py-2 bg-shadow border border-green">Register for a competition and it will show up here!</div>
      </div>

      {/* Badges */}
      <div className="relative flex-col mt-5">
        <h2 className="text-xl font-semibold text-green mb-1">My Badges</h2>
        <div className="gap-y-3 rounded-md shadow-md px-3 py-2 bg-shadow border border-green">Compete in competitions and series to earn badges!</div>
      </div>

      {/* Add/Edit Modal */}
      <AddDependentModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingDependent(null);
        }}
        onSubmit={handleAddOrEditDependent}
        initialData={editingDependent ?? undefined} // pass existing dependent if editing
      />

      {/* Delete Confirmation */}
      {deletingDependent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/25 z-50">
          <div className="bg-background p-4 rounded-md shadow-md border border-green flex flex-col gap-2">
            <div className="text-lg font-semibold leading-none tracking-tight">Confirm Deletion</div>
            <div>Are you sure you want to permanently delete {deletingDependent.name}?</div>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setDeletingDependent(null)} className="bg-green text-background hover:bg-select">
                Cancel
              </Button>
              <Button onClick={handleDeleteDependent} className="bg-accent text-background hover:bg-accentHighlight">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
