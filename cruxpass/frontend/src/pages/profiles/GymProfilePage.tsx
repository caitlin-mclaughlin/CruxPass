import { useState, useEffect, useMemo } from "react";
import { useGymSession } from "@/context/GymSessionContext";
import ProfileLayout from "./ProfileLayout";
import { GymData } from "@/models/domain";
import GymProfileForm from "@/components/forms/GymForm";
import { CompetitionStatus, CompetitionTypeMap } from "@/constants/enum";
import { formatAddress, formatGroupsInOrder } from "@/utils/formatters";
import { displayDateTime, displayShortDateTime, formatDateFromString } from "@/utils/datetime";
import { Button } from "@/components/ui/Button";
import { CalendarPlus, ChartColumn, Info } from "lucide-react";
import CreateCompetitionModal from "@/components/modals/CreateCompetitionModal";
import { CreateCompetitionDto } from "@/models/dtos";
import { useNavigate } from "react-router-dom";
import LinkGymSeriesModal from "@/components/modals/LinkGymSeriesModal";
import PageContainer from "@/components/PageContainer";
import { CompetitionCard } from "@/components/ui/cards/CompetitionCard";

export default function GymProfilePage() {
  const { 
    gym,
    competitions,
    gymSeries,
    gymSessionLoading,
    createCompetition,
    refreshCompetitions,
    refreshGym,
    refreshSeries,
    updateGymProfile
  } = useGymSession();
  const [formData, setFormData] = useState<GymData>();
  const [editing, setEditing] = useState(false);
  const [showCompModal, setShowCompModal] = useState(false)
  const [showGymSeriesModal, setShowGymSeriesModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (gym) {
      setFormData(gym);
      refreshCompetitions();
      refreshSeries();
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
  const handleNewCompetition = async (data: CreateCompetitionDto) => {
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
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    ),
    [competitions]
  )

  const upcomingOrLive = sortedCompetitions.filter(c => ['UPCOMING', 'LIVE'].includes(c.compStatus))

  const past = competitions.filter(c => c.compStatus === 'FINISHED' as CompetitionStatus);

  const hasAny = competitions.length > 0;
  const hasUpcoming = upcomingOrLive.length > 0;
  const hasPast = past.length > 0;

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-2">{formData?.name}</h1>
      <ProfileLayout
        editing={editing}
        setEditing={setEditing}
        handleSubmit={handleSubmit}
        loading={gymSessionLoading}
      >
        <>
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
        </>
      </ProfileLayout>

      {/* Competitions */}
      <div className="relative flex-col mt-4">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xl font-bold text-green relative top-[3px]">Competitions</h2>
          <Button onClick={() => setShowCompModal(true)}>
            <CalendarPlus size={18} /> 
            <span className="relative top-[1px]">New Competition</span>
          </Button>
        </div>

        {hasAny ? (
          <div className="border-t-2 border-green">
            {hasUpcoming && (
              <>
                <h3 className="text-lg font-medium text-green mt-1 mb-1">Upcoming & Live</h3>
                <div className="flex gap-3 overflow-x-auto scrollbar-thin-green scroll-smooth border border-green bg-shadow rounded-md shadow-md p-3">
                  {upcomingOrLive.map(comp => (
                    <CompetitionCard comp={comp} />
                  ))}
                </div>
              </>
            )}

            {hasPast && (
              <div className="mt-2">
                <h3 className="text-lg font-medium text-green mb-1">Past</h3>
                <div className="flex gap-3 overflow-x-auto scrollbar-thin-green scroll-smooth border border-green bg-shadow rounded-md shadow-md p-3">
                  {past.map(comp => (
                    <CompetitionCard comp={comp} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="gap-y-3 rounded-md shadow-md px-3 py-2 bg-shadow border border-green">
            Host a competition and it will show up here!
          </div>
        )}
      </div>

      {/* Series */}
      <div className="relative flex-col mt-4">
        <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-bold text-green mb-1 relative top-[3px]">Affiliated Series</h2>
          <Button onClick={() => setShowGymSeriesModal(true)}>
            <ChartColumn size={18} /> 
            <span className="relative top-[1px]">Link a Series</span>
          </Button>
        </div>
        {gymSeries && gymSeries.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto scrollbar-thin-green scroll-smooth border border-green bg-shadow rounded-md shadow-md p-3">
            {gymSeries.map((gymSeries) => (
              <div
                key={gymSeries.id}
                className="flex-shrink-0 px-3 py-2 min-w-[250px] max-w-[350px] rounded-md shadow-md bg-background border border-green text-green"
              >
                <div className="text-med truncate flex justify-center"><strong>{gymSeries.name}</strong></div>
                <div className="text-sm"><strong>Dates: </strong>
                  {gymSeries.startDate ? formatDateFromString(gymSeries.startDate) : 'TBD'} – {gymSeries.endDate ? formatDateFromString(gymSeries.endDate) : 'TBD'}
                </div>
                <div className="text-sm truncate"><strong>Deadline: </strong>{gymSeries.deadline ? displayShortDateTime(gymSeries.deadline): 'None'}</div>
                <div className="text-sm truncate"><strong>Email: </strong>{gymSeries.email}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="gap-y-3 rounded-md shadow-md px-3 py-2 bg-shadow border border-green">
            Series associated with {formData?.name} will show up here!
          </div>
        )}
      </div>

      <CreateCompetitionModal
        open={showCompModal}
        onClose={() => setShowCompModal(false)}
        onSubmit={handleNewCompetition}
        gymName={gym?.name ?? ""}
        gymAddress={gym ? formatAddress(gym.address) : ""}
      />

      <LinkGymSeriesModal 
        open={showGymSeriesModal}
        onClose={() => setShowGymSeriesModal(false)}
        onSuccess={async () => {
          await refreshSeries()
          setShowGymSeriesModal(false)
        }}
        mode="gym-selects-series"
      />
    </PageContainer>
  );
}
