
export type UserRole = "FREE" | "PRO" | "ADMIN";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
}

export interface FeatureAccess {
  canAccessOddsAnalysis: boolean;
  canAccessMatchupAnalyzer: boolean;
  canAccessAdvancedCharts: boolean;
  canExportData: boolean;
  maxLeagues?: number;
  maxHistoricalGames?: number;
}

export const getFeatureAccess = (role: UserRole): FeatureAccess => {
  switch (role) {
    case "PRO":
    case "ADMIN":
      return {
        canAccessOddsAnalysis: true,
        canAccessMatchupAnalyzer: true,
        canAccessAdvancedCharts: true,
        canExportData: true,
      };
    case "FREE":
    default:
      return {
        canAccessOddsAnalysis: false,
        canAccessMatchupAnalyzer: false,
        canAccessAdvancedCharts: false,
        canExportData: false,
        maxLeagues: 1,
        maxHistoricalGames: 10,
      };
  }
};

export interface UserRoleClientProps {
  userRole: UserRole;
}

export interface OddsDistribution {
  belowLine: number;
  equalToLine: number;
  aboveLine: number;
  noOddsAvailable: number;
  totalGames: number;
  analyzedGames: number;
  fallbackBelow140: boolean;
}

export interface TeamMatchupStats {
  team: string;
  location: "home" | "away";
  gamesPlayed: number;
  avgHalftimePoints: number;
  avgHalftimeConceded: number;
  overOddsCount: number;
  overOddsPercentage: number;
  wins: number;
  losses: number;
  gameLog: GameLogEntry[];
}

export interface GameLogEntry {
  date: string;
  opponent: string;
  halftimeTotal: number;
  teamHalftime: number;
  oppHalftime: number;
  oddsLine: number | null;
  wentOver: boolean;
  result: "win" | "loss" | "draw";
}

export interface HeadToHeadGame {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeHalftime: number;
  awayHalftime: number;
  halftimeTotal: number;
  oddsLine: number | null;
  wentOver: boolean;
}

export interface MatchupResult {
  homeTeam: TeamMatchupStats;
  awayTeam: TeamMatchupStats;
  headToHeadHistory: HeadToHeadGame[];
  oddsType?: "over" | "under";
}

export interface TeamOddsRecurrence {
  team: string;
  teamId: string;
  homeOccurrences: number;
  homeGames: number;
  homePercentage: number;
  awayOccurrences: number;
  awayGames: number;
  awayPercentage: number;
  totalOccurrences: number;
}

export interface League {
  id: string;
  name: string;
  country: string | null;
  season: string | null;
  threshold: number;
}

export interface TeamSuggestion {
  id: string;
  name: string;
}

export interface VerifyEmailClientProps {
  userEmail?: string;
}

export interface TeamPerformanceChartProps {
  data: TeamStats[];
  title: string;
  location: "home" | "away";
  threshold: number;
}

export interface OddsRecurrenceChartProps {
  data: TeamOddsRecurrence[];
  title?: string;
}

export interface OddsDistribution {
  belowLine: number;
  equalToLine: number;
  aboveLine: number;
  noOddsAvailable: number;
  totalGames: number;
  analyzedGames: number;
  fallbackBelow140: boolean; // Only true if had to use odds below 1.40
}

export interface TeamOddsRecurrence {
  team: string;
  homeOccurrences: number;
  homeGames: number;
  homePercentage: number;
  awayOccurrences: number;
  awayGames: number;
  awayPercentage: number;
  totalOccurrences: number;
}

export interface OddsAnalysisResult {
  distribution: OddsDistribution;
  teamRecurrences: TeamOddsRecurrence[];
}

export interface OddsAnalysisOptions {
  leagueId?: string;
  startDate?: Date;
  endDate?: Date;
  minOdds?: number; // e.g., 1.70
  maxOdds?: number; // e.g., 1.79
  oddsType?: "over" | "under";
}

export interface TeamMatchupStats {
  team: string;
  location: "home" | "away";
  gamesPlayed: number;
  avgHalftimePoints: number;
  avgHalftimeConceded: number;
  overOddsCount: number;
  overOddsPercentage: number;
  wins: number;
  losses: number;
  gameLog: GameLogEntry[];
}

export interface MatchupAnalysisResult {
  homeTeam: TeamMatchupStats;
  awayTeam: TeamMatchupStats;
  headToHeadHistory: HeadToHeadGame[];
  oddsType?: "over" | "under";
}

export interface MatchupOptions {
  homeTeamName: string;
  awayTeamName: string;
  leagueId: string;
  minOdds?: number;
  maxOdds?: number;
  lastNGames?: number;
  oddsType?: "over" | "under";
}

export interface TeamStats {
  team: string;
  avgPoints: number;
  avgConceded: number;
  aboveThreshold: number;
  aboveThresholdPct: number;
  concededAboveThreshold: number;
  concededAboveThresholdPct: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
  teamId?: string;
}

export interface AnalyticsResult {
  homeStats: TeamStats[];
  awayStats: TeamStats[];
  threshold?: number;
}

export interface AnalyticsOptions {
  leagueId?: string;
  threshold?: number;
  lastNGames?: number; // If provided, use only last N games per team
  startDate?: Date;
  endDate?: Date;
}

export type GameEntry = {
  date: string;
  opponent: string;
  opponentId: string;
  location: "home" | "away";
  teamHalftime: number;
  oppHalftime: number;
  halftimeTotal: number;
  teamFinal: number;
  oppFinal: number;
  result: "win" | "loss" | "draw";
  htResult: "win" | "loss" | "draw";
  aboveThreshold: boolean;
  oddsLine: number | null;
  oddsHit: boolean;
};

export type AggStats = {
  gamesPlayed: number;
  avgHalftimeScored: number;
  avgHalftimeConceded: number;
  wins: number;
  losses: number;
  htWins: number;
  htWinPct: number;
  overThreshold: number;
  overThresholdPct: number;
  oddsGamesCount: number;
  oddsHitCount: number;
  oddsHitPct: number;
} | null;

export type TeamData = {
  team: {
    id: string;
    name: string;
    league: { id: string; name: string; threshold: number };
  };
  threshold: number;
  oddsType: "over" | "under";
  minOdds: number;
  maxOdds: number;
  homeStats: AggStats;
  awayStats: AggStats;
  overallStats: AggStats;
  homeGameLog: GameEntry[];
  awayGameLog: GameEntry[];
  allGames: GameEntry[];
  trendData: Array<{
    game: number;
    date: string;
    scored: number;
    conceded: number;
    total: number;
    oddsLine: number | null;
    oddsHit: number;
    threshold: number;
  }>;
};
