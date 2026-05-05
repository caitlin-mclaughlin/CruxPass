import { useState, useEffect } from "react";
import { useSeriesSession } from "@/context/SeriesSessionContext";
import ProfileLayout from "./ProfileLayout";
import { SeriesData, SimpleGym } from "@/models/domain";
import SeriesProfileForm from "@/components/forms/SeriesForm";
import { Textarea } from "@/components/ui/Textarea"
import { Button } from "@/components/ui/Button";
import { CalendarPlus, HousePlus, UserPlus } from "lucide-react";
import AddGymModal from "@/components/modals/LinkGymSeriesModal";
import { formatAddress, formatPhoneNumber } from "@/utils/formatters";
import LinkCompetitionModal from "@/components/modals/LinkCompetitionModal";
import LinkGymSeriesModal from "@/components/modals/LinkGymSeriesModal";
import PageContainer from "@/components/PageContainer";

export default function SeriesProfilePage() {
  const { 
    series, 
    gyms, 
    competitions,
    seriesSessionLoading,
    refreshAll, 
    updateSeriesProfile 
  } = useSeriesSession();
  const [formData, setFormData] = useState<SeriesData>();
  const [editing, setEditing] = useState(false);
  
  const [showCompModal, setShowCompModal] = useState(false)
  const [showGymSeriesModal, setShowGymSeriesModal] = useState(false)

  useEffect(() => {
    if (series) {
      setFormData(series);
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
    <PageContainer>
      <h1 className="text-2xl font-bold mb-2">{formData?.name}</h1>
      <ProfileLayout
        editing={editing}
        setEditing={setEditing}
        handleSubmit={handleSubmit}
        loading={seriesSessionLoading}
      >
        <>
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
        </>

        {/* Series Description */}
        {formData?.description && (
          <>
            {editing ? (
              <>
                <h3 className="font-semibold">{"Series Description (Optional)"}</h3>
                <Textarea
                  name="description"
                  placeholder="Your description"
                  value={formData?.description ?? ""}
                  onChange={handleChange}
                />
              </>
            ) : (
              <>
                <h2 className="font-bold text-xl">{"Series Description"}</h2>
                <div className="px-3 py-2 bg-shadow border border-green rounded-md shadow-md">{formData.description}</div>
              </>
            )}
          </>
        )}
      </ProfileLayout>

      {/* Registrations */}
      <div className="relative flex-col">
        <h2 className="text-xl font-bold text-green mb-1">Registrations</h2>
        <div className="gap-y-3 rounded-md shadow-md px-3 py-2 bg-shadow border border-green">
          Climbers registered for {formData?.name} will show up here!
        </div>
      </div>

      {/* Competitions */}
      <div className="relative flex-col mt-6">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xl font-bold text-green">Affiliated Competitions</h2>
          <Button onClick={() => setShowCompModal(true)}>
            <CalendarPlus size={18} /> 
            <span className="relative top-[1px]">New Competition</span>
          </Button>
        </div>
        <div className="gap-y-3 rounded-md shadow-md px-3 py-2 bg-shadow border border-green">
          Competitions associated with {formData?.name} will show up here!
        </div>
      </div>

      {/* Gyms */}
      <div className="relative flex-col mt-6">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xl font-bold text-green">Affiliated Gyms</h2>
          <Button onClick={() => setShowGymSeriesModal(true)}>
            <HousePlus size={18} /> 
            <span className="relative top-[1px]">Link a Gym</span>
          </Button>
        </div>
        {gyms && gyms.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto scrollbar-thin-green scroll-smooth border border-green bg-shadow rounded-md shadow-md p-3">
            {gyms.map((gym) => (
              <div
                key={gym.id}
                className="flex-shrink-0 px-3 py-2 min-w-[250px] max-w-[350px] rounded-md shadow-md bg-background border border-green text-green"
              >
                <div className="text-med truncate"><strong>{gym.name}</strong></div>
                <div className="text-sm"><strong>Phone: </strong>{formatPhoneNumber(gym.phone)}</div>
                <div className="text-sm truncate"><strong>Email: </strong>{gym.email}</div>
                <div className="text-sm"><strong>Address: </strong>{formatAddress(gym.address)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="gap-y-3 rounded-md shadow-md px-3 py-2 bg-shadow border border-green">
            Gyms associated with {formData?.name} will show up here!
          </div>
        )}
      </div>

      <LinkCompetitionModal 
        open={showCompModal}
        onClose={() => setShowCompModal(false)}
        onSuccess={async () => {
          await refreshAll()
          setShowCompModal(false)
        }}
      />

      <LinkGymSeriesModal 
        open={showGymSeriesModal}
        onClose={() => setShowGymSeriesModal(false)}
        onSuccess={async () => {
          await refreshAll()
          setShowGymSeriesModal(false)
        }}
        mode="series-selects-gym"
      />
    </PageContainer>
  );
}
