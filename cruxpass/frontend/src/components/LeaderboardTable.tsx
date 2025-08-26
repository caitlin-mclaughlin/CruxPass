// LeaderboardTable.tsx
import { RankedSubmissionDto } from "@/models/dtos";

export function LeaderboardTable({ entries }: { entries: RankedSubmissionDto[] }) {
  return (
    <table className="w-full border border-green">
      <thead>
        <tr className="bg-shadow">
          <th className="p-2 text-center border-r">Place</th>
          <th className="p-2 text-center border-r">Name</th>
          <th className="p-2 text-center border-r">Total Points</th>
          <th className="p-2 text-center">Top Climbs (Points / Attempts)</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(entry => (
          <tr key={entry.name} className="border-t">
            <td className="p-2 text-center border-r">{entry.place}</td>
            <td className="p-2 text-center border-r">{entry.name}</td>
            <td className="p-2 text-center border-r">{entry.totalPoints}</td>
            <td className="p-2 text-center">
              {entry.points.map((pts, i) => (
                <span key={i} className="inline-block mr-2">
                  {pts} / {entry.attempts[i]}
                </span>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
