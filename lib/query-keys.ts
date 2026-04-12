// Centralized query key factory — keeps keys consistent and easy to invalidate

export const queryKeys = {
  // Leagues list (used on initial load)
  leagues: () => ["leagues"] as const,

  // Team stats — depends on league + lastNGames filter
  analytics: (leagueId: string, lastNGames?: number) =>
    ["analytics", leagueId, lastNGames] as const,

  // Odds analysis — depends on league + odds filter
  oddsAnalysis: (
    leagueId: string,
    minOdds: number,
    maxOdds: number,
    oddsType: "over" | "under",
  ) => ["odds-analysis", leagueId, minOdds, maxOdds, oddsType] as const,

  // Matchup — depends on both teams + league + odds filter
  matchup: (
    leagueId: string,
    homeTeam: string,
    awayTeam: string,
    minOdds: number,
    maxOdds: number,
    oddsType: "over" | "under",
  ) =>
    [
      "matchup",
      leagueId,
      homeTeam,
      awayTeam,
      minOdds,
      maxOdds,
      oddsType,
    ] as const,

  // Team search autocomplete
  teamSearch: (leagueId: string) => ["team-search", leagueId] as const,

  // Team detail page
  teamDetail: (
    teamId: string,
    minOdds: number,
    maxOdds: number,
    oddsType: "over" | "under",
  ) => ["team-detail", teamId, minOdds, maxOdds, oddsType] as const,
};
