// lib/analytics/odds-analysis.ts
import { prisma } from "../auth";

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

interface OddsAnalysisOptions {
  leagueId?: string;
  startDate?: Date;
  endDate?: Date;
  minOdds?: number; // e.g., 1.70
  maxOdds?: number; // e.g., 1.79
}

export async function analyzeOddsPerformance(
  options: OddsAnalysisOptions = {}
): Promise<OddsAnalysisResult> {
  const { 
    leagueId, 
    startDate, 
    endDate = new Date(),
    minOdds = 1.70,
    maxOdds = 1.79
  } = options;

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

  // Fetch all games with their odds
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

  // Initialize tracking structures
  const distribution: OddsDistribution = {
    belowLine: 0,
    equalToLine: 0,
    aboveLine: 0,
    noOddsAvailable: 0,
    totalGames: games.length,
    analyzedGames: 0,
    fallbackBelow140: false,
  };

  const teamOccurrences = new Map<
    string,
    { home: number; away: number; homeGames: number; awayGames: number }
  >();

  // Process each game
  for (const game of games) {
    const homeTeamName = game.homeTeam.name;
    const awayTeamName = game.awayTeam.name;

    // Calculate halftime total
    const homeHalftime = game.homeFirst + game.homeSecond;
    const awayHalftime = game.awayFirst + game.awaySecond;
    const halftimeTotal = homeHalftime + awayHalftime;

    // Initialize team tracking
    if (!teamOccurrences.has(homeTeamName)) {
      teamOccurrences.set(homeTeamName, {
        home: 0,
        away: 0,
        homeGames: 0,
        awayGames: 0,
      });
    }
    if (!teamOccurrences.has(awayTeamName)) {
      teamOccurrences.set(awayTeamName, {
        home: 0,
        away: 0,
        homeGames: 0,
        awayGames: 0,
      });
    }

    teamOccurrences.get(homeTeamName)!.homeGames++;
    teamOccurrences.get(awayTeamName)!.awayGames++;

    // Find qualifying odds line with cascading fallback
    let selectedLine: number | null = null;

    // Step 1: Look for .5 lines within the user's selected range
    for (const oddsLine of game.odds) {
      if (
        oddsLine.line % 1 === 0.5 && 
        oddsLine.overOdd >= minOdds && 
        oddsLine.overOdd <= maxOdds
      ) {
        selectedLine = oddsLine.line;
        break;
      }
    }

    // Step 2: If not found, cascade down through lower ranges.
    if (!selectedLine) {
      // Define all ranges from high to low
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
          for (const oddsLine of game.odds) {
            if (
              oddsLine.line % 1 === 0.5 &&
              oddsLine.overOdd >= range.min &&
              oddsLine.overOdd <= range.max
            ) {              
              selectedLine = oddsLine.line;
              break;
            }
          }
          if (selectedLine) break;
        }
      }
    }

    // Step 3: If still not found and user wanted 1.40+, try anything below 1.40
    if (!selectedLine && minOdds >= 1.40) {
      for (const oddsLine of game.odds) {
        if (oddsLine.line % 1 === 0.5 && oddsLine.overOdd < 1.40) {
          selectedLine = oddsLine.line;
          distribution.fallbackBelow140 = true;
          break;
        }
      }
    }

    // Categorize into distribution
    if (selectedLine === null) {
      distribution.noOddsAvailable++;
      continue;
    }

    distribution.analyzedGames++;

    if (halftimeTotal < selectedLine) {
      distribution.belowLine++;
    } else if (halftimeTotal === selectedLine) {
      distribution.equalToLine++;
    } else {
      distribution.aboveLine++;
      // Track teams that went over
      teamOccurrences.get(homeTeamName)!.home++;
      teamOccurrences.get(awayTeamName)!.away++;
    }
  }

  // Convert team occurrences to array with percentages
  const teamRecurrences: TeamOddsRecurrence[] = [];

  for (const [teamName, counts] of teamOccurrences.entries()) {
    const homePercentage =
      counts.homeGames > 0 ? (counts.home / counts.homeGames) * 100 : 0;
    const awayPercentage =
      counts.awayGames > 0 ? (counts.away / counts.awayGames) * 100 : 0;

    teamRecurrences.push({
      team: teamName,
      homeOccurrences: counts.home,
      homeGames: counts.homeGames,
      homePercentage,
      awayOccurrences: counts.away,
      awayGames: counts.awayGames,
      awayPercentage,
      totalOccurrences: counts.home + counts.away,
    });
  }

  // Sort by total occurrences descending
  teamRecurrences.sort((a, b) => b.totalOccurrences - a.totalOccurrences);

  return {
    distribution,
    teamRecurrences,
  };
}