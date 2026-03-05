import { ingestGamesAndOdds } from "./ingest";
import * as path from "path";
import * as fs from "fs";

interface LeagueConfig {
  name: string;
  gamesFile: string;
  oddsFile: string;
  season: string;
  country: string;
  threshold?: number;
  isPlayoff?: boolean;
}

// Configure multiple leagues to ingest
// ../Python Files/basketball/spain/.....
const leagueConfigs: LeagueConfig[] = [
  {
    name: "First League",
    gamesFile: "../Python Files/basketball/serbia/data2.csv",
    oddsFile: "../Python Files/basketball/serbia/odds2.csv",
    season: "2025-2026",
    country: "Serbia",
    threshold: 40,
    isPlayoff: false,
  },
  {
    name: "Extraliga",
    gamesFile: "../Python Files/basketball/slovakia/data2.csv",
    oddsFile: "../Python Files/basketball/slovakia/odds2.csv",
    season: "2025-2026",
    country: "Slovakia",
    threshold: 40,
    isPlayoff: false,
  },
  {
    name: "ACB",
    gamesFile: "../Python Files/basketball/spain/data2.csv",
    oddsFile: "../Python Files/basketball/spain/odds2.csv",
    season: "2025-2026",
    country: "Spain",
    threshold: 40,
    isPlayoff: false,
  },
  {
    name: "Primera FEB",
    gamesFile: "../Python Files/basketball/sp_b/data2.csv",
    oddsFile: "../Python Files/basketball/sp_b/odds2.csv",
    season: "2025-2026",
    country: "Spain",
    threshold: 40,
    isPlayoff: false,
  },
  {
    name: "Basketligan",
    gamesFile: "../Python Files/basketball/sweden/data2.csv",
    oddsFile: "../Python Files/basketball/sweden/odds2.csv",
    season: "2025-2026",
    country: "Sweden",
    threshold: 40,
    isPlayoff: false,
  },
  {
    name: "SB League",
    gamesFile: "../Python Files/basketball/switzerland/data2.csv",
    oddsFile: "../Python Files/basketball/switzerland/odds2.csv",
    season: "2025-2026",
    country: "Switzerland",
    threshold: 40,
    isPlayoff: false,
  },
  {
    name: "Super Lig",
    gamesFile: "../Python Files/basketball/turkey/data2.csv",
    oddsFile: "../Python Files/basketball/turkey/odds2.csv",
    season: "2025-2026",
    country: "Turkey",
    threshold: 40,
    isPlayoff: false,
  },
  // {
  //   name: "Basket Liga",
  //   gamesFile: "../Python Files/basketball/poland/data2.csv",
  //   oddsFile: "../Python Files/basketball/poland/odds2.csv",
  //   season: "2025-2026",
  //   country: "Poland",
  //   threshold: 40,
  //   isPlayoff: false,
  // },
  // {
  //   name: "Divizia A",
  //   gamesFile: "../Python Files/basketball/romania/data2.csv",
  //   oddsFile: "../Python Files/basketball/romania/odds2.csv",
  //   season: "2025-2026",
  //   country: "Romania",
  //   threshold: 40,
  //   isPlayoff: false,
  // },
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
        config.country,
        config.threshold,
        config.isPlayoff,
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
