import { prisma } from "@/lib/db";
import {
  AnalyticsOptions,
  AnalyticsResult,
  TeamStats,
} from "@/types/all.types";

export async function calculateTeamAnalytics(
  options: AnalyticsOptions = {},
): Promise<AnalyticsResult> {
  const { leagueId, lastNGames, startDate, endDate = new Date() } = options;

  // Build query filters
  const whereClause: any = {
    date: { lte: endDate },
  };

  if (leagueId) {
    whereClause.leagueId = leagueId;
  }

  if (startDate) {
    whereClause.date.gte = startDate;
  }

  let threshold = 40;
  if (leagueId) {
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      select: { threshold: true },
    });
    if (league) {
      threshold = league.threshold;
    }
  }

  // Fetch all games with team relations
  const games = await prisma.game.findMany({
    where: whereClause,
    include: {
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: { date: "desc" },
  });

  // Group games by team
  const homeGamesByTeam = new Map<string, any[]>();
  const awayGamesByTeam = new Map<string, any[]>();

  for (const game of games) {
    const homeTeamName = game.homeTeam.name;
    const awayTeamName = game.awayTeam.name;

    const homeHalftime = game.homeFirst + game.homeSecond;
    const awayHalftime = game.awayFirst + game.awaySecond;

    if (!homeGamesByTeam.has(homeTeamName)) {
      homeGamesByTeam.set(homeTeamName, []);
    }
    homeGamesByTeam.get(homeTeamName)!.push({
      date: game.date,
      teamHalftime: homeHalftime,
      oppHalftime: awayHalftime,
    });

    if (!awayGamesByTeam.has(awayTeamName)) {
      awayGamesByTeam.set(awayTeamName, []);
    }
    awayGamesByTeam.get(awayTeamName)!.push({
      date: game.date,
      teamHalftime: awayHalftime,
      oppHalftime: homeHalftime,
    });
  }

  // Calculate stats for home teams
  const homeStats: TeamStats[] = [];
  for (const [teamName, teamGames] of homeGamesByTeam.entries()) {
    const sortedGames = teamGames.sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
    const gamesToAnalyze = lastNGames
      ? sortedGames.slice(0, lastNGames)
      : sortedGames;
    homeStats.push(calculateStats(teamName, gamesToAnalyze, threshold));
  }

  // Calculate stats for away teams
  const awayStats: TeamStats[] = [];
  for (const [teamName, teamGames] of awayGamesByTeam.entries()) {
    const sortedGames = teamGames.sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
    const gamesToAnalyze = lastNGames
      ? sortedGames.slice(0, lastNGames)
      : sortedGames;
    awayStats.push(calculateStats(teamName, gamesToAnalyze, threshold));
  }

  homeStats.sort((a, b) => b.avgPoints - a.avgPoints);
  awayStats.sort((a, b) => b.avgPoints - a.avgPoints);

  return { homeStats, awayStats, threshold };
}

function calculateStats(
  teamName: string,
  games: any[],
  threshold: number,
): TeamStats {
  const gamesPlayed = games.length;

  if (gamesPlayed === 0) {
    return {
      team: teamName,
      avgPoints: 0,
      avgConceded: 0,
      aboveThreshold: 0,
      aboveThresholdPct: 0,
      concededAboveThreshold: 0,
      concededAboveThresholdPct: 0,
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
    };
  }

  const totalPoints = games.reduce((sum, g) => sum + g.teamHalftime, 0);
  const totalConceded = games.reduce((sum, g) => sum + g.oppHalftime, 0);

  const aboveThreshold = games.filter((g) => g.teamHalftime > threshold).length;
  const concededAboveThreshold = games.filter(
    (g) => g.oppHalftime > threshold,
  ).length;

  const wins = games.filter((g) => g.teamHalftime > g.oppHalftime).length;
  const losses = games.filter((g) => g.teamHalftime < g.oppHalftime).length;

  return {
    team: teamName,
    avgPoints: totalPoints / gamesPlayed,
    avgConceded: totalConceded / gamesPlayed,
    aboveThreshold,
    aboveThresholdPct: (aboveThreshold / gamesPlayed) * 100,
    concededAboveThreshold,
    concededAboveThresholdPct: (concededAboveThreshold / gamesPlayed) * 100,
    wins,
    losses,
    gamesPlayed,
  };
}

// Get available leagues for filtering
export async function getLeagues() {
  return await prisma.league.findMany({
    select: {
      id: true,
      name: true,
      country: true,
      season: true,
      threshold: true,
    },
    orderBy: { name: "asc" },
  });
}
