import { resolveGroupMeta } from "@/models/compHelpers";
import { HeatData } from "@/models/domain";
import { ResolvedCompetitorGroup } from "@/models/dtos";
import { formatHeatTimeRange } from "@/utils/datetime";

interface HeatCardProps {
  heat: HeatData;
  index: number;
  customGroups: ResolvedCompetitorGroup[];
  showDate?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function HeatCard({
  heat,
  index,
  customGroups,
  showDate,
  onEdit,
  onDelete,
}: HeatCardProps) {
  return (
    <div className="flex flex-col items-center text-center rounded-md min-w-50 border border-green bg-shadow px-3 py-2 shadow-md">
      {/* Name and Time */}
      {heat.heatName && (
        <div className="text-lg font-semibold">
          {heat.heatName}
        </div>
      )}

      <div className={`${heat.heatName ? 'text-md italic' : 'text-lg font-semibold'}`}>
        {formatHeatTimeRange(
          heat.startTime,
          heat.duration,
          { showDate }
        )}
      </div>

      {/* Capacity, Groups, and Divisions */}
      <div className={`text-sm ${heat.heatName ? '' : 'mt-1'}`}>
        <strong>Capacity: </strong>
        <span>{heat.capacity}</span>
      </div>

      {/* Groups */}
      <div className="text-sm">
        <strong>Groups: </strong>
        {heat.groups.length === 0 && (
          <span>No groups assigned</span>
        )}
        {heat.groups.map(ref => ref.name).join(', ')}
      </div>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="mt-4 flex justify-end gap-4 text-sm">
          {onEdit && (
            <button
              className="text-blue-600"
              onClick={onEdit}
            >
              Edit
            </button>
          )}

          {onDelete && (
            <button
              className="text-red-600"
              onClick={onDelete}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
