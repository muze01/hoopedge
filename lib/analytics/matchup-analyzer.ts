// lib/analytics/matchup-analyzer.ts
import { prisma } from "../auth";

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
  date: Date;
  opponent: string;
  halftimeTotal: number;
  teamHalftime: number;
  oppHalftime: number;
  oddsLine: number | null;
  wentOver: boolean;
  result: "win" | "loss" | "draw";
}

export interface MatchupAnalysisResult {
  homeTeam: TeamMatchupStats;
  awayTeam: TeamMatchupStats;
  headToHeadHistory: HeadToHeadGame[];
}

export interface HeadToHeadGame {
  date: Date;
  homeTeam: string;
  awayTeam: string;
  homeHalftime: number;
  awayHalftime: number;
  halftimeTotal: number;
  oddsLine: number | null;
  wentOver: boolean;
}

interface MatchupOptions {
  homeTeamName: string;
  awayTeamName: string;
  leagueId: string;
  minOdds?: number;
  maxOdds?: number;
  lastNGames?: number;
}

export async function analyzeMatchup(
  options: MatchupOptions
): Promise<MatchupAnalysisResult> {
  const {
    homeTeamName,
    awayTeamName,
    leagueId,
    minOdds = 1.70,
    maxOdds = 1.79,
    lastNGames,
  } = options;

  // Find the teams
  const homeTeam = await prisma.team.findFirst({
    where: {
      name: { equals: homeTeamName, mode: "insensitive" },
      leagueId,
    },
  });

  const awayTeam = await prisma.team.findFirst({
    where: {
      name: { equals: awayTeamName, mode: "insensitive" },
      leagueId,
    },
  });

  if (!homeTeam || !awayTeam) {
    throw new Error(
      `Team not found: ${!homeTeam ? homeTeamName : awayTeamName}`
    );
  }

  // Get home team's home games
  const homeTeamHomeGames = await prisma.game.findMany({
    where: {
      homeTeamId: homeTeam.id,
      leagueId,
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      odds: { orderBy: { line: "asc" } },
    },
    orderBy: { date: "desc" },
    take: lastNGames,
  });

  // Get away team's away games
  const awayTeamAwayGames = await prisma.game.findMany({
    where: {
      awayTeamId: awayTeam.id,
      leagueId,
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      odds: { orderBy: { line: "asc" } },
    },
    orderBy: { date: "desc" },
    take: lastNGames,
  });

  // Get head-to-head history
  const headToHeadGames = await prisma.game.findMany({
    where: {
      OR: [
        { homeTeamId: homeTeam.id, awayTeamId: awayTeam.id },
        { homeTeamId: awayTeam.id, awayTeamId: homeTeam.id },
      ],
      leagueId,
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      odds: { orderBy: { line: "asc" } },
    },
    orderBy: { date: "desc" },
    take: 5,
  });

  // Process home team stats
  const homeStats = processTeamStats(
    homeTeam.name,
    "home",
    homeTeamHomeGames,
    minOdds,
    maxOdds
  );

  // Process away team stats
  const awayStats = processTeamStats(
    awayTeam.name,
    "away",
    awayTeamAwayGames,
    minOdds,
    maxOdds
  );

  // Process head-to-head history
  const headToHeadHistory: HeadToHeadGame[] = headToHeadGames.map((game) => {
    const homeHalftime = game.homeFirst + game.homeSecond;
    const awayHalftime = game.awayFirst + game.awaySecond;
    const halftimeTotal = homeHalftime + awayHalftime;

    const oddsLine = findQualifyingOddsLine(game.odds, minOdds, maxOdds);
    const wentOver = oddsLine !== null && halftimeTotal > oddsLine;

    return {
      date: game.date,
      homeTeam: game.homeTeam.name,
      awayTeam: game.awayTeam.name,
      homeHalftime,
      awayHalftime,
      halftimeTotal,
      oddsLine,
      wentOver,
    };
  });

  return {
    homeTeam: homeStats,
    awayTeam: awayStats,
    headToHeadHistory,
  };
}

