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
      teamId: game.homeTeamId,
    });

    if (!awayGamesByTeam.has(awayTeamName)) {
      awayGamesByTeam.set(awayTeamName, []);
    }
    awayGamesByTeam.get(awayTeamName)!.push({
      date: game.date,
      teamHalftime: awayHalftime,
      oppHalftime: homeHalftime,
      teamId: game.awayTeamId,
    });
  }

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
  const teamId: string | undefined = games[0]?.teamId;

  if (gamesPlayed === 0) {
    return {
      team: teamName,
      teamId,
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
    teamId,
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

function findTeamDetailOddsLine(
  odds: any[],
  minOdds: number,
  maxOdds: number,
  oddsType: "over" | "under",
): number | null {
  const field = oddsType === "over" ? "overOdd" : "underOdd";

  for (const o of odds) {
    if (o.line % 1 === 0.5 && o[field] >= minOdds && o[field] <= maxOdds)
      return o.line;
  }

  const fallbackRanges = [
    { min: 2.0, max: 2.09 },
    { min: 1.9, max: 1.99 },
    { min: 1.8, max: 1.89 },
    { min: 1.7, max: 1.79 },
    { min: 1.6, max: 1.69 },
    { min: 1.5, max: 1.59 },
    { min: 1.4, max: 1.49 },
  ];

  const userIdx = fallbackRanges.findIndex(
    (r) => r.min === minOdds && r.max === maxOdds,
  );

  if (userIdx !== -1) {
    for (let i = userIdx + 1; i < fallbackRanges.length; i++) {
      const r = fallbackRanges[i];
      for (const o of odds) {
        if (o.line % 1 === 0.5 && o[field] >= r.min && o[field] <= r.max)
          return o.line;
      }
    }
  }

  if (minOdds >= 1.4) {
    for (const o of odds) {
      if (o.line % 1 === 0.5 && o[field] < 1.4) return o.line;
    }
  }

  return null;
}

export async function getTeamDetail(
  teamId: string,
  minOdds = 1.7,
  maxOdds = 1.79,
  oddsType: "over" | "under" = "over",
) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      league: { select: { id: true, name: true, threshold: true } },
      homeGames: {
        include: { awayTeam: true, odds: { orderBy: { line: "asc" } } },
        orderBy: { date: "desc" },
      },
      awayGames: {
        include: { homeTeam: true, odds: { orderBy: { line: "asc" } } },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!team) throw new Error("Team not found");

  const threshold = team.league.threshold;

  const homeGameLog = team.homeGames.map((game) => {
    const teamHT = game.homeFirst + game.homeSecond;
    const oppHT = game.awayFirst + game.awaySecond;
    const total = teamHT + oppHT;
    const oddsLine = findTeamDetailOddsLine(
      game.odds,
      minOdds,
      maxOdds,
      oddsType,
    );
    const oddsHit =
      oddsLine !== null &&
      (oddsType === "over" ? total > oddsLine : total < oddsLine);

    return {
      date: game.date.toISOString(),
      opponent: game.awayTeam.name,
      opponentId: game.awayTeamId,
      location: "home" as const,
      teamHalftime: teamHT,
      oppHalftime: oppHT,
      halftimeTotal: total,
      htResult: teamHT > oppHT ? "win" : teamHT < oppHT ? "loss" : "draw",
      aboveThreshold: teamHT > threshold,
      oddsLine,
      oddsHit,
    };
  });

  const awayGameLog = team.awayGames.map((game) => {
    const teamHT = game.awayFirst + game.awaySecond;
    const oppHT = game.homeFirst + game.homeSecond;
    const total = teamHT + oppHT;
    const oddsLine = findTeamDetailOddsLine(
      game.odds,
      minOdds,
      maxOdds,
      oddsType,
    );
    const oddsHit =
      oddsLine !== null &&
      (oddsType === "over" ? total > oddsLine : total < oddsLine);

    return {
      date: game.date.toISOString(),
      opponent: game.homeTeam.name,
      opponentId: game.homeTeamId,
      location: "away" as const,
      teamHalftime: teamHT,
      oppHalftime: oppHT,
      halftimeTotal: total,
      htResult: teamHT > oppHT ? "win" : teamHT < oppHT ? "loss" : "draw",
      aboveThreshold: teamHT > threshold,
      oddsLine,
      oddsHit,
    };
  });

  const allGames = [...homeGameLog, ...awayGameLog].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const calcAgg = (games: typeof homeGameLog) => {
    const n = games.length;
    if (n === 0) return null;
    const totalHT = games.reduce((s, g) => s + g.teamHalftime, 0);
    const totalHTCon = games.reduce((s, g) => s + g.oppHalftime, 0);
    const htWins = games.filter((g) => g.htResult === "win").length;
    const overThresh = games.filter((g) => g.aboveThreshold).length;
    const oddsGames = games.filter((g) => g.oddsLine !== null);
    const oddsHits = oddsGames.filter((g) => g.oddsHit).length;
    return {
      gamesPlayed: n,
      avgHalftimeScored: totalHT / n,
      avgHalftimeConceded: totalHTCon / n,
      htWins,
      htWinPct: (htWins / n) * 100,
      overThreshold: overThresh,
      overThresholdPct: (overThresh / n) * 100,
      oddsGamesCount: oddsGames.length,
      oddsHitCount: oddsHits,
      oddsHitPct:
        oddsGames.length > 0 ? (oddsHits / oddsGames.length) * 100 : 0,
    };
  };

  // Trend data: last 20 games chronological 
  const trendData = allGames
    .slice(0, 20)
    .reverse()
    .map((g, i) => ({
      game: i + 1,
      date: new Date(g.date).toLocaleDateString(),
      scored: g.teamHalftime,
      conceded: g.oppHalftime,
      total: g.halftimeTotal,
      oddsLine: g.oddsLine,
      oddsHit: g.oddsHit ? 1 : 0,
      threshold,
    }));

  const homeAgg = calcAgg(homeGameLog);
  const awayAgg = calcAgg(awayGameLog as any);
  const allAgg = calcAgg(allGames as any);

  return {
    team: { id: team.id, name: team.name, league: team.league },
    threshold,
    oddsType,
    minOdds,
    maxOdds,
    homeStats: homeAgg,
    awayStats: awayAgg,
    overallStats: allAgg,
    homeGameLog,
    awayGameLog,
    allGames,
    trendData,
  };
}
