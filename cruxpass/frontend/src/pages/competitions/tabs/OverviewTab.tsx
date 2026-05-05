import { HeatListResponsive } from "@/components/ui/heat_display/HeatListResponsive"
import { Button } from "@/components/ui/Button"
import { CompetitionPreviewCard } from "@/components/ui/cards/CompetitionPreviewCard"
import { CompetitionEntity, HeatData } from "@/models/domain"
import { ResolvedCompetitorGroup } from "@/models/dtos"
import { CalendarCheck, PencilLine } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface Props {
  competitionId?: string,
  competition: CompetitionEntity,
  heats: HeatData[],
  gymCustomGroups: ResolvedCompetitorGroup[],
  setActiveTab: React.Dispatch<React.SetStateAction<"heats" | "registrations" | "overview" | "leaderboard">>,
  setShowRouteModal: React.Dispatch<React.SetStateAction<boolean>>
}

export function OverviewTab({ 
  competitionId, 
  competition, 
  heats, 
  gymCustomGroups,
  setActiveTab,
  setShowRouteModal
} : Props) {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4">
      {/* Competition Details Box */}
      <CompetitionPreviewCard competition={competition} />

      <div className="relative flex-col">
        <h2 className="text-xl font-bold mb-1">Competitor Groups</h2>
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))] gap-2">
          {competition.selectedGroups.map(group => (
              <div
                key={group.id ?? group.name}
                className="flex items-center justify-center rounded-md shadow-md border px-3 py-2 text-green text-center bg-shadow"
              >
                {group.name}
              </div>
          ))}
        </div>
      </div>

      <div className="relative flex-col">
        <h2 className="text-xl font-bold mb-1">Heats</h2>
        <button className="w-full" onClick={() => setActiveTab('heats')}>
          <HeatListResponsive 
            heats={heats} 
            customGroups={gymCustomGroups} 
            showDate={false}
          />
        </button>


        <div className="flex justify-between mt-3">
          <Button onClick={() => {navigate(`/competitions/${competitionId}/edit`)}}>
              <CalendarCheck size={18} /> 
              <span className="relative top-[1px]">Edit Competition</span>
          </Button>

          <Button
            onClick={() => {
              //fetchRoutes()
              setShowRouteModal(true)
            }}
          >
            <PencilLine size={18} /> 
            <span className="relative top-[1px]">Edit Routes</span>
          </Button>
        </div>
      </div>
   </div>
  )
}