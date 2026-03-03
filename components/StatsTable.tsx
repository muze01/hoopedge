import { TeamStats } from "@/types/all.types";
import Link from "next/link";
import { ColInfo } from "@/components/ColInfo";

interface StatsTableProps {
  stats: TeamStats[];
  title: string;
  oddsType: "over" | "under";
  threshold: number;
  sortBy?: "avgPoints" | "avgConceded" | "winLoss";
}

export const StatsTable = ({
  stats,
  title,
  oddsType,
  threshold,
  sortBy = "avgPoints",
}: StatsTableProps) => {
  const dirLabel = oddsType === "over" ? "Over" : "Under";
  const dirSymbol = oddsType === "over" ? ">" : "<";

    const sortedStats = [...stats].sort((a, b) => {
      if (sortBy === "avgConceded") return b.avgConceded - a.avgConceded;
      if (sortBy === "winLoss") return b.wins - b.losses - (a.wins - a.losses);
      return b.avgPoints - a.avgPoints;
    });

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2 text-gray-800">{title}</h2>
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full bg-white text-sm text-gray-900 table-fixed">
          <thead className="bg-gray-100 uppercase text-xs font-semibold text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left border-b w-1/4">Team</th>
              <th
                className={`px-3 py-2 text-right border-b ${sortBy === "avgPoints" ? "text-blue-600" : ""}`}
              >
                Avg Pts
                <ColInfo text="Average halftime points scored per game" />
              </th>
              <th
                className={`px-3 py-2 text-right border-b ${sortBy === "avgConceded" ? "text-blue-600" : ""}`}
              >
                Avg Con
                <ColInfo text="Average halftime points conceded (allowed) per game" />
              </th>
              <th className="px-3 py-2 text-right border-b">
                {dirLabel} {threshold}
                <ColInfo
                  text={`Games where this team scored ${dirSymbol} ${threshold} halftime points`}
                />
              </th>
              <th className="px-3 py-2 text-right border-b">
                % {dirLabel}
                <ColInfo
                  text={`% of games where this team scored ${dirSymbol} ${threshold} halftime points`}
                />
              </th>
              <th className="px-3 py-2 text-right border-b">
                Con.{threshold}
                <ColInfo
                  text={`Games where the opponent scored ${dirSymbol} ${threshold} halftime points`}
                />
              </th>
              <th className="px-3 py-2 text-right border-b">
                Con.%
                <ColInfo
                  text={`% of games where the opponent scored ${dirSymbol} ${threshold} halftime points`}
                />
              </th>
              <th
                className={`px-3 py-2 text-center border-b ${sortBy === "winLoss" ? "text-blue-600" : ""}`}
              >
                W-L
                <ColInfo text="Halftime wins vs losses. Draws are excluded." />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedStats.map((stat, idx) => (
              <tr
                key={stat.team}
                className={`hover:bg-blue-50 transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-3 py-2 font-medium border-r">
                  {stat.teamId ? (
                    <Link
                      href={`/analytics/team/${stat.teamId}`}
                      className="hover:text-blue-600 hover:underline transition-colors"
                    >
                      {stat.team}
                    </Link>
                  ) : (
                    stat.team
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {stat.avgPoints.toFixed(1)}
                </td>
                <td className="px-3 py-2 text-right">
                  {stat.avgConceded.toFixed(1)}
                </td>
                <td className="px-3 py-2 text-right text-gray-500">
                  {oddsType === "over"
                    ? stat.aboveThreshold
                    : stat.gamesPlayed - stat.aboveThreshold}
                </td>
                <td className="px-3 py-2 text-right">
                  {oddsType === "over"
                    ? stat.aboveThresholdPct.toFixed(0)
                    : (100 - stat.aboveThresholdPct).toFixed(0)}
                  %
                </td>
                <td className="px-3 py-2 text-right text-gray-500">
                  {oddsType === "over"
                    ? stat.concededAboveThreshold
                    : stat.gamesPlayed - stat.concededAboveThreshold}
                </td>
                <td className="px-3 py-2 text-right">
                  {oddsType === "over"
                    ? stat.concededAboveThresholdPct.toFixed(0)
                    : (100 - stat.concededAboveThresholdPct).toFixed(0)}
                  %
                </td>
                <td className="px-3 py-2 text-center text-xs">
                  {stat.wins}-{stat.losses}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
