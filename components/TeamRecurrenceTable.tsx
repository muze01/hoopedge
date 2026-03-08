import Link from "next/link";
import { TeamOddsRecurrence } from "@/types/all.types";
import { ColInfo } from "@/components/ColInfo";

export const TeamRecurrenceTable = ({
  teamRecurrences,
  oddsType,
}: {
  teamRecurrences: TeamOddsRecurrence[];
  oddsType: "over" | "under";
}) => {
  if (teamRecurrences?.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full bg-white text-sm text-gray-900">
          <thead className="bg-gray-100 uppercase text-xs font-semibold text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left border-b">Team</th>
              <th className="px-3 py-2 text-right border-b">
                Home
                <ColInfo
                  text={`Home games where halftime total went ${oddsType} the odds line`}
                />
              </th>
              <th className="px-3 py-2 text-right border-b">
                Home %
                <ColInfo text={`% of home games that went ${oddsType}`} />
              </th>
              <th className="px-3 py-2 text-right border-b">
                Away
                <ColInfo
                  text={`Away games where halftime total went ${oddsType} the odds line`}
                />
              </th>
              <th className="px-3 py-2 text-right border-b">
                Away %
                <ColInfo text={`% of away games that went ${oddsType}`} />
              </th>
              <th className="px-3 py-2 text-right border-b">
                Total
                <ColInfo text="Total occurrences (home + away)" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teamRecurrences?.map((team, idx) => (
              <tr
                key={team.team}
                className={`hover:bg-blue-50 transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-3 py-2 font-medium border-r">
                  {team.teamId ? (
                    <Link
                      href={`/analytics/team/${team.teamId}`}
                      className="hover:text-blue-600 hover:underline transition-colors"
                    >
                      {team.team}
                    </Link>
                  ) : (
                    team.team
                  )}
                </td>
                <td className="px-3 py-2 text-right text-gray-500">
                  {team.homeOccurrences}
                </td>
                <td className="px-3 py-2 text-right">
                  {team.homePercentage.toFixed(1)}%
                </td>
                <td className="px-3 py-2 text-right text-gray-500">
                  {team.awayOccurrences}
                </td>
                <td className="px-3 py-2 text-right">
                  {team.awayPercentage.toFixed(1)}%
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  {team.totalOccurrences}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
