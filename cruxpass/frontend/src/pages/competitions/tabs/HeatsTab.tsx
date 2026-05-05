import { HeatListResponsive } from "@/components/ui/heat_display/HeatListResponsive";
import { CompetitionEntity, HeatData } from "@/models/domain";
import { ResolvedCompetitorGroup } from "@/models/dtos";

interface Props {
  heats: HeatData[],
  gymCustomGroups: ResolvedCompetitorGroup[],
  setActiveTab: React.Dispatch<React.SetStateAction<"heats" | "registrations" | "overview" | "leaderboard">>,
}

export function HeatsTab({ 
  heats, 
  gymCustomGroups,
  setActiveTab,
} : Props) {
  return (
    <HeatListResponsive 
      heats={heats} 
      customGroups={gymCustomGroups} 
      showDate={false}
    />
  )
}