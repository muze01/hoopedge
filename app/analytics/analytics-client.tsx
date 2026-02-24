"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TeamPerformanceSection,
  OddsRecurrenceSection,
} from "@/components/charts/TeamCharts";
import {
  TeamStats,
  OddsDistribution,
  TeamOddsRecurrence,
  TeamSuggestion,
  MatchupResult,
  League,
  UserRoleClientProps,
  getFeatureAccess,
  UserRole,
} from "@/types/all.types";
import { ProFeatureBlur } from "@/components/ProFeatureBlur";
import { TestUpgradeButton } from "@/components/TestUpgradeButton";
import { usePaymentSuccess } from "@/hooks/usePaymentSuccess";
// import { SuccessToast } from "@/components/PaymentSuccessHandler";
import {
  useLeagues,
  useAnalytics,
  useOddsAnalysis,
  useMatchup,
  useTeamSearch,
} from "@/hooks/use-analytics";
import { OddsFilterControls } from "@/components/OddsFilterContols";
import { StatsTable } from "@/components/StatsTable";
import { OddsDistributionCard } from "@/components/OddsDistribution";
import { TeamRecurrenceTable } from "@/components/TeamRecurrenceTable";
import { ColInfo } from "@/components/ColInfo";

export default function AnalyticsClient({ userRole }: UserRoleClientProps) {
  const featureAccess = getFeatureAccess(userRole);
  const { showSuccess, paymentReference, handleClose } = usePaymentSuccess();

  // Filter state (drives query keys) 
  const [selectedLeague, setSelectedLeague] = useState<string>("");
  const [lastNGames, setLastNGames] = useState<string>("");
  const [appliedLastNGames, setAppliedLastNGames] = useState<
    number | undefined
  >(undefined);

  // Odds Analysis section
  const [oddsMinOdds, setOddsMinOdds] = useState(1.7);
  const [oddsMaxOdds, setOddsMaxOdds] = useState(1.79);
  const [oddsType, setOddsType] = useState<"over" | "under">("over");

  // Matchup section: team selection + triggered query
  const [homeTeamInput, setHomeTeamInput] = useState("");
  const [awayTeamInput, setAwayTeamInput] = useState("");
  const [matchupMinOdds, setMatchupMinOdds] = useState(1.7);
  const [matchupMaxOdds, setMatchupMaxOdds] = useState(1.79);
  const [matchupOddsType, setMatchupOddsType] = useState<"over" | "under">(
    "over",
  );
  const [matchupEnabled, setMatchupEnabled] = useState(false);

  // Data queries
  // Leagues: fetched once on mount, used to seed selectedLeague
  const { data: leaguesData, isLoading: leaguesLoading } = useLeagues();
  const leagues: League[] = leaguesData?.leagues ?? [];

  // Set default league once leagues load (Liga ACB preferred)
  const [leagueInitialized, setLeagueInitialized] = useState(false);
  if (!leagueInitialized && leagues.length > 0) {
    const defaultLeague =
      leagues.find((l) => l.name === "Liga ACB") ?? leagues[0];
    setSelectedLeague(defaultLeague.id);
    setLeagueInitialized(true);
  }

  // Derived threshold from selected league
  const threshold =
    leagues.find((l) => l.id === selectedLeague)?.threshold ?? 40;

  // Team stats: refetches automatically when league or lastNGames changes
  const { data: analyticsData, isLoading: loading } = useAnalytics(
    selectedLeague,
    appliedLastNGames,
  );
  const homeStats: TeamStats[] = analyticsData?.data.homeStats ?? [];
  const awayStats: TeamStats[] = analyticsData?.data.awayStats ?? [];

  // Odds analysis: refetches on league or filter changes
  const { data: oddsData, isLoading: oddsLoading } = useOddsAnalysis(
    selectedLeague,
    oddsMinOdds,
    oddsMaxOdds,
    oddsType,
    featureAccess.canAccessOddsAnalysis,
  );
  const oddsDistribution: OddsDistribution | null =
    oddsData?.distribution ?? null;
  const teamRecurrences: TeamOddsRecurrence[] = oddsData?.teamRecurrences ?? [];

  // Team search: refetches when league changes, resets matchup
  const { data: teamSearchData } = useTeamSearch(
    selectedLeague,
    featureAccess.canAccessMatchupAnalyzer,
  );
  const availableTeams: TeamSuggestion[] = teamSearchData ?? [];

  // Matchup: only runs when user presses Analyze, re-runs when filters change
  const alreadyAnalyzed =
    matchupEnabled &&
    homeTeamInput !== "" &&
    awayTeamInput !== "" &&
    homeTeamInput !== awayTeamInput;

  const {
    data: matchupResult,
    isLoading: matchupLoading,
    error: matchupQueryError,
  } = useMatchup(
    selectedLeague,
    homeTeamInput,
    awayTeamInput,
    matchupMinOdds,
    matchupMaxOdds,
    matchupOddsType,
    matchupEnabled && featureAccess.canAccessMatchupAnalyzer,
  );

  const matchupError = matchupQueryError?.message ?? null;

  // Handlers
  const handleLeagueChange = (leagueId: string) => {
    setSelectedLeague(leagueId);
    // Reset matchup when league changes
    setMatchupEnabled(false);
    setHomeTeamInput("");
    setAwayTeamInput("");
  };

  const analyzeMatchup = () => {
    if (!homeTeamInput || !awayTeamInput || homeTeamInput === awayTeamInput)
      return;
    setMatchupEnabled(true);
  };

  // Derive the label for the "hit" condition in matchup display
  const matchupHitLabel = matchupOddsType === "under" ? "Under" : "Over";
  const matchupMissLabel = matchupOddsType === "under" ? "Over" : "Under";
  const matchupHitColor = "text-green-600";
  const matchupMissColor = "text-red-600";
  const hitColor = (pct: number) =>
    pct >= 50 ? "text-green-600" : "text-red-500";

  const scoringChartData = matchupResult
    ? [
        {
          name: matchupResult.homeTeam.team,
          Scored: parseFloat(
            matchupResult.homeTeam.avgHalftimePoints.toFixed(1),
          ),
          Conceded: parseFloat(
            matchupResult.homeTeam.avgHalftimeConceded.toFixed(1),
          ),
        },
        {
          name: matchupResult.awayTeam.team,
          Scored: parseFloat(
            matchupResult.awayTeam.avgHalftimePoints.toFixed(1),
          ),
          Conceded: parseFloat(
            matchupResult.awayTeam.avgHalftimeConceded.toFixed(1),
          ),
        },
      ]
    : [];

  const oddsChartData = matchupResult
    ? [
        {
          name: matchupResult.homeTeam.team,
          Hit: parseFloat(matchupResult.homeTeam.overOddsPercentage.toFixed(1)),
          Miss: parseFloat(
            (100 - matchupResult.homeTeam.overOddsPercentage).toFixed(1),
          ),
          hitCount: matchupResult.homeTeam.overOddsCount,
          total: matchupResult.homeTeam.gamesPlayed,
        },
        {
          name: matchupResult.awayTeam.team,
          Hit: parseFloat(matchupResult.awayTeam.overOddsPercentage.toFixed(1)),
          Miss: parseFloat(
            (100 - matchupResult.awayTeam.overOddsPercentage).toFixed(1),
          ),
          hitCount: matchupResult.awayTeam.overOddsCount,
          total: matchupResult.awayTeam.gamesPlayed,
        },
      ]
    : [];

  type HiddenSeries = Record<string, boolean>;
  function orderedLegend(
    order: string[],
    hidden?: HiddenSeries,
    toggle?: (k: string) => void,
  ) {
    return ({ payload }: any) => {
      const sorted = order
        .map((key) => payload?.find((p: any) => p.dataKey === key))
        .filter(Boolean);
      return (
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-3">
          {sorted.map((entry: any) => (
            <li
              key={entry.dataKey}
              onClick={() => toggle?.(entry.dataKey)}
              className={`flex items-center gap-1.5 text-sm select-none ${toggle ? "cursor-pointer" : ""}`}
              style={{ opacity: hidden?.[entry.dataKey] ? 0.35 : 1 }}
            >
              <span
                className="inline-block w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700">{entry.value}</span>
            </li>
          ))}
        </ul>
      );
    };
  }

  // Custom tooltip for HT Scoring Profile (matchup analyzer)
  const ScoringProfileTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const scored = payload.find((p: any) => p.dataKey === "Scored");
    const conceded = payload.find((p: any) => p.dataKey === "Conceded");
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow text-sm">
        <p className="font-semibold mb-1">{label}</p>
        {scored && (
          <p className="text-blue-600">
            Avg HT Scored: <strong>{scored.value}</strong>
          </p>
        )}
        {conceded && (
          <p className="text-red-500">
            Avg HT Conceded: <strong>{conceded.value}</strong>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Success Toast */}
      {/* <SuccessToast
        show={showSuccess}
        message="🎉 Payment Successful!"
        description="Your account has been upgraded to Pro. You now have access to all premium features."
        onClose={handleClose}
      /> */}
      {/* <TestUpgradeButton /> */}
      <div className="flex items-center justify-between mb-7 mt-15">
        <h1 className="text-3xl font-bold text-gray-900">Team Analytics</h1>

        {userRole === "FREE" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-sm font-medium text-blue-900">Free Plan</span>
          </div>
        )}
      </div>

      {/* Global Filters */}
      <div className="mb-8">
        <div className="bg-slate-50 p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 w-full sm:w-fit">
          <div className="flex flex-col gap-4 sm:gap-5 w-full">
            <div className="w-full">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Select League
              </label>
              <select
                value={selectedLeague}
                onChange={(e) => handleLeagueChange(e.target.value)}
                className="w-full px-3 py-2.5 sm:py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm sm:text-base cursor-pointer"
                disabled={leaguesLoading}
              >
                {leaguesLoading && <option value="">Loading leagues...</option>}
                {!leaguesLoading &&
                  leagues.map((league) => (
                    <option key={league.id} value={league.id}>
                      {league.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* League threshold badge */}
            {!leaguesLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Halftime Threshold:</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">
                  {threshold} pts
                </span>
                <span className="text-xs text-gray-400">(set per league)</span>
              </div>
            )}

            <div className="flex flex-col gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700">
                  Last N Games:
                </label>
                <ColInfo text={`Limit analysis to each team's last N games`} />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="number"
                  value={lastNGames}
                  placeholder="All"
                  onChange={(e) => setLastNGames(e.target.value)}
                  className="w-16 px-2 py-1.5 text-center text-gray-500 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                  min="1"
                  max="50"
                />
                <button
                  onClick={() => {
                    const value = parseInt(lastNGames);
                    if (!isNaN(value) && value > 0) {
                      setAppliedLastNGames(value);
                    }
                  }}
                  className="px-3 sm:px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Apply
                </button>
                {appliedLastNGames !== undefined && (
                  <button
                    onClick={() => {
                      setAppliedLastNGames(undefined);
                      setLastNGames("");
                    }}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition-colors"
                    title="Show all games"
                  >
                    Reset
                  </button>
                )}
              </div>

              {appliedLastNGames !== undefined && (
                <div className="text-xs text-green-600 font-medium">
                  ✓ Showing last {appliedLastNGames} games per team
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Team Performance Stats Section */}
      <section className="mt-10">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
              <TeamPerformanceSection
                data={homeStats}
                title="Home Performance"
                location="home"
                threshold={threshold}
                oddsType={oddsType}
                StatsTable={StatsTable}
              />

              <TeamPerformanceSection
                data={awayStats}
                title="Away Performance"
                location="away"
                threshold={threshold}
                oddsType={oddsType}
                StatsTable={StatsTable}
              />
            </div>
          </>
        )}
      </section>

      {/* Odds Analysis Section */}
      <section className="mt-20">
        <ProFeatureBlur
          isBlurred={!featureAccess.canAccessOddsAnalysis}
          featureName="Odds Analysis"
          className="mt-30"
        >
          <div className="pt-8 border-t-2 border-gray-200">
            {oddsLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                  Odds Analysis
                </h1>

                {/* Odds Analysis filter */}
                <div className="bg-slate-50 p-4 rounded-lg shadow-sm border border-slate-200 w-full sm:w-fit mb-6">
                  <OddsFilterControls
                    minOdds={oddsMinOdds}
                    maxOdds={oddsMaxOdds}
                    oddsType={oddsType}
                    onRangeChange={(min, max) => {
                      setOddsMinOdds(min);
                      setOddsMaxOdds(max);
                    }}
                    onTypeChange={setOddsType}
                  />
                </div>

                <OddsDistributionCard oddsDistribution={oddsDistribution} />

                <OddsRecurrenceSection
                  data={teamRecurrences}
                  oddsType={oddsType}
                  TeamRecurrenceTable={TeamRecurrenceTable}
                />
              </>
            )}
          </div>
        </ProFeatureBlur>
      </section>

      {/* Matchup Analyzer Section */}
      <section className="mt-20 mb-10">
        <ProFeatureBlur
          isBlurred={!featureAccess.canAccessMatchupAnalyzer}
          featureName="Matchup Analyzer"
          className="mt-40"
        >
          <div className="pt-6 sm:pt-8 border-t-2 border-gray-200">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">
              Head-to-Head Matchup Analyzer
            </h1>

            {/* Matchup Input */}
            <div className="bg-white border rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Home Team
                  </label>
                  <select
                    value={homeTeamInput}
                    onChange={(e) => setHomeTeamInput(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm sm:text-base"
                    disabled={!selectedLeague || availableTeams.length === 0}
                  >
                    <option value="">-- Select Home Team --</option>
                    {availableTeams.map((team) => (
                      <option key={team.id} value={team.name}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-center hidden md:block">
                  <span className="text-2xl font-bold text-gray-600">VS</span>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Away Team
                  </label>
                  <select
                    value={awayTeamInput}
                    onChange={(e) => setAwayTeamInput(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm sm:text-base"
                    disabled={!selectedLeague || availableTeams.length === 0}
                  >
                    <option value="">-- Select Away Team --</option>
                    {availableTeams.map((team) => (
                      <option key={team.id} value={team.name}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!selectedLeague && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-900">
                    Please select a league first to load teams
                  </p>
                </div>
              )}

              {matchupError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-900">{matchupError}</p>
                </div>
              )}

              {(() => {
                const sameTeam =
                  homeTeamInput !== "" && homeTeamInput === awayTeamInput;
                const isDisabled =
                  matchupLoading ||
                  !selectedLeague ||
                  !homeTeamInput ||
                  !awayTeamInput ||
                  sameTeam ||
                  alreadyAnalyzed;

                return (
                  <button
                    onClick={analyzeMatchup}
                    disabled={isDisabled}
                    className="mt-4 w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {matchupLoading
                      ? "Analyzing..."
                      : sameTeam
                        ? "Same team selected"
                        : alreadyAnalyzed
                          ? "Already Analyzed"
                          : "Analyze Matchup"}
                  </button>
                );
              })()}
            </div>

            {/* Matchup Results */}
            {matchupResult && matchupEnabled && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg shadow-sm border border-slate-200 w-full sm:w-fit">
                  <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">
                    Matchup Odds Filters
                  </p>
                  <OddsFilterControls
                    minOdds={matchupMinOdds}
                    maxOdds={matchupMaxOdds}
                    oddsType={matchupOddsType}
                    onRangeChange={(min, max) => {
                      setMatchupMinOdds(min);
                      setMatchupMaxOdds(max);
                    }}
                    onTypeChange={(t) => {
                      setMatchupOddsType(t);
                    }}
                  />
                </div>

                {/* Stats Comparison Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:mb-6">
                  {/* Home Team Stats */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-1 sm:gap-0">
                      <h3 className="text-sm sm:text-lg font-bold text-gray-900 truncate">
                        {matchupResult.homeTeam.team}
                      </h3>
                      <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-600 text-white text-xs font-semibold rounded-full w-fit">
                        HOME
                      </span>
                    </div>

                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-900">Games Played:</span>
                        <span className="font-semibold text-gray-900">
                          {matchupResult.homeTeam.gamesPlayed}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-900">Avg HT Pts:</span>
                        <span className="font-semibold text-gray-900">
                          {matchupResult.homeTeam.avgHalftimePoints.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-900">Avg HT Con:</span>
                        <span className="font-semibold text-gray-900">
                          {matchupResult.homeTeam.avgHalftimeConceded.toFixed(
                            1,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-900">
                          {matchupHitLabel} Odds:
                        </span>
                        <span
                          className={`font-semibold ${hitColor(matchupResult.homeTeam.overOddsPercentage)}`}
                        >
                          {matchupResult.homeTeam.overOddsCount} (
                          {matchupResult.homeTeam.overOddsPercentage.toFixed(1)}
                          %)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-900">Record:</span>
                        <span className="font-semibold text-gray-900">
                          {matchupResult.homeTeam.wins}W-
                          {matchupResult.homeTeam.losses}L
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Away Team Stats */}
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-1 sm:gap-0">
                      <h3 className="text-sm sm:text-lg font-bold text-gray-900 truncate">
                        {matchupResult.awayTeam.team}
                      </h3>
                      <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-red-600 text-white text-xs font-semibold rounded-full w-fit">
                        AWAY
                      </span>
                    </div>

                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-900">Games Played:</span>
                        <span className="font-semibold text-gray-900">
                          {matchupResult.awayTeam.gamesPlayed}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-900">Avg HT Pts:</span>
                        <span className="font-semibold text-gray-900">
                          {matchupResult.awayTeam.avgHalftimePoints.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-900">Avg HT Con:</span>
                        <span className="font-semibold text-gray-900">
                          {matchupResult.awayTeam.avgHalftimeConceded.toFixed(
                            1,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-900">
                          {matchupHitLabel} Odds:
                        </span>
                        <span
                          className={`font-semibold ${hitColor(matchupResult.awayTeam.overOddsPercentage)}`}
                        >
                          {matchupResult.awayTeam.overOddsCount} (
                          {matchupResult.awayTeam.overOddsPercentage.toFixed(1)}
                          %)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-900">Record:</span>
                        <span className="font-semibold text-gray-900">
                          {matchupResult.awayTeam.wins}W-
                          {matchupResult.awayTeam.losses}L
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Matchup Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart 1 — HT Scoring vs Conceding stacked bar */}
                  <div className="bg-white border rounded-lg shadow-sm p-4">
                    <h3 className="font-bold text-gray-800 mb-1">
                      HT Scoring Profile
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Avg halftime scored vs conceded —{" "}
                      {matchupResult.homeTeam.team} home ·{" "}
                      {matchupResult.awayTeam.team} away
                    </p>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        layout="vertical"
                        data={scoringChartData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 11 }}
                          height={40}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 10 }}
                          width={60}
                          tickFormatter={(v) =>
                            v.length > 12 ? `${v.slice(0, 12)}…` : v
                          }
                        />
                        <Tooltip content={<ScoringProfileTooltip />} />
                        <Legend
                          content={orderedLegend(["Scored", "Conceded"])}
                        />
                        <Bar
                          dataKey="Scored"
                          stackId="a"
                          fill="#3b82f6"
                          radius={[0, 0, 0, 0]}
                          name="Scored"
                        />
                        <Bar
                          dataKey="Conceded"
                          stackId="a"
                          fill="#ef4444"
                          radius={[0, 4, 4, 0]}
                          name="Conceded"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Chart 2 — Odds hit/miss 100% stacked bar */}
                  <div className="bg-white border rounded-lg shadow-sm p-4">
                    <h3 className="font-bold text-gray-800 mb-1">
                      Odds Hit Rate
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      {matchupHitLabel} hit % vs miss % —{" "}
                      {matchupResult.homeTeam.team} home ·{" "}
                      {matchupResult.awayTeam.team} away
                    </p>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        layout="vertical"
                        data={oddsChartData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          height={40}
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 10 }}
                          width={50}
                          tickFormatter={(v) =>
                            v.length > 12 ? `${v.slice(0, 12)}…` : v
                          }
                        />
                        <Tooltip
                          formatter={(
                            value: number | undefined,
                            name: string | undefined,
                            props: any,
                          ) => {
                            if (name === "Hit") {
                              const { hitCount, total } = props.payload;
                              return [
                                `${value}% (${hitCount}/${total} games)`,
                                `${matchupHitLabel} Hit`,
                              ];
                            }
                            return [`${value}%`, `${matchupMissLabel} Miss`];
                          }}
                          contentStyle={{ fontSize: 13, borderRadius: 8 }}
                        />
                        <Legend
                          formatter={(value) =>
                            value === "Hit"
                              ? `${matchupHitLabel} Hit %`
                              : `${matchupMissLabel} Miss %`
                          }
                        />
                        <Bar
                          dataKey="Hit"
                          stackId="b"
                          fill="#22c55e"
                          radius={[0, 0, 0, 0]}
                          name="Hit"
                        />
                        <Bar
                          dataKey="Miss"
                          stackId="b"
                          fill="#575252"
                          radius={[0, 4, 4, 0]}
                          name="Miss"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Head-to-Head History */}
                {matchupResult.headToHeadHistory.length > 0 && (
                  <div className="mb-4 mt-10 sm:mb-6 pt-3">
                    <h3 className="text-base sm:text-lg font-bold mb-3 text-gray-800">
                      Head-to-Head History
                    </h3>
                    <div className="overflow-x-auto border rounded-lg shadow-sm">
                      <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left border-b">
                              Date
                            </th>
                            <th className="px-4 py-2 text-left border-b">
                              Matchup
                            </th>
                            <th className="px-4 py-2 text-right border-b">
                              HT Total
                            </th>
                            <th className="px-4 py-2 text-right border-b">
                              Line
                            </th>
                            <th className="px-4 py-2 text-center border-b">
                              Result
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {matchupResult.headToHeadHistory.map((game, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-xs">
                                {new Date(game.date).toLocaleDateString(
                                  "en-GB",
                                )}
                              </td>
                              <td className="px-4 py-2 text-xs">
                                {game.homeTeam} vs {game.awayTeam}
                                <div className="text-xs text-gray-900">
                                  ({game.homeHalftime} - {game.awayHalftime})
                                </div>
                              </td>
                              <td className="px-4 py-2 text-right font-semibold text-xs">
                                {game.halftimeTotal}
                              </td>
                              <td className="px-4 py-2 text-right text-xs">
                                {game.oddsLine?.toFixed(1) || "—"}
                              </td>
                              <td className="px-4 py-2 text-xs text-center">
                                {game.wentOver ? (
                                  <span className="text-green-600 font-semibold">
                                    ✓ {matchupHitLabel}
                                  </span>
                                ) : (
                                  <span className="text-red-600 font-semibold">
                                    ✗ {matchupMissLabel}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Game Logs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-15">
                  {/* Home Team Game Log */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold mb-3 text-gray-800">
                      {matchupResult.homeTeam.team} - Home Games
                    </h3>
                    <div className="space-y-2">
                      {matchupResult.homeTeam.gameLog
                        // .slice(0, 5)
                        .map((game, idx) => (
                          <div
                            key={idx}
                            className="p-2 sm:p-3 bg-white border rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {matchupResult.homeTeam.team} vs {game.opponent}
                              </span>
                              <span className="text-xs text-gray-900">
                                {new Date(game.date).toLocaleDateString(
                                  "en-GB",
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-900">
                              <span>
                                HT: {game.teamHalftime} - {game.oppHalftime}{" "}
                                (Total: {game.halftimeTotal}) (Line:{" "}
                                {game.oddsLine?.toFixed(1) ?? "—"})
                              </span>
                              {game.wentOver ? (
                                <span
                                  className={`${matchupHitColor} font-semibold`}
                                >
                                  ✓ {matchupHitLabel}
                                </span>
                              ) : (
                                <span
                                  className={`${matchupMissColor} font-semibold`}
                                >
                                  ✗ {matchupMissLabel}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Away Team Game Log */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold mb-3 text-gray-800 sm:mt-0 mt-5">
                      {matchupResult.awayTeam.team} - Away Games
                    </h3>
                    <div className="space-y-2">
                      {matchupResult.awayTeam.gameLog
                        // .slice(0, 5)
                        .map((game, idx) => (
                          <div
                            key={idx}
                            className="p-2 sm:p-3 bg-white border rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {game.opponent} vs {matchupResult.awayTeam.team}
                              </span>
                              <span className="text-xs text-gray-900">
                                {new Date(game.date).toLocaleDateString(
                                  "en-GB",
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-900">
                              <span>
                                HT: {game.oppHalftime} - {game.teamHalftime}{" "}
                                (Total: {game.halftimeTotal}) (Line:{" "}
                                {game.oddsLine?.toFixed(1) ?? "—"})
                              </span>
                              {game.wentOver ? (
                                <span
                                  className={`${matchupHitColor} font-semibold`}
                                >
                                  ✓ {matchupHitLabel}
                                </span>
                              ) : (
                                <span
                                  className={`${matchupMissColor} font-semibold`}
                                >
                                  ✗ {matchupMissLabel}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ProFeatureBlur>
      </section>
    </div>
  );
}
