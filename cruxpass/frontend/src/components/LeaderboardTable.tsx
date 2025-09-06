// LeaderboardTable.tsx
import { CompetitorGroup, Gender } from "@/constants/enum";
import { RankedSubmissionDto } from "@/models/dtos";
import { formatGroupDivision } from "@/utils/formatters";
import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";

type LeaderboardTableProps = {
  submissions?: (RankedSubmissionDto & { movement?: "up" | "same" })[] | null; // only up or same
  group: CompetitorGroup;
  division: Gender;
}

export function LeaderboardTable({ submissions, group, division }: LeaderboardTableProps) {
  const rows = Array.isArray(submissions) ? submissions : [];

  if (rows.length === 0) {
    return (
      <div className="p-4 text-center bg-shadow text-green border border-green rounded-md shadow-md">
        No submissions yet for <strong>{formatGroupDivision(group, division)}</strong>.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-green shadow-md">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-green text-shadow">
            <th className="p-2 text-center border-r">Place</th>
            <th className="p-2 text-center border-r">Name</th>
            <th className="p-2 text-center border-r">Total Points</th>
            <th className="p-2 text-center">Attempts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((sub) => (
            <tr
              key={`${sub.climberName}-${sub.competitorGroup}-${sub.division}`}
              className="bg-shadow border-t"
            >
              <td className="p-2 border-r relative text-center">
                {/* Centered number */}
                <span className="block">{sub.place}</span>

                {/* Arrow positioned to the left of the number */}
                {sub.movement === "up" && (
                  <motion.span
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: -4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <ArrowUp
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-green"
                      size={16}
                    />
                  </motion.span>
                )}
              </td>
              <td className="p-2 text-center border-r">{sub.climberName}</td>
              <td className="p-2 text-center border-r">{sub.totalPoints}</td>
              <td className="p-2 text-center">{sub.totalAttempts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
