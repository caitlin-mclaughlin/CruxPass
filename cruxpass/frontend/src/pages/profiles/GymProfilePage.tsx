import { useState, useEffect, useMemo } from "react";
import { useGymSession } from "@/context/GymSessionContext";
import ProfileLayout from "./ProfileLayout";
import { GymData } from "@/models/domain";
import GymProfileForm from "@/components/forms/GymForm";
import { CompetitionEnumMap, CompetitionStatus } from "@/constants/enum";
import { formatAddress, formatDateTimePretty, formatGroupsInOrder } from "@/utils/formatters";
import { displayDateTime } from "@/utils/datetime";
import { Button } from "@/components/ui/Button";
import { CalendarPlus, Info } from "lucide-react";
import CreateCompetitionModal from "@/components/modals/CreateCompetitionModal";
import { CompetitionFormPayload } from "@/models/dtos";
import { useNavigate } from "react-router-dom";

export default function GymProfilePage() {
  const { 
    gym,
    competitions,
    createCompetition,
    refreshCompetitions,
    refreshGym,
    updateGymProfile
  } = useGymSession();
  const [formData, setFormData] = useState<GymData>();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (gym) {
      setFormData(gym);
      refreshCompetitions();
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

  // Create competition
  const handleNewCompetition = async (data: CompetitionFormPayload) => {
    if (!gym) return
    try {
      await refreshGym()
      await createCompetition(data)
      await refreshCompetitions()
    } catch (err) {
      console.error('Failed to create competition', err)
    }
  }

  /** --- Group Competitions --- **/
  const sortedCompetitions = useMemo(
    () => (competitions ?? []).slice().sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    ),
    [competitions]
  )

  const upcomingOrLive = sortedCompetitions.filter(c => ['UPCOMING', 'LIVE'].includes(c.compStatus))

  const past = competitions.filter(c => c.compStatus === 'PAST' as CompetitionStatus);

  const hasAny = competitions.length > 0;
  const hasUpcoming = upcomingOrLive.length > 0;
  const hasPast = past.length > 0;

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

      {/* Competitions */}
      <div className="relative flex-col mt-5">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xl font-bold text-green">Competitions</h2>
          <Button onClick={() => setShowCreateModal(true)}>
            <CalendarPlus size={18} /> 
            <span className="relative top-[1px]">New Competition</span>
          </Button>
        </div>

        {hasAny ? (
          <>
            {hasUpcoming && (
              <div className="mb-2 border-t-2 border-green ">
                <h3 className="text-lg font-medium text-green mt-1 mb-1">Upcoming & Live</h3>
                <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(250px,1fr))] max-w-6xl">
                  {upcomingOrLive.map(comp => (
                    <div
                      key={comp.id}
                      className="px-3 py-2 flex flex-col items-center justify-center rounded-md shadow-md bg-shadow border border-green max-w-[275px] w-full"
                    >
                      <div className="font-semibold">{comp.name}</div>
                      <div className="text-sm text-green">{displayDateTime(comp.date)}</div>
                      <div className="text-sm text-green">
                        {comp.types.map((t: string) => CompetitionEnumMap[t as keyof typeof CompetitionEnumMap]).join(", ")}
                      </div>
                      <div className="text-sm text-green">
                        {formatGroupsInOrder(comp.competitorGroups)}
                      </div>
                      <Button
                        className="flex justify-center items-center mt-2"
                        onClick={() => navigate(`/competitions/${comp.id}`, { state: { redirectTo: `/dashboard` } })}
                      >
                        <Info size={18} />
                        <span className="relative top-[1px]">See Details</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasPast && (
              <div>
                <h3 className="text-lg font-medium text-green mb-1">Past</h3>
                <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(250px,1fr))] max-w-6xl">
                  {upcomingOrLive.map(comp => (
                    <div
                      key={comp.id}
                      className="px-3 py-2 flex flex-col items-center justify-center rounded-md shadow-md bg-shadow border border-green max-w-[275px] w-full"
                    >
                      <div className="font-medium">{comp.name}</div>
                      <div className="text-sm text-green">{displayDateTime(comp.date)}</div>
                      <div className="text-sm text-green">
                        {comp.types.map((t: string) => CompetitionEnumMap[t as keyof typeof CompetitionEnumMap]).join(", ")}
                      </div>
                      <div className="text-sm text-green">
                        {formatGroupsInOrder(comp.competitorGroups)}
                      </div>
                      <Button 
                        className="flex justify-center items-center mt-2"
                        onClick={() => navigate(`/competitions/${comp.id}`, { state: { redirectTo: `/dashboard` } })}
                      >
                        <Info size={18} />
                        <span className="relative top-[1px]">See Details</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="gap-y-3 rounded-md shadow-md px-3 py-2 bg-shadow border border-green">
            Host a competition and it will show up here!
          </div>
        )}
      </div>
      <CreateCompetitionModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleNewCompetition}
        gymName={gym?.name ?? ""}
        gymAddress={gym ? formatAddress(gym.address) : ""}
      />
    </div>
  );
}