function processTeamStats(
  teamName: string,
  location: "home" | "away",
  games: any[],
  minOdds: number,
  maxOdds: number
): TeamMatchupStats {
  const gameLog: GameLogEntry[] = [];
  let totalHalftimePoints = 0;
  let totalHalftimeConceded = 0;
  let overOddsCount = 0;
  let wins = 0;
  let losses = 0;

  for (const game of games) {
    const isHome = location === "home";
    const teamHalftime = isHome
      ? game.homeFirst + game.homeSecond
      : game.awayFirst + game.awaySecond;
    const oppHalftime = isHome
      ? game.awayFirst + game.awaySecond
      : game.homeFirst + game.homeSecond;
    const halftimeTotal = teamHalftime + oppHalftime;

    totalHalftimePoints += teamHalftime;
    totalHalftimeConceded += oppHalftime;

    const oddsLine = findQualifyingOddsLine(game.odds, minOdds, maxOdds);
    const wentOver = oddsLine !== null && halftimeTotal > oddsLine;

    if (wentOver) overOddsCount++;

    // Determine result
    let result: "win" | "loss" | "draw";
    const teamTotal = isHome ? game.homeTotalPoints : game.awayTotalPoints;
    const oppTotal = isHome ? game.awayTotalPoints : game.homeTotalPoints;

    if (teamTotal > oppTotal) {
      wins++;
      result = "win";
    } else if (teamTotal < oppTotal) {
      losses++;
      result = "loss";
    } else {
      result = "draw";
    }

    gameLog.push({
      date: game.date,
      opponent: isHome ? game.awayTeam.name : game.homeTeam.name,
      halftimeTotal,
      teamHalftime,
      oppHalftime,
      oddsLine,
      wentOver,
      result,
    });
  }

  const gamesPlayed = games.length;

  return {
    team: teamName,
    location,
    gamesPlayed,
    avgHalftimePoints: gamesPlayed > 0 ? totalHalftimePoints / gamesPlayed : 0,
    avgHalftimeConceded:
      gamesPlayed > 0 ? totalHalftimeConceded / gamesPlayed : 0,
    overOddsCount,
    overOddsPercentage:
      gamesPlayed > 0 ? (overOddsCount / gamesPlayed) * 100 : 0,
    wins,
    losses,
    gameLog,
  };
}

function findQualifyingOddsLine(
  odds: any[],
  minOdds: number,
  maxOdds: number
): number | null {
  // Step 1: Find .5 line within user's selected range
  for (const oddsLine of odds) {
    if (
      oddsLine.line % 1 === 0.5 &&
      oddsLine.overOdd >= minOdds &&
      oddsLine.overOdd <= maxOdds
    ) {
      return oddsLine.line;
    }
  }

  // Step 2: Cascade down through lower ranges
  const fallbackRanges = [
    { min: 2.00, max: 2.09 },
    { min: 1.90, max: 1.99 },
    { min: 1.80, max: 1.89 },
    { min: 1.70, max: 1.79 },
    { min: 1.60, max: 1.69 },
    { min: 1.50, max: 1.59 },
    { min: 1.40, max: 1.49 },
  ];

  // Find which range user selected
  const userRangeIndex = fallbackRanges.findIndex(
    (range) => range.min === minOdds && range.max === maxOdds
  );

  // Try ranges below user's selection
  if (userRangeIndex !== -1) {
    for (let i = userRangeIndex + 1; i < fallbackRanges.length; i++) {
      const range = fallbackRanges[i];
      for (const oddsLine of odds) {
        if (
          oddsLine.line % 1 === 0.5 &&
          oddsLine.overOdd >= range.min &&
          oddsLine.overOdd <= range.max
        ) {
          return oddsLine.line;
        }
      }
    }
  }

  // Step 3: If still not found and user wanted 1.40+, try anything below 1.40
  if (minOdds >= 1.40) {
    for (const oddsLine of odds) {
      if (oddsLine.line % 1 === 0.5 && oddsLine.overOdd < 1.40) {
        return oddsLine.line;
      }
    }
  }

  return null;
}

// Get available teams for autocomplete
export async function searchTeams(
  leagueId: string,
  searchQuery: string
): Promise<Array<{ id: string; name: string }>> {
  const teams = await prisma.team.findMany({
    where: {
      leagueId,
      name: {
        contains: searchQuery,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
    }
  });

  return teams;
}