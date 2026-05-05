import { ReactNode } from "react";
import { CompetitionFormatMap, CompetitionTypeMap, DivisionEnumMap } from "@/constants/enum";
import { CompetitionEntity } from "@/models/domain";
import { displayDateTime } from "@/utils/datetime";
import { formatAddress, formatCityState } from "@/utils/formatters";
import { getSummaryDivisions, summarizeHeats } from "@/utils/competitionSummary";

interface CompetitionSummaryCardProps {
  competition: CompetitionEntity;
  isHost: boolean;
  isRegistered?: boolean;
  expanded: boolean;
  onToggle: () => void;
  action?: ReactNode;
}

export function CompetitionSummaryCard({
  competition,
  isHost,
  isRegistered = false,
  expanded,
  onToggle,
  action,
}: CompetitionSummaryCardProps) {
  const competitionTypes = Array.isArray(competition.types) ? competition.types : [];
  const competitionGroups = (competition.selectedGroups ?? []).map(g => g.name).filter(Boolean);
  const competitionDivisions = getSummaryDivisions(competition);
  const heatSnapshotParts = summarizeHeats(competition);

  const heatSnapshot = heatSnapshotParts.length > 0
    ? heatSnapshotParts.join(" • ")
    : "Heat/group details TBD";

  const typeLabel = competition.types.length > 1
    ? "Types:"
    : "Type:";

  return (
    <div
      className={`border px-3 py-2 rounded-md shadow-md flex items-start justify-between gap-4 ${
        isHost ? "bg-shadow border-highlight text-highlight" : "bg-shadow text-green"
      }`}
    >
      <div className="min-w-0">
        <button
          type="button"
          className="flex items-center gap-2 mb-1 font-semibold cursor-pointer text-left"
          onClick={onToggle}
        >
          <span className="break-words font-bold">{competition.name}</span>
          <span className={`transform -translate-y-[1px] transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
          {competition.compStatus === "LIVE" && (
            <span className="flex px-3 font-semibold text-background bg-accent rounded-md">LIVE</span>
          )}
        </button>

        {!expanded && (
          <div className="text-sm space-y-1">
            <div>{displayDateTime(competition.startDate)}</div>
            <div>{competition.hostGymName} • {formatCityState(competition.location)}</div>
            <div><strong>Heat Snapshot:</strong> {heatSnapshot}</div>
          </div>
        )}

        {expanded && (
          <div className="text-sm space-y-1">
            <div><strong>Date & Time:</strong> {displayDateTime(competition.startDate)}</div>
            <div><strong>Registration Deadline:</strong> {displayDateTime(competition.deadline)}</div>
            <div><strong>Host Gym:</strong> {competition.hostGymName}</div>
            <div><strong>Location:</strong> {formatAddress(competition.location)}</div>
            <div><strong>Format:</strong> {CompetitionFormatMap[competition.compFormat as keyof typeof CompetitionFormatMap]}</div>
            <div><strong>{typeLabel}</strong> {competitionTypes.length > 0
              ? competitionTypes.map(t => CompetitionTypeMap[t as keyof typeof CompetitionTypeMap]).join(", ")
              : "—"}
            </div>
            <div><strong>Groups:</strong> {competitionGroups.length > 0 ? competitionGroups.join(", ") : "—"}</div>
            <div><strong>Divisions:</strong> {competitionDivisions.length > 0
              ? competitionDivisions.map(t => DivisionEnumMap[t as keyof typeof DivisionEnumMap]).join(", ")
              : "—"}
            </div>
            <div><strong>Heat Snapshot:</strong> {heatSnapshot}</div>
            {isRegistered && (
              <div className="text-highlight">
                <strong>Registered</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {action && (
        <div className="shrink-0 self-center">
          {action}
        </div>
      )}
    </div>
  );
}
