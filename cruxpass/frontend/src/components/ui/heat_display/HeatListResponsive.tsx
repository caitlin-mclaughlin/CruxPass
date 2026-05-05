import { HeatData, CompetitorGroupData } from "@/models/domain";
import { HeatCardList } from "./HeatCardList";
import { HeatTable } from "./HeatTable";
import { ResolvedCompetitorGroup } from "@/models/dtos";
import { useMemo } from "react";
import { ensureDate } from "@/utils/datetime";

export interface HeatDisplayProps {
  heats: HeatData[];
  customGroups: ResolvedCompetitorGroup[];
  showDate: boolean;
  onEdit?: (heat: HeatData) => void;
  onDelete?: (heat: HeatData) => void;
}

export function HeatListResponsive({ heats, ...rest }: HeatDisplayProps) {

  const sortedHeats = useMemo(() => {
    if (!heats) return [];

    return [...heats].sort((a, b) => {
      const aDate = ensureDate(a.startTime);
      const bDate = ensureDate(b.startTime);

      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return aDate.getTime() - bDate.getTime();
    });
  }, [heats]);

  return (
    <>
      <div className="hidden md:block">
        <HeatTable {...rest} heats={sortedHeats} />
      </div>

      <div className="md:hidden">
        <HeatCardList {...rest} heats={sortedHeats} />
      </div>
    </>
  );
}
