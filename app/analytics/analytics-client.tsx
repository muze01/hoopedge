"use client";

import { useState, useEffect, useRef } from "react";
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

export default function AnalyticsClient({ userRole }: UserRoleClientProps) {
  const [homeStats, setHomeStats] = useState<TeamStats[]>([]);
  const [awayStats, setAwayStats] = useState<TeamStats[]>([]);
  const [oddsDistribution, setOddsDistribution] =
    useState<OddsDistribution | null>(null);
  const [teamRecurrences, setTeamRecurrences] = useState<TeamOddsRecurrence[]>(
    [],
  );
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [oddsLoading, setOddsLoading] = useState(false);
  const [leaguesLoaded, setLeaguesLoaded] = useState(false);

  const featureAccess = getFeatureAccess(userRole);

  // Filters
  const [selectedLeague, setSelectedLeague] = useState<string>("");
  const [threshold] = useState(40);
  const [lastNGames, setLastNGames] = useState<string>("");
  const [appliedLastNGames, setAppliedLastNGames] = useState<
    number | undefined
  >(undefined);
  const [useLastN, setUseLastN] = useState(false);
  const [minOdds, setMinOdds] = useState(1.7);
  const [maxOdds, setMaxOdds] = useState(1.79);
  const isInitialLoad = useRef(true);

  // Matchup analyzer state
  const [homeTeamInput, setHomeTeamInput] = useState("");
  const [awayTeamInput, setAwayTeamInput] = useState("");
  const [availableTeams, setAvailableTeams] = useState<TeamSuggestion[]>([]);
  const [matchupResult, setMatchupResult] = useState<MatchupResult | null>(
    null,
  );
  const [matchupLoading, setMatchupLoading] = useState(false);
  const [matchupError, setMatchupError] = useState<string | null>(null);

  // Predefined odds ranges
  const oddsRanges = [
    { label: "1.40 - 1.49", min: 1.4, max: 1.49 },
    { label: "1.50 - 1.59", min: 1.5, max: 1.59 },
    { label: "1.60 - 1.69", min: 1.6, max: 1.69 },
    { label: "1.70 - 1.79", min: 1.7, max: 1.79 },
    { label: "1.80 - 1.89", min: 1.8, max: 1.89 },
    { label: "1.90 - 1.99", min: 1.9, max: 1.99 },
    { label: "2.00 - 2.09", min: 2.0, max: 2.09 },
  ];

  // Initial effect: Load leagues first, then set default
  useEffect(() => {
    const initializeLeagues = async () => {
      try {
        const response = await fetch(
          "/api/analytics?threshold=40&includeOdds=false",
        );
        const result = await response.json();

        if (result.success && result.leagues.length > 0) {
          setLeagues(result.leagues);

          // Find Liga ACB as default
          const defaultLeague = result.leagues.find(
            (l: League) => l.name === "Liga ACB",
          );

          if (defaultLeague) {
            setSelectedLeague(defaultLeague.id);
          } else {
            // Fallback to first league if Liga ACB not found
            setSelectedLeague(result.leagues[0].id);
          }

          setLeaguesLoaded(true);
        }
      } catch (error) {
        console.error("Failed to load leagues:", error);
        setLoading(false);
      }
    };

    initializeLeagues();
  }, []);

  // Main data fetch effect - only runs when selectedLeague is set
  useEffect(() => {
    if (leaguesLoaded && selectedLeague) {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeague, threshold, appliedLastNGames, leaguesLoaded]);

  // Separate effect for odds - only refetch odds when odds range changes
  useEffect(() => {
    if (
      selectedLeague &&
      !loading &&
      leaguesLoaded &&
      featureAccess.canAccessOddsAnalysis
    ) {
      fetchOddsAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minOdds, maxOdds]);

  // Fetch teams when league changes
  useEffect(() => {
    if (selectedLeague && featureAccess.canAccessMatchupAnalyzer) {
      fetchTeamsForLeague();
      // Reset matchup state when league changes
      setMatchupResult(null);
      setHomeTeamInput("");
      setAwayTeamInput("");
      setMatchupError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeague]);

  const fetchTeamsForLeague = async () => {
    if (!selectedLeague || !featureAccess.canAccessMatchupAnalyzer) return;

    try {
      const response = await fetch(
        `/api/matchup?action=search&leagueId=${selectedLeague}&query=`,
      );
      const result = await response.json();

      if (result.success) {
        setAvailableTeams(result.teams);
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    }
  };

  const fetchAnalytics = async () => {
    if (!selectedLeague) return; // Don't fetch without a league

    setLoading(true);

    // Only show odds loader on initial load
    if (isInitialLoad.current && featureAccess.canAccessOddsAnalysis) {
      setOddsLoading(true);
    }

    try {
      const params = new URLSearchParams({
        threshold: threshold.toString(),
        leagueId: selectedLeague, // Always pass the selected league
      });

      // Only on first load
      if (isInitialLoad.current && featureAccess.canAccessOddsAnalysis) {
        params.append("includeOdds", "true");
      }

      if (appliedLastNGames !== undefined) {
        params.append("lastNGames", appliedLastNGames.toString());
      }
      // if (useLastN && lastNGames) {
      //   params.append("lastNGames", lastNGames.toString());
      // }

      const response = await fetch(`/api/analytics?${params}`);
      const result = await response.json();

      if (result.success) {
        setHomeStats(result.data.homeStats);
        setAwayStats(result.data.awayStats);

        if (result.data.oddsAnalysis && featureAccess.canAccessOddsAnalysis) {
          setOddsDistribution(result.data.oddsAnalysis.distribution);
          setTeamRecurrences(result.data.oddsAnalysis.teamRecurrences);
        }
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);

      if (isInitialLoad.current) {
        setOddsLoading(false);
        isInitialLoad.current = false;
      }
    }
  };

  const fetchOddsAnalysis = async () => {
    if (!selectedLeague || !featureAccess.canAccessOddsAnalysis) return;
    setOddsLoading(true);
    try {
      const params = new URLSearchParams({
        leagueId: selectedLeague,
        minOdds: minOdds.toString(),
        maxOdds: maxOdds.toString(),
      });
      const response = await fetch(`/api/odds-analysis?${params}`);
      const result = await response.json();
      if (result.success) {
        setOddsDistribution(result.data.distribution);
        setTeamRecurrences(result.data.teamRecurrences);
      }
    } catch (error) {
      console.error("Failed to fetch odds analysis:", error);
    } finally {
      setOddsLoading(false);
    }
  };

  const analyzeMatchup = async () => {
    if (!featureAccess.canAccessMatchupAnalyzer) {
      setMatchupError("Upgrade to Pro to access the Matchup Analyzer");
      return;
    }

    if (!homeTeamInput.trim() || !awayTeamInput.trim()) {
      setMatchupError("Please enter both home and away team names");
      return;
    }

    if (!selectedLeague) {
      setMatchupError("Please select a league first");
      return;
    }

    setMatchupLoading(true);
    setMatchupError(null);

    try {
      const params = new URLSearchParams({
        homeTeam: homeTeamInput.trim(),
        awayTeam: awayTeamInput.trim(),
        leagueId: selectedLeague,
        minOdds: minOdds.toString(),
        maxOdds: maxOdds.toString(),
      });

      // if (appliedLastNGames !== undefined) { // this section should have it's own filters don't like that I'm using from the Teams Stats
      //   params.append("lastNGames", appliedLastNGames.toString());
      // }

      const response = await fetch(`/api/matchup?${params}`);
      const result = await response.json();

      if (result.success) {
        setMatchupResult(result.data);
        setMatchupError(null);
      } else {
        setMatchupError(result.error || "Failed to analyze matchup");
        setMatchupResult(null);
      }
    } catch (error) {
      console.error("Matchup analysis failed:", error);
      setMatchupError("An error occurred. Please try again.");
      setMatchupResult(null);
    } finally {
      setMatchupLoading(false);
    }
  };

  // TODO: EVENTUALLY MOVE TO COMPONENTS
  const StatsTable = ({
    stats,
    title,
  }: {
    stats: TeamStats[];
    title: string;
  }) => (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2 text-gray-800">{title}</h2>
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full bg-white text-sm text-gray-900 table-fixed">
          <thead className="bg-gray-100 uppercase text-xs font-semibold text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left border-b w-1/4">Team</th>
              <th
                className="px-3 py-2 text-right border-b cursor-help"
                title="Average points scored by this team per game"
              >
                Avg Pts
              </th>
              <th
                className="px-3 py-2 text-right border-b cursor-help"
                title="Average points conceded (allowed) by this team per game"
              >
                Avg Con
              </th>
              <th
                className="px-3 py-2 text-right border-b cursor-help"
                title={`Number of games where this team scored over ${threshold} points`}
              >
                Over {threshold}
              </th>
              <th
                className="px-3 py-2 text-right border-b cursor-help"
                title={`Percentage of games where this team scored over ${threshold} points`}
              >
                % Over
              </th>
              <th
                className="px-3 py-2 text-right border-b cursor-help"
                title={`Number of games where the OPPONENT scored over ${threshold} points`}
              >
                Con.{threshold}
              </th>
              <th
                className="px-3 py-2 text-right border-b cursor-help"
                title={`Percentage of games where the OPPONENT scored over ${threshold} points`}
              >
                Con.%
              </th>
              <th
                className="px-3 py-2 text-center border-b cursor-help"
                title="Wins - Losses. Note! Stats doesn't include draws"
              >
                W-L
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stats.map((stat, idx) => (
              <tr
                key={stat.team}
                className={`hover:bg-blue-50 transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-3 py-2 font-medium border-r truncate">
                  {stat.team}
                </td>
                <td className="px-3 py-2 text-right">
                  {stat.avgPoints.toFixed(1)}
                </td>
                <td className="px-3 py-2 text-right">
                  {stat.avgConceded.toFixed(1)}
                </td>
                <td className="px-3 py-2 text-right text-gray-500">
                  {stat.aboveThreshold}
                </td>
                <td className="px-3 py-2 text-right">
                  {stat.aboveThresholdPct.toFixed(0)}%
                </td>
                <td className="px-3 py-2 text-right text-gray-500">
                  {stat.concededAboveThreshold}
                </td>
                <td className="px-3 py-2 text-right">
                  {stat.concededAboveThresholdPct.toFixed(0)}%
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

  // TODO: EVENTUALLY MOVE TO COMPONENTS
  const OddsDistributionCard = () => {
    if (!oddsDistribution) return null;

    const getPercentage = (value: number, total: number) =>
      total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";

    return (
      <div className="mb-6 mt-10">
        <h2 className="pt-3 font-bold mb-2 text-gray-800">
          Halftime Total Points Distribution (Relative to Odds Line)
        </h2>

        {/* Warning ONLY if fallback went below 1.40 */}
        {oddsDistribution.fallbackBelow140 && (
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
                <strong>Note:</strong> Some games in this league didn't have
                odds in your selected range or any standard ranges down to 1.40.
                We used available odds below 1.40 for those games.
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
              <span className="font-semibold">
                {oddsDistribution.totalGames}
              </span>
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

  // TODO: EVENTUALLY MOVE TO COMPONENTS
  const TeamRecurrenceTable = () => {
    if (teamRecurrences.length === 0) return null;

    return (
      <div className="mb-6">
        {/* <h2 className="text-xl font-bold mb-2 text-gray-800">
          Most Recurring Teams in Over Odds Halftime Matchups
        </h2> */}
        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="min-w-full bg-white text-sm text-gray-900">
            <thead className="bg-gray-100 uppercase text-xs font-semibold text-gray-700">
              <tr>
                <th className="px-3 py-2 text-left border-b">Team</th>
                <th
                  className="px-3 py-2 text-right border-b cursor-help"
                  title="Number of home games where halftime total went over the odds line"
                >
                  Home
                </th>
                <th
                  className="px-3 py-2 text-right border-b cursor-help"
                  title="Percentage of home games that went over"
                >
                  Home %
                </th>
                <th
                  className="px-3 py-2 text-right border-b cursor-help"
                  title="Number of away games where halftime total went over the odds line"
                >
                  Away
                </th>
                <th
                  className="px-3 py-2 text-right border-b cursor-help"
                  title="Percentage of away games that went over"
                >
                  Away %
                </th>
                <th
                  className="px-3 py-2 text-right border-b cursor-help"
                  title="Total occurrences (home + away)"
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teamRecurrences.map((team, idx) => (
                <tr
                  key={team.team}
                  className={`hover:bg-blue-50 transition-colors ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-3 py-2 font-medium border-r">
                    {team.team}
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <TestUpgradeButton />
      <div className="flex items-center justify-between mb-7 mt-15">
        <h1 className="text-3xl font-bold text-gray-900">Team Analytics</h1>

        {userRole === "FREE" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-sm font-medium text-blue-900">Free Plan</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="bg-slate-50 p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 w-full sm:w-fit">
          <div className="flex flex-col gap-4 sm:gap-5 w-full">
            <div className="w-full">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Select League
              </label>
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="w-full px-3 py-2.5 sm:py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm sm:text-base"
                disabled={!leaguesLoaded}
              >
                {!leaguesLoaded && <option value="">Loading leagues...</option>}
                {leaguesLoaded &&
                  leagues.map((league) => (
                    <option key={league.id} value={league.id}>
                      {league.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700">
                  Last N Games:
                </label>
                <div className="relative group">
                  <svg
                    className="w-4 h-4 text-gray-400 cursor-help"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
                    Limit analysis to each team's last N games
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="number"
                  value={lastNGames}
                  placeholder="All"
                  onChange={(e) => setLastNGames(e.target.value)}
                  className="w-16 px-2 py-1.5 text-center text-gray-500 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                  min="1"
                  max="5"
                />
                <button
                  onClick={() => {
                    const value = parseInt(lastNGames);
                    if (!isNaN(value) && value > 0) {
                      setAppliedLastNGames(value);
                    }
                  }}
                  className="px-3 sm:px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
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
                StatsTable={StatsTable}
              />

              <TeamPerformanceSection
                data={awayStats}
                title="Away Performance"
                location="away"
                threshold={threshold}
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
              // <div className="pt-6 sm:pt-8 border-t-2 border-gray-200">
              <>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                  Odds Analysis
                </h1>

                {/* Odds Range Filter */}
                <div className="bg-slate-50 p-4 rounded-lg shadow-sm border border-slate-200 w-full sm:w-fit mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Select Odds
                  </label>

                  <select
                    value={`${minOdds}-${maxOdds}`}
                    onChange={(e) => {
                      const [min, max] = e.target.value
                        .split("-")
                        .map(parseFloat);
                      setMinOdds(min);
                      setMaxOdds(max);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm sm:text-base"
                  >
                    {oddsRanges.map((range) => (
                      <option
                        key={range.label}
                        value={`${range.min}-${range.max}`}
                      >
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                <OddsDistributionCard />

                <OddsRecurrenceSection
                  data={teamRecurrences}
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

              <button
                onClick={analyzeMatchup}
                disabled={
                  matchupLoading ||
                  !selectedLeague ||
                  !homeTeamInput ||
                  !awayTeamInput
                }
                className="mt-4 w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {matchupLoading ? "Analyzing..." : "Analyze Matchup"}
              </button>
            </div>

            {/* Matchup Results */}
            {matchupResult && (
              <div className="space-y-6">
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
                        <span className="text-gray-900">Over Odds:</span>
                        <span className="font-semibold text-green-600">
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
                        <span className="text-gray-900">Over Odds:</span>
                        <span className="font-semibold text-green-600">
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

                {/* Head-to-Head History */}
                {matchupResult.headToHeadHistory.length > 0 && (
                  <div className="mb-4 sm:mb-6 pt-3">
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
                                {new Date(game.date).toLocaleDateString()}
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
                                    ✓ Over
                                  </span>
                                ) : (
                                  <span className="text-red-600 font-semibold">
                                    ✗ Under
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Home Team Game Log */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold mb-3 text-gray-800">
                      {matchupResult.homeTeam.team} - Recent Home Games
                    </h3>
                    <div className="space-y-2">
                      {matchupResult.homeTeam.gameLog
                        .slice(0, 5)
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
                                {new Date(game.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-900">
                              <span>
                                HT: {game.teamHalftime} - {game.oppHalftime}{" "}
                                (Total: {game.halftimeTotal}) (oddsLine:{" "}
                                {game.oddsLine})
                              </span>
                              {game.wentOver ? (
                                <span className="text-green-600 font-semibold ml-2">
                                  ✓
                                </span>
                              ) : (
                                <span className="text-red-600 font-semibold ml-2">
                                  ✗
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Away Team Game Log */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold mb-3 text-gray-800">
                      {matchupResult.awayTeam.team} - Recent Away Games
                    </h3>
                    <div className="space-y-2">
                      {matchupResult.awayTeam.gameLog
                        .slice(0, 5)
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
                                {new Date(game.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-900">
                              <span>
                                HT: {game.oppHalftime} - {game.teamHalftime}{" "}
                                (Total: {game.halftimeTotal}) (oddsLine:{" "}
                                {game.oddsLine})
                              </span>
                              {game.wentOver ? (
                                <span className="text-green-600 font-semibold ml-2">
                                  ✓
                                </span>
                              ) : (
                                <span className="text-red-600 font-semibold ml-2">
                                  ✗
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
