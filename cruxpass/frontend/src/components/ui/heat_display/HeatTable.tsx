import { resolveGroupMeta } from "@/models/compHelpers";
import { HeatDisplayProps } from "./HeatListResponsive";
import { formatHeatTimeRange } from "@/utils/datetime";
import { Button } from "../Button";

export function HeatTable({ heats, customGroups, onEdit, onDelete }: HeatDisplayProps) {
  if (!heats.length) {
    return <p className="text-muted">No heats defined.</p>;
  }

  const showNameColumn = heats.some(
    heat => heat.heatName && heat.heatName.trim().length > 0
  );

  return (
    <div className="bg-shadow border border-green rounded-md shadow-md overflow-hidden">
      <table className="w-full border-collapse rounded-md">
        <thead>
          <tr className="border-b border-green bg-green rounded-md text-background text-left text-md">
            {showNameColumn && (
              <th className="py-2 px-3 whitespace-nowrap">Heat</th>
            )}
            <th className="py-2 px-3 whitespace-nowrap">Time</th>
            <th className="py-2 px-3">Capacity</th>
            <th className="py-2 px-3">Groups</th>
            <th className="py-2 px-3"></th>
          </tr>
        </thead>

        <tbody>
          {heats.map((heat, idx) => (
            <tr key={heat.id ?? idx} className="border-b border-green last:border-b-0">
              {showNameColumn && (
                <td className="py-2 px-3 font-medium text-left font-semibold whitespace-nowrap">
                  {heat.heatName || ""}
                </td>
              )}
              <td className="py-2 px-3 text-left whitespace-nowrap">
                {formatHeatTimeRange(heat.startTime, heat.duration) ?? '—'}
              </td>

              <td className="py-2 px-3 text-center">
                {heat.capacity ?? '—'}
              </td>

              <td className="py-1 px-3 text-left">
                <div className="flex flex-wrap">
                  {heat.groups.map((g) => g.name).join(', ')}
                </div>
              </td>

              <td className="px-2 text-right">
                <div className="flex">
                {onEdit && (
                  <Button
                    className="mr-2 text-sm"
                    onClick={() => onEdit(heat)}
                  >
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    className="text-sm bg-accent hover:bg-accentHighlight"
                    onClick={() => onDelete(heat)}
                  >
                    Delete
                  </Button>
                )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
