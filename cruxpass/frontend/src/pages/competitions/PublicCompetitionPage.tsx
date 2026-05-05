import { useState } from "react";
import { Dot } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import { useLeaderboard } from "@/context/LeaderboardContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { displayDateTime, displayShortDateTime } from "@/utils/datetime";
import { formatAddress, formatCityState, formatGroupDivision } from "@/utils/formatters";
import { CompetitionFormatMap, CompetitionTypeMap, DivisionEnumMap, GroupDivisionKey } from "@/constants/enum";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { getSummaryDefaultGroups, getSummaryDivisions, summarizeHeats } from "@/utils/competitionSummary";

export default function PublicCompetitionPage() {
  const { competition, scores, leaderboardLoading, error } = useLeaderboard();
  const [activeTab, setActiveTab] = useState<"overview" | "leaderboard">("overview");

  if (leaderboardLoading) {
    return (
      <PageContainer>
        <div>Loading competition...</div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div>Error loading competition: {error.message}</div>
      </PageContainer>
    );
  }

  if (!competition) {
    return (
      <PageContainer>
        <div>Competition not found</div>
      </PageContainer>
    );
  }

  const tabStyle = (active: boolean) =>
    `text-xl font-bold ${
      active
        ? "border-b-2 border-green"
        : "border-b-2 text-prompt border-transparent hover:text-select"
    }`;

  const groups = getSummaryDefaultGroups(competition);
  const groupLabels = (competition.selectedGroups ?? []).map(group => group.name).filter(Boolean);
  const divisions = getSummaryDivisions(competition);
  const heatSnapshotParts = summarizeHeats(competition);

  return (
    <PageContainer header={true}>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold mb-2">{competition.name}</h1>
        <div className="flex flex-wrap items-center justify-center font-semibold text-sm gap-4">
          <StatusBadge compStatus={competition.compStatus} className="" />
          <div className="flex flex-wrap items-center justify-center font-semibold text-sm gap-4 opacity-80">
            <Dot size={18} />
            <div>
              <span className="inline lg:hidden">{displayShortDateTime(competition.startDate)}</span>
              <span className="hidden lg:inline">{displayDateTime(competition.startDate)}</span>
            </div>
            <Dot size={18} />
            <div>
              <span className="inline sm:hidden text-muted">{competition.hostGymName}</span>
              <span className="hidden sm:inline lg:hidden">{competition.hostGymName} - {formatCityState(competition.location)}</span>
              <span className="hidden lg:inline">{competition.hostGymName} - {formatAddress(competition.location)}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mt-2 mb-4">
          <div className="flex gap-6">
            <button onClick={() => setActiveTab("overview")} className={tabStyle(activeTab === "overview")}>
              Overview
            </button>
            <button onClick={() => setActiveTab("leaderboard")} className={tabStyle(activeTab === "leaderboard")}>
              Leaderboard
            </button>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="border rounded-md px-3 py-2 bg-shadow shadow-md grid [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-3">
              <div>
                <div className="font-medium">Date & Time:</div>
                <div>{displayDateTime(competition.startDate)}</div>
              </div>
              <div>
                <div className="font-medium">Registration Deadline:</div>
                <div>{displayDateTime(competition.deadline)}</div>
              </div>
              <div>
                <div className="font-medium">Location:</div>
                <div>{formatAddress(competition.location).split("\n").map((line, idx) => <div key={idx}>{line}</div>)}</div>
              </div>
              <div>
                <div className="font-medium">Host Gym:</div>
                <div>{competition.hostGymName}</div>
              </div>
              <div>
                <div className="font-medium">Format:</div>
                <div>{CompetitionFormatMap[competition.compFormat as keyof typeof CompetitionFormatMap]}</div>
              </div>
              <div>
                <div className="font-medium">Type(s):</div>
                <div>{competition.types.map(t => CompetitionTypeMap[t as keyof typeof CompetitionTypeMap]).join(", ")}</div>
              </div>
            </div>

            <div className="rounded-md shadow-md border px-3 py-2 bg-shadow">
              <h2 className="text-xl font-bold mb-1">Eligible Competitor Groups</h2>
              <div>{groupLabels.length > 0 ? groupLabels.join(", ") : "—"}</div>
            </div>

            <div className="rounded-md shadow-md border px-3 py-2 bg-shadow">
              <h2 className="text-xl font-bold mb-1">Divisions</h2>
              <div>{divisions.map(t => DivisionEnumMap[t as keyof typeof DivisionEnumMap]).join(", ") || "—"}</div>
            </div>

            <div className="rounded-md shadow-md border px-3 py-2 bg-shadow">
              <h2 className="text-xl font-bold mb-1">Heat Snapshot</h2>
              <div>{heatSnapshotParts.length > 0 ? heatSnapshotParts.join(" • ") : "Heat details available after registration."}</div>
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div>
            {groups.map(group =>
              divisions.map(division => {
                const key = `${group}-${division}` as GroupDivisionKey;
                return (
                  <div key={key} className="mb-6">
                    <h2 className="text-lg font-semibold">{formatGroupDivision(group, division)}</h2>
                    <LeaderboardTable submissions={scores[key]} group={group} division={division} />
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
