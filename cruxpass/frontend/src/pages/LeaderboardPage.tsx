import { useParams } from "react-router-dom";
import { GroupDivisionKey } from "@/constants/enum";
import { useLeaderboard } from "@/context/LeaderboardContext";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { formatGroupDivision } from "@/utils/formatters";
import PageContainer from "@/components/PageContainer";
import { getSummaryDefaultGroups, getSummaryDivisions } from "@/utils/competitionSummary";

export default function LeaderboardPage() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const {
    competition,
    scores,
    leaderboardLoading,
    error,
  } = useLeaderboard();
  if (leaderboardLoading) return <div className="h-screen py-6 px-4 bg-background text-green">Loading leaderboard...</div>;
  if (error) return <div className="h-screen py-6 px-4 bg-background text-green">Error leaderboardLoading leaderboard: {error.message}</div>;
  if (!competition) return <div className="h-screen py-6 px-4 bg-background text-green">No competition selected</div>;
  const groups = getSummaryDefaultGroups(competition);
  const divisions = getSummaryDivisions(competition);

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-4">{competition.name} Leaderboard</h1>

      {groups.map(group =>
        divisions.map(division => {
          const key = `${group}-${division}` as GroupDivisionKey;
          console.log("Rendering key:", key, "data:", scores[key]);
          return (
            <div key={key} className="mb-6">
              <h2 className="text-lg font-semibold">{formatGroupDivision(group, division)}</h2>
              <LeaderboardTable submissions={scores[key]} group={group} division={division} />
            </div>
          );
        })
      )}
    </PageContainer>
  );
}
