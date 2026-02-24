import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  League,
  TeamStats,
  OddsDistribution,
  TeamOddsRecurrence,
  MatchupResult,
  TeamSuggestion,
} from "@/types/all.types";

async function fetchLeaguesAndStats(leagueId?: string, lastNGames?: number) {
  const params = new URLSearchParams({ includeOdds: "false" });
  if (leagueId) params.set("leagueId", leagueId);
  if (lastNGames) params.set("lastNGames", lastNGames.toString());
  const res = await fetch(`/api/analytics?${params}`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  const result = await res.json();
  if (!result.success) throw new Error(result.error ?? "Analytics error");
  return result as {
    leagues: League[];
    data: { homeStats: TeamStats[]; awayStats: TeamStats[]; threshold: number };
  };
}

async function fetchOddsAnalysis(
  leagueId: string,
  minOdds: number,
  maxOdds: number,
  oddsType: "over" | "under",
) {
  const params = new URLSearchParams({
    leagueId,
    minOdds: minOdds.toString(),
    maxOdds: maxOdds.toString(),
    oddsType,
  });
  const res = await fetch(`/api/odds-analysis?${params}`);
  if (!res.ok) throw new Error("Failed to fetch odds analysis");
  const result = await res.json();
  if (!result.success) throw new Error(result.error ?? "Odds error");
  return result.data as {
    distribution: OddsDistribution;
    teamRecurrences: TeamOddsRecurrence[];
  };
}

async function fetchMatchup(
  leagueId: string,
  homeTeam: string,
  awayTeam: string,
  minOdds: number,
  maxOdds: number,
  oddsType: "over" | "under",
) {
  const params = new URLSearchParams({
    leagueId,
    homeTeam,
    awayTeam,
    minOdds: minOdds.toString(),
    maxOdds: maxOdds.toString(),
    oddsType,
  });
  const res = await fetch(`/api/matchup?${params}`);
  if (!res.ok) throw new Error("Failed to fetch matchup");
  const result = await res.json();
  if (!result.success) throw new Error(result.error ?? "Matchup error");
  return result.data as MatchupResult;
}

async function fetchTeamSearch(leagueId: string) {
  const params = new URLSearchParams({ action: "search", leagueId, query: "" });
  const res = await fetch(`/api/matchup?${params}`);
  if (!res.ok) throw new Error("Failed to fetch teams");
  const result = await res.json();
  if (!result.success) throw new Error("Team search error");
  return result.teams as TeamSuggestion[];
}

// Hooks
export function useAnalytics(leagueId: string, lastNGames?: number) {
  return useQuery({
    queryKey: queryKeys.analytics(leagueId, lastNGames),
    queryFn: () => fetchLeaguesAndStats(leagueId, lastNGames),
    enabled: !!leagueId,
  });
}

export function useLeagues() {
  return useQuery({
    queryKey: queryKeys.leagues(),
    queryFn: () => fetchLeaguesAndStats(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useOddsAnalysis(
  leagueId: string,
  minOdds: number,
  maxOdds: number,
  oddsType: "over" | "under",
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.oddsAnalysis(leagueId, minOdds, maxOdds, oddsType),
    queryFn: () => fetchOddsAnalysis(leagueId, minOdds, maxOdds, oddsType),
    enabled: !!leagueId && enabled,
  });
}

export function useMatchup(
  leagueId: string,
  homeTeam: string,
  awayTeam: string,
  minOdds: number,
  maxOdds: number,
  oddsType: "over" | "under",
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.matchup(
      leagueId,
      homeTeam,
      awayTeam,
      minOdds,
      maxOdds,
      oddsType,
    ),
    queryFn: () =>
      fetchMatchup(leagueId, homeTeam, awayTeam, minOdds, maxOdds, oddsType),
    enabled:
      !!leagueId &&
      !!homeTeam &&
      !!awayTeam &&
      homeTeam !== awayTeam &&
      enabled,
    staleTime: Infinity,
  });
}

export function useTeamSearch(leagueId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.teamSearch(leagueId),
    queryFn: () => fetchTeamSearch(leagueId),
    enabled: !!leagueId && enabled,
    staleTime: 5 * 60 * 1000,
  });
}
