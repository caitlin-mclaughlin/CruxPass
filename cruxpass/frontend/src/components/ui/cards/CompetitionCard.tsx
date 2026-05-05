import { CompetitionEntity } from "@/models/domain"
import { useNavigate } from "react-router-dom"
import { Button } from "../Button";
import { CompetitionTypeMap } from "@/constants/enum";
import { displayDateTime } from "@/utils/datetime";
import { Info } from "lucide-react";

interface Props {
  comp: CompetitionEntity
}
export function CompetitionCard({ comp }: Props) {
  const navigate = useNavigate();

  return (
    <div
      key={comp.id}
      className="
        flex flex-col
        flex-shrink-0
        px-3 py-2
        min-w-[250px] max-w-[350px]
        rounded-md shadow-md
        bg-background border border-green text-green
      "
    >
      <div className="text-med truncate flex justify-center"><strong>{comp.name}</strong></div>
        <div className="text-sm"><strong>Date: </strong>{displayDateTime(comp.startDate)}</div>
        <div className="text-sm"><strong>Format: </strong>
          {comp.types.map((t: string) => CompetitionTypeMap[t as keyof typeof CompetitionTypeMap]).join(", ")}
        </div>
        <div className="text-sm"><strong>Groups: </strong>
          {comp.selectedGroups.map(group => group.name).join(", ")}
      </div>
      <div className="flex justify-center mt-auto pt-1">
        <Button onClick={() => navigate(`/competitions/${comp.id}`, { state: { redirectTo: `/` } })}>
          <Info size={18} />
          <span className="relative top-[1px]">See Details</span>
        </Button>
      </div>
    </div>
  )
}