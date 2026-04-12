import {
  OddsAnalysisOptions,
  OddsAnalysisResult,
  OddsDistribution,
  TeamOddsRecurrence,
} from "@/types/all.types";
import { prisma } from "@/lib/db";

export async function analyzeOddsPerformance(
  options: OddsAnalysisOptions = {},
): Promise<OddsAnalysisResult> {
  const {
    leagueId,
    startDate,
    endDate = new Date(),
    minOdds = 1.7,
    maxOdds = 1.79,
    oddsType = "over",
  } = options;

  const whereClause: any = {
    date: { lte: endDate },
  };

  if (leagueId) {
    whereClause.leagueId = leagueId;
  }

  if (startDate) {
    whereClause.date.gte = startDate;
  }

  const games = await prisma.game.findMany({
    where: whereClause,
    include: {
      homeTeam: true,
      awayTeam: true,
      odds: {
        orderBy: { line: "asc" },
      },
    },
    orderBy: { date: "asc" },
  });

  const distribution: OddsDistribution = {
    belowLine: 0,
    equalToLine: 0,
    aboveLine: 0,
    noOddsAvailable: 0,
    totalGames: games.length,
    analyzedGames: 0,
    // Number of games where we fell back to odds below 1.40
    fallbackBelow140Count: 0,
  };

  const teamOccurrences = new Map<
    string,
    {
      teamId: string;
      home: number;
      away: number;
      homeGames: number;
      awayGames: number;
    }
  >();

  for (const game of games) {
    const homeTeamName = game.homeTeam.name;
    const awayTeamName = game.awayTeam.name;

    const homeHalftime = game.homeFirst + game.homeSecond;
    const awayHalftime = game.awayFirst + game.awaySecond;
    const halftimeTotal = homeHalftime + awayHalftime;

    if (!teamOccurrences.has(homeTeamName)) {
      teamOccurrences.set(homeTeamName, {
        teamId: game.homeTeam.id,
        home: 0,
        away: 0,
        homeGames: 0,
        awayGames: 0,
      });
    }
    if (!teamOccurrences.has(awayTeamName)) {
      teamOccurrences.set(awayTeamName, {
        teamId: game.awayTeam.id,
        home: 0,
        away: 0,
        homeGames: 0,
        awayGames: 0,
      });
    }

    teamOccurrences.get(homeTeamName)!.homeGames++;
    teamOccurrences.get(awayTeamName)!.awayGames++;

    const { selectedLine, usedFallbackBelow140 } = findQualifyingOddsLine(
      game.odds,
      minOdds,
      maxOdds,
      oddsType,
    );

    if (usedFallbackBelow140) {
      distribution.fallbackBelow140Count++;
    }

    if (selectedLine === null) {
      distribution.noOddsAvailable++;
      continue;
    }

    distribution.analyzedGames++;

    const hitCondition =
      oddsType === "over"
        ? halftimeTotal > selectedLine
        : halftimeTotal < selectedLine;

    if (halftimeTotal < selectedLine) {
      distribution.belowLine++;
    } else if (halftimeTotal === selectedLine) {
      distribution.equalToLine++;
    } else {
      distribution.aboveLine++;
    }

    if (hitCondition) {
      teamOccurrences.get(homeTeamName)!.home++;
      teamOccurrences.get(awayTeamName)!.away++;
    }
  }

  const teamRecurrences: TeamOddsRecurrence[] = [];

  for (const [teamName, counts] of teamOccurrences.entries()) {
    const homePercentage =
      counts.homeGames > 0 ? (counts.home / counts.homeGames) * 100 : 0;
    const awayPercentage =
      counts.awayGames > 0 ? (counts.away / counts.awayGames) * 100 : 0;

    teamRecurrences.push({
      team: teamName,
      teamId: counts.teamId,
      homeOccurrences: counts.home,
      homeGames: counts.homeGames,
      homePercentage,
      awayOccurrences: counts.away,
      awayGames: counts.awayGames,
      awayPercentage,
      totalOccurrences: counts.home + counts.away,
    });
  }

  teamRecurrences.sort((a, b) => b.totalOccurrences - a.totalOccurrences);

  return {
    distribution,
    teamRecurrences,
  };
}

function findQualifyingOddsLine(
  odds: any[],
  minOdds: number,
  maxOdds: number,
  oddsType: "over" | "under",
): { selectedLine: number | null; usedFallbackBelow140: boolean } {
  const oddField = oddsType === "over" ? "overOdd" : "underOdd";

  // Step 1: Find .5 line within user's selected range
  for (const oddsLine of odds) {
    if (
      oddsLine.line % 1 === 0.5 &&
      oddsLine[oddField] >= minOdds &&
      oddsLine[oddField] <= maxOdds
    ) {
      return { selectedLine: oddsLine.line, usedFallbackBelow140: false };
    }
  }

  // Step 2: Cascade down through lower ranges
  const fallbackRanges = [
    { min: 2.0, max: 2.09 },
    { min: 1.9, max: 1.99 },
    { min: 1.8, max: 1.89 },
    { min: 1.7, max: 1.79 },
    { min: 1.6, max: 1.69 },
    { min: 1.5, max: 1.59 },
    { min: 1.4, max: 1.49 },
  ];

  const userRangeIndex = fallbackRanges.findIndex(
    (range) => range.min === minOdds && range.max === maxOdds,
  );

  if (userRangeIndex !== -1) {
    for (let i = userRangeIndex + 1; i < fallbackRanges.length; i++) {
      const range = fallbackRanges[i];
      for (const oddsLine of odds) {
        if (
          oddsLine.line % 1 === 0.5 &&
          oddsLine[oddField] >= range.min &&
          oddsLine[oddField] <= range.max
        ) {
          return { selectedLine: oddsLine.line, usedFallbackBelow140: false };
        }
      }
    }
  }

  // Step 3: Last resort - anything below 1.40 with a .5 line
  // Only reached if ALL ranges down to 1.40 were exhausted
  for (const oddsLine of odds) {
    if (oddsLine.line % 1 === 0.5 && oddsLine[oddField] < 1.4) {
      return { selectedLine: oddsLine.line, usedFallbackBelow140: true };
    }
  }

  return { selectedLine: null, usedFallbackBelow140: false };
}
