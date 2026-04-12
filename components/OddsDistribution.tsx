import { OddsDistribution } from "@/types/all.types";

export const OddsDistributionCard = ({
  oddsDistribution,
}: {
  oddsDistribution: OddsDistribution | null;
}) => {
  if (!oddsDistribution) return null;

  const getPercentage = (value: number, total: number) =>
    total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";

  return (
    <div className="mb-6 mt-10">
      <h2 className="pt-3 font-bold mb-2 text-gray-800">
        Halftime Total Points Distribution (Relative to Odds Line)
      </h2>

      {/* Warning only if some games fell all the way through to below 1.40 */}
      {oddsDistribution.fallbackBelow140Count > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-yellow-800">
              <strong>Note:</strong> {oddsDistribution.fallbackBelow140Count}{" "}
              game
              {oddsDistribution.fallbackBelow140Count > 1 ? "s" : ""} had no
              odds available in your selected range or any standard range down
              to 1.40. The best available odds (below 1.40) were used for{" "}
              {oddsDistribution.fallbackBelow140Count > 1
                ? "those games"
                : "that game"}
              .
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm font-medium text-green-700 mb-1">
              Above Odds Line
            </div>
            <div className="text-2xl font-bold text-green-900">
              {oddsDistribution.aboveLine}
            </div>
            <div className="text-sm text-green-600">
              {getPercentage(
                oddsDistribution.aboveLine,
                oddsDistribution.analyzedGames,
              )}
              % of analyzed games
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm font-medium text-red-700 mb-1">
              Below Odds Line
            </div>
            <div className="text-2xl font-bold text-red-900">
              {oddsDistribution.belowLine}
            </div>
            <div className="text-sm text-red-600">
              {getPercentage(
                oddsDistribution.belowLine,
                oddsDistribution.analyzedGames,
              )}
              % of analyzed games
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-1">
              No Odds Available
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {oddsDistribution.noOddsAvailable}
            </div>
            <div className="text-sm text-gray-600">
              {getPercentage(
                oddsDistribution.noOddsAvailable,
                oddsDistribution.totalGames,
              )}
              % of total games
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
          <div className="flex justify-between mb-1">
            <span>Total Games:</span>
            <span className="font-semibold">{oddsDistribution.totalGames}</span>
          </div>
          <div className="flex justify-between">
            <span>Games with Qualifying Odds:</span>
            <span className="font-semibold">
              {oddsDistribution.analyzedGames}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
