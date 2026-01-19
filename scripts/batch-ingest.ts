import { ingestGamesAndOdds } from "./ingest";
import * as path from "path";
import * as fs from "fs";

interface LeagueConfig {
  name: string;
  gamesFile: string;
  oddsFile: string;
  season: string;
  country: string;
}

// Configure multiple leagues to ingest
// C:\Users\sh\Documents\Work\Python Files\basketball\spain
const leagueConfigs: LeagueConfig[] = [
  {
    name: "Liga ACB",
    gamesFile: "../Python Files/basketball/italy/games.csv",
    oddsFile: "../Python Files/basketball/italy/odds.csv",
    season: "2025-2026",
    country: "Italy",
  },
  {
    name: "NBA",
    gamesFile: "../Python Files/basketball/nba/games.csv",
    oddsFile: "../Python Files/basketball/nba/odds.csv",
    season: "2025-2026",
    country: "USA",
  },
  {
    name: "EuroLeague",
    gamesFile: "../Python Files/basketball/euroleague/games.csv",
    oddsFile: "../Python Files/basketball/euroleague/odds.csv",
    season: "2025-2026",
    country: "Europe",
  },
];

async function batchIngest() {
  console.log("🏀 Starting batch ingestion for multiple leagues...\n");

  const results = [];

  for (const config of leagueConfigs) {
    console.log(`\n📊 Processing: ${config.name}`);
    console.log("━".repeat(50));

    // Check if files exist
    if (!fs.existsSync(config.gamesFile)) {
      console.log(`⚠️  Skipping ${config.name}: games file not found`);
      continue;
    }

    if (!fs.existsSync(config.oddsFile)) {
      console.log(`⚠️  Skipping ${config.name}: odds file not found`);
      continue;
    }

    try {
      const result = await ingestGamesAndOdds(
        config.gamesFile,
        config.oddsFile,
        config.name,
        config.season,
        config.country
      );

      results.push({
        league: config.name,
        ...result,
      });
    } catch (error) {
      console.error(`❌ Failed to ingest ${config.name}:`, error);
      results.push({
        league: config.name,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Summary
  console.log("\n\n📈 BATCH INGESTION SUMMARY");
  console.log("═".repeat(50));

  let totalGamesCreated = 0;
  let totalGamesUpdated = 0;
  let totalOddsCreated = 0;
  let successCount = 0;
  let failCount = 0;

  for (const result of results) {
    console.log(`\n${result.league}:`);
    if (result.success && "gamesCreated" in result) {
      console.log(`  ✅ Success`);
      console.log(`     Games created: ${result.gamesCreated}`);
      console.log(`     Games updated: ${result.gamesUpdated}`);
      console.log(`     Odds lines: ${result.oddsCreated}`);

      totalGamesCreated += result.gamesCreated;
      totalGamesUpdated += result.gamesUpdated;
      totalOddsCreated += result.oddsCreated;
      successCount++;
    } else {
      console.log(
        `  ❌ Failed: ${"error" in result ? result.error : "Unknown error"}`
      );
      failCount++;
    }
  }

  console.log("\n" + "═".repeat(50));
  console.log(`Total leagues processed: ${successCount + failCount}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total games created: ${totalGamesCreated}`);
  console.log(`Total games updated: ${totalGamesUpdated}`);
  console.log(`Total odds lines: ${totalOddsCreated}`);
}

// Run the batch ingestion
batchIngest()
  .then(() => {
    console.log("\n✨ All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Batch ingestion failed:", error);
    process.exit(1);
  });
