import { resolveGroupMeta } from "@/models/compHelpers";
import { HeatDisplayProps } from "./HeatListResponsive";
import { displayDateTime, formatHeatTimeRange, parseBackendLocal } from "@/utils/datetime";
import { HeatCard } from "../cards/HeatCard";

export function HeatCardList({
  heats,
  customGroups,
  showDate,
  onEdit,
  onDelete,
}: HeatDisplayProps) {
  return (
    <div className="grid [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] gap-2">
      {heats.map((heat, index) => (
        <HeatCard
          key={heat.id ?? index}
          heat={heat}
          index={index}
          customGroups={customGroups}
          showDate={showDate}
          onEdit={onEdit ? () => onEdit(heat) : undefined}
          onDelete={onDelete ? () => onDelete(heat) : undefined}
        />
      ))}
    </div>
  );
}
