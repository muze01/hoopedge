import * as fs from "fs";
import * as Papa from "papaparse";
import { prisma } from "../lib/db";

interface GameRow {
  date: string;
  home_team: string;
  home_first: string;
  home_second: string;
  home_third: string;
  home_fourth: string;
  home_total_points: string;
  away_team: string;
  away_first: string;
  away_second: string;
  away_third: string;
  away_fourth: string;
  away_total_points: string;
}

interface OddsRow {
  date: string;
  "Home Team": string;
  "Away Team": string;
  "Line (Points)": string;
  "Over Odd": string;
  "Under Odd": string;
}

// Parse date from format "04 Oct 2025" to Date object
function parseGameDate(dateStr: string): Date {
  const cleaned = dateStr.trim();
  return new Date(cleaned);
}

// Helper function to get or create a team
async function getOrCreateTeam(
  teamName: string,
  leagueId: string
): Promise<string> {
  const team = await prisma.team.upsert({
    where: {
      name_leagueId: {
        name: teamName,
        leagueId: leagueId,
      },
    },
    update: {},
    create: {
      name: teamName,
      leagueId: leagueId,
    },
  });
  return team.id;
}

// Main ingestion function
export async function ingestGamesAndOdds(
  gamesFilePath: string,
  oddsFilePath: string,
  leagueName: string,
  season?: string,
  country?: string
) {
  try {
    console.log(`Starting ingestion for league: ${leagueName}`);

    // 1. Create or get league
    const league = await prisma.league.upsert({
      where: { name: leagueName },
      update: { season, country },
      create: { name: leagueName, season, country },
    });

    console.log(`League ready: ${league.name} (ID: ${league.id})`);

    // 2. Parse games CSV
    const gamesCSV = fs.readFileSync(gamesFilePath, "utf-8");
    const gamesParsed = Papa.parse<GameRow>(gamesCSV, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    console.log(`Parsed ${gamesParsed.data.length} games from CSV`);

    // 3. Parse odds CSV
    const oddsCSV = fs.readFileSync(oddsFilePath, "utf-8");
    const oddsParsed = Papa.parse<OddsRow>(oddsCSV, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    console.log(`Parsed ${oddsParsed.data.length} odds lines from CSV`);

    // 4. Group odds by game
    const oddsMap = new Map<string, OddsRow[]>();

    for (const oddsRow of oddsParsed.data) {
      const key = `${oddsRow.date.trim()}|${oddsRow[
        "Home Team"
      ].trim()}|${oddsRow["Away Team"].trim()}`;
      if (!oddsMap.has(key)) {
        oddsMap.set(key, []);
      }
      oddsMap.get(key)!.push(oddsRow);
    }

    // 5. Extract unique teams and create them
    console.log("Creating teams...");
    const uniqueTeams = new Set<string>();
    for (const gameRow of gamesParsed.data) {
      uniqueTeams.add(gameRow.home_team.trim());
      uniqueTeams.add(gameRow.away_team.trim());
    }

    const teamIdMap = new Map<string, string>();
    let teamsCreated = 0;

    for (const teamName of uniqueTeams) {
      const teamId = await getOrCreateTeam(teamName, league.id);
      teamIdMap.set(teamName, teamId);
      teamsCreated++;
    }

    console.log(`Teams processed: ${teamsCreated}`);

    // 6. Process games and their odds
    let gamesCreated = 0;
    let gamesUpdated = 0;
    let oddsCreated = 0;

    for (const gameRow of gamesParsed.data) {
      const gameDate = parseGameDate(gameRow.date);
      const homeTeamName = gameRow.home_team.trim();
      const awayTeamName = gameRow.away_team.trim();

      const homeTeamId = teamIdMap.get(homeTeamName);
      const awayTeamId = teamIdMap.get(awayTeamName);

      if (!homeTeamId || !awayTeamId) {
        console.error(
          `⚠️  Skipping game: Team not found (${homeTeamName} vs ${awayTeamName})`
        );
        continue;
      }

      // Upsert game
      const game = await prisma.game.upsert({
        where: {
          date_homeTeamId_awayTeamId_leagueId: {
            date: gameDate,
            homeTeamId,
            awayTeamId,
            leagueId: league.id,
          },
        },
        update: {
          homeFirst: parseInt(gameRow.home_first),
          homeSecond: parseInt(gameRow.home_second),
          homeThird: parseInt(gameRow.home_third),
          homeFourth: parseInt(gameRow.home_fourth),
          homeTotalPoints: parseInt(gameRow.home_total_points),
          awayFirst: parseInt(gameRow.away_first),
          awaySecond: parseInt(gameRow.away_second),
          awayThird: parseInt(gameRow.away_third),
          awayFourth: parseInt(gameRow.away_fourth),
          awayTotalPoints: parseInt(gameRow.away_total_points),
        },
        create: {
          date: gameDate,
          homeTeamId,
          awayTeamId,
          homeFirst: parseInt(gameRow.home_first),
          homeSecond: parseInt(gameRow.home_second),
          homeThird: parseInt(gameRow.home_third),
          homeFourth: parseInt(gameRow.home_fourth),
          homeTotalPoints: parseInt(gameRow.home_total_points),
          awayFirst: parseInt(gameRow.away_first),
          awaySecond: parseInt(gameRow.away_second),
          awayThird: parseInt(gameRow.away_third),
          awayFourth: parseInt(gameRow.away_fourth),
          awayTotalPoints: parseInt(gameRow.away_total_points),
          leagueId: league.id,
        },
      });

      if (game.createdAt.getTime() === game.updatedAt.getTime()) {
        gamesCreated++;
      } else {
        gamesUpdated++;
      }

      // Process odds for this game
      const oddsKey = `${gameRow.date.trim()}|${homeTeamName}|${awayTeamName}`;
      const oddsForGame = oddsMap.get(oddsKey) || [];

      for (const oddsRow of oddsForGame) {
        await prisma.oddsline.upsert({
          where: {
            gameId_line: {
              gameId: game.id,
              line: parseFloat(oddsRow["Line (Points)"]),
            },
          },
          update: {
            overOdd: parseFloat(oddsRow["Over Odd"]),
            underOdd: parseFloat(oddsRow["Under Odd"]),
          },
          create: {
            gameId: game.id,
            line: parseFloat(oddsRow["Line (Points)"]),
            overOdd: parseFloat(oddsRow["Over Odd"]),
            underOdd: parseFloat(oddsRow["Under Odd"]),
          },
        });
        oddsCreated++;
      }
    }

    console.log("\n✅ Ingestion completed successfully!");
    console.log(`   Teams processed: ${teamsCreated}`);
    console.log(`   Games created: ${gamesCreated}`);
    console.log(`   Games updated: ${gamesUpdated}`);
    console.log(`   Odds lines processed: ${oddsCreated}`);

    return {
      success: true,
      teamsCreated,
      gamesCreated,
      gamesUpdated,
      oddsCreated,
    };
  } catch (error) {
    console.error("❌ Ingestion failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Example usage function
// "../Python Files/basketball/spain/data2.csv"
// "../Python Files/basketball/spain/odds2.csv"
// gamesFilePath: string,
// oddsFilePath: string,
// leagueName: string,
// season?: string,
// country?: string

async function main() {
  await ingestGamesAndOdds(
    "../Python Files/basketball/sweden/data2.csv", // gamesFilePath
    "../Python Files/basketball/sweden/odds2.csv", // oddsFilePath
    "Sweden", // leagueName
    "2025-2026", // season
    "Sweden", // country
  );
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

// export { prisma };
