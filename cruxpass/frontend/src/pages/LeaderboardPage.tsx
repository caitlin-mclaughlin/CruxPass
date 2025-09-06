import { useParams } from "react-router-dom";
import { GroupDivisionKey } from "@/constants/enum";
import { useLeaderboard } from "@/context/LeaderboardContext";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { formatGroupDivision } from "@/utils/formatters";

export default function LeaderboardPage() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const {
    competition,
    scores,
    loading,
    error,
  } = useLeaderboard();
  if (loading) return <div className="h-screen p-8 bg-background text-green">Loading leaderboard...</div>;
  if (error) return <div className="h-screen p-8 bg-background text-green">Error loading leaderboard: {error.message}</div>;
  if (!competition) return <div className="h-screen p-8 bg-background text-green">No competition selected</div>;

  return (
    <div className="flex flex-col p-8 h-screen bg-background text-green">
      <h1 className="text-2xl font-bold mb-4">{competition.name} Leaderboard</h1>

      {competition.competitorGroups.map(group =>
        competition.divisions.map(division => {
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
    </div>
  );
}
