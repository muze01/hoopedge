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

function parseGameDate(dateStr: string): Date {
  return new Date(dateStr.trim());
}

async function getOrCreateTeam(
  teamName: string,
  leagueId: string,
): Promise<string> {
  const team = await prisma.team.upsert({
    where: { name_leagueId: { name: teamName, leagueId } },
    update: {},
    create: { name: teamName, leagueId },
  });
  return team.id;
}

export async function ingestGamesAndOdds(
  gamesFilePath: string,
  oddsFilePath: string,
  leagueName: string,
  season?: string,
  country?: string,
  threshold?: number,
  isPlayoff?: boolean,
) {
  try {
    console.log(`Starting ingestion for league: ${leagueName}`);

    // 1. Create or get league
    const league = await prisma.league.upsert({
      where: { name_country: { name: leagueName, country: country ?? "" } },
      update: { season, ...(threshold !== undefined && { threshold }) },
      create: { name: leagueName, season, country, threshold: threshold ?? 40 },
    });
    console.log(`League ready: ${league.name} (ID: ${league.id})`);

    // 2. Parse CSVs
    const gamesCSV = fs.readFileSync(gamesFilePath, "utf-8");
    const gamesParsed = Papa.parse<GameRow>(gamesCSV, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });
    console.log(`Parsed ${gamesParsed.data.length} games from CSV`);

    const oddsCSV = fs.readFileSync(oddsFilePath, "utf-8");
    const oddsParsed = Papa.parse<OddsRow>(oddsCSV, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });
    console.log(`Parsed ${oddsParsed.data.length} odds lines from CSV`);

    // 3. Group odds by game key
    const oddsMap = new Map<string, OddsRow[]>();
    for (const oddsRow of oddsParsed.data) {
      const key = `${oddsRow.date.trim()}|${oddsRow["Home Team"].trim()}|${oddsRow["Away Team"].trim()}`;
      if (!oddsMap.has(key)) oddsMap.set(key, []);
      oddsMap.get(key)!.push(oddsRow);
    }

    // 4. Create teams
    console.log("Creating teams...");
    const uniqueTeams = new Set<string>();
    for (const row of gamesParsed.data) {
      uniqueTeams.add(row.home_team.trim());
      uniqueTeams.add(row.away_team.trim());
    }

    const teamIdMap = new Map<string, string>();
    for (const teamName of uniqueTeams) {
      teamIdMap.set(teamName, await getOrCreateTeam(teamName, league.id));
    }
    console.log(`Teams processed: ${teamIdMap.size}`);

    // 5. Bulk fetch existing games for this league — one DB call, check in memory
    const existingGames = await prisma.game.findMany({
      where: { leagueId: league.id },
      select: { id: true, date: true, homeTeamId: true, awayTeamId: true },
    });
    const existingGameKeys = new Set(
      existingGames.map(
        (g) => `${g.date.toISOString()}|${g.homeTeamId}|${g.awayTeamId}`,
      ),
    );
    console.log(`Existing games in DB: ${existingGameKeys.size}`);

    // 6. Bulk fetch existing odds for this league — one DB call, check in memory
    const existingOdds = await prisma.oddsline.findMany({
      where: { game: { leagueId: league.id } },
      select: { gameId: true, line: true },
    });
    const existingOddsKeys = new Set(
      existingOdds.map((o) => `${o.gameId}|${o.line}`),
    );
    console.log(`Existing odds lines in DB: ${existingOddsKeys.size}`);

    // 7. Process games
    let gamesCreated = 0;
    let gamesSkipped = 0;
    let oddsCreated = 0;
    let oddsSkipped = 0;

    for (const gameRow of gamesParsed.data) {
      const gameDate = parseGameDate(gameRow.date);
      const homeTeamName = gameRow.home_team.trim();
      const awayTeamName = gameRow.away_team.trim();

      const homeTeamId = teamIdMap.get(homeTeamName);
      const awayTeamId = teamIdMap.get(awayTeamName);

      if (!homeTeamId || !awayTeamId) {
        console.error(
          `⚠️  Skipping game: Team not found (${homeTeamName} vs ${awayTeamName})`,
        );
        continue;
      }

      // In-memory check — no DB query
      const gameKey = `${gameDate.toISOString()}|${homeTeamId}|${awayTeamId}`;
      if (existingGameKeys.has(gameKey)) {
        gamesSkipped++;
        continue;
      }

      const game = await prisma.game.create({
        data: {
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
          isPlayoff: isPlayoff ?? false,
        },
      });

      console.log(
        `✅ Game created: ${homeTeamName} vs ${awayTeamName} (${gameRow.date})`,
      );
      gamesCreated++;

      // Add new game to the in-memory set so re-runs within same session are safe
      existingGameKeys.add(gameKey);

      // Process odds — in-memory check
      const oddsKey = `${gameRow.date.trim()}|${homeTeamName}|${awayTeamName}`;
      const oddsForGame = oddsMap.get(oddsKey) ?? [];

      for (const oddsRow of oddsForGame) {
        const line = parseFloat(oddsRow["Line (Points)"]);
        const oddsLineKey = `${game.id}|${line}`;

        if (existingOddsKeys.has(oddsLineKey)) {
          oddsSkipped++;
          continue;
        }

        await prisma.oddsline.create({
          data: {
            gameId: game.id,
            line,
            overOdd: parseFloat(oddsRow["Over Odd"]),
            underOdd: parseFloat(oddsRow["Under Odd"]),
          },
        });

        existingOddsKeys.add(oddsLineKey);
        oddsCreated++;
      }
    }

    console.log("\n✅ Ingestion completed!");
    console.log(`   Teams processed: ${teamIdMap.size}`);
    console.log(`   Games created:   ${gamesCreated}`);
    console.log(`   Games skipped:   ${gamesSkipped}`);
    console.log(`   Odds created:    ${oddsCreated}`);
    console.log(`   Odds skipped:    ${oddsSkipped}`);

    return {
      success: true,
      gamesCreated,
      gamesSkipped,
      oddsCreated,
      oddsSkipped,
    };
  } catch (error) {
    console.error("❌ Ingestion failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}


async function main() {
  // await ingestGamesAndOdds(
  //   "../Python Files/basketball/nba/data2.csv",
  //   "../Python Files/basketball/nba/odds2.csv",
  //   "NBA",
  //   "2025-2026",
  //   "USA",
  //   55,
  //   false,
  // );
    await ingestGamesAndOdds(
      "../Python Files/basketball/bulgaria/data2.csv",
      "../Python Files/basketball/bulgaria/odds2.csv",
      "NBL",
      "2025-2026",
      "Bulgaria",
      40,
      false,
    );
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
