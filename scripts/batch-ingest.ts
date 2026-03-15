import { ingestGamesAndOdds } from "./ingest";
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

const leagueConfigs: LeagueConfig[] = [
  // {
  //   name: "BNXT",
  //   gamesFile: "../Python Files/basketball/bnxt/data2.csv",
  //   oddsFile: "../Python Files/basketball/bnxt/odds2.csv",
  //   season: "2025-2026",
  //   country: "Europe",
  //   threshold: 40,
  //   isPlayoff: false,
  // },
  // {
  //   name: "NBL",
  //   gamesFile: "../Python Files/basketball/bulgaria/data2.csv",
  //   oddsFile: "../Python Files/basketball/bulgaria/odds2.csv",
  //   season: "2025-2026",
  //   country: "Bulgaria",
  //   threshold: 40,
  //   isPlayoff: false,
  // },
  // {
  //   name: "EuroLeague",
  //   gamesFile: "../Python Files/basketball/euroleague/data2.csv",
  //   oddsFile: "../Python Files/basketball/euroleague/odds2.csv",
  //   season: "2025-2026",
  //   country: "Europe",
  //   threshold: 40,
  //   isPlayoff: false,
  // },
  // {
  //   name: "Premijer Liga",
  //   gamesFile: "../Python Files/basketball/croatia/data2.csv",
  //   oddsFile: "../Python Files/basketball/croatia/odds2.csv",
  //   season: "2025-2026",
  //   country: "Croatia",
  //   threshold: 40,
  //   isPlayoff: false,
  // },
  // {
  //   name: "Division A",
  //   gamesFile: "../Python Files/basketball/cyprus/data2.csv",
  //   oddsFile: "../Python Files/basketball/cyprus/odds2.csv",
  //   season: "2025-2026",
  //   country: "Cyprus",
  //   threshold: 40,
  //   isPlayoff: false,
  // },
  // {
  //   name: "SLB",
  //   gamesFile: "../Python Files/basketball/england/data2.csv",
  //   oddsFile: "../Python Files/basketball/england/odds2.csv",
  //   season: "2025-2026",
  //   country: "England",
  //   threshold: 40,
  //   isPlayoff: false,
  // },
  {
    name: "Latvian-Estonian",
    gamesFile: "../Python Files/basketball/estonia/data2.csv",
    oddsFile: "../Python Files/basketball/estonia/odds2.csv",
    season: "2025-2026",
    country: "Europe",
    threshold: 40,
    isPlayoff: false,
  },
  {
    name: "LNB",
    gamesFile: "../Python Files/basketball/france/data2.csv",
    oddsFile: "../Python Files/basketball/france/odds2.csv",
    season: "2025-2026",
    country: "France",
    threshold: 40,
    isPlayoff: false,
  },
  {
    name: "Elite 2",
    gamesFile: "../Python Files/basketball/france_pro_b/data2.csv",
    oddsFile: "../Python Files/basketball/france_pro_b/odds2.csv",
    season: "2025-2026",
    country: "France",
    threshold: 40,
    isPlayoff: false,
  },
  {
    name: "BBL",
    gamesFile: "../Python Files/basketball/germany/data2.csv",
    oddsFile: "../Python Files/basketball/germany/odds2.csv",
    season: "2025-2026",
    country: "Germany",
    threshold: 40,
    isPlayoff: false,
  },
  // {
  //   name: "Pro A",
  //   gamesFile: "../Python Files/basketball/germany_pro_a/data2.csv",
  //   oddsFile: "../Python Files/basketball/germany_pro_a/odds2.csv",
  //   season: "2025-2026",
  //   country: "Germany",
  //   threshold: 40,
  //   isPlayoff: false,
  // },
  {
    name: "Basket League",
    gamesFile: "../Python Files/basketball/greece/data2.csv",
    oddsFile: "../Python Files/basketball/greece/odds2.csv",
    season: "2025-2026",
    country: "Greece",
    threshold: 40,
    isPlayoff: false,
  },
  {
    name: "NB-I-A",
    gamesFile: "../Python Files/basketball/hungary/data2.csv",
    oddsFile: "../Python Files/basketball/hungary/odds2.csv",
    season: "2025-2026",
    country: "Hungary",
    threshold: 40,
    isPlayoff: false,
  },
  {
    name: "Premier League",
    gamesFile: "../Python Files/basketball/iceland/data2.csv",
    oddsFile: "../Python Files/basketball/iceland/odds2.csv",
    season: "2025-2026",
    country: "Iceland",
    threshold: 45,
    isPlayoff: false,
  },
  {
    name: "Lega A",
    gamesFile: "../Python Files/basketball/italy/data2.csv",
    oddsFile: "../Python Files/basketball/italy/odds2.csv",
    season: "2025-2026",
    country: "Italy",
    threshold: 40,
    isPlayoff: false,
  },
  // {
  //   name: "LKL",
  //   gamesFile: "../Python Files/basketball/lithuania/data2.csv",
  //   oddsFile: "../Python Files/basketball/lithuania/odds2.csv",
  //   season: "2025-2026",
  //   country: "Lithuania",
  //   threshold: 40,
  //   isPlayoff: false,
  // },
  // {
  //   name: "NBA",
  //   gamesFile: "../Python Files/basketball/nba/data2.csv",
  //   oddsFile: "../Python Files/basketball/nba/odds2.csv",
  //   season: "2025-2026",
  //   country: "USA",
  //   threshold: 55,
  //   isPlayoff: false,
  // },
  {
    name: "Basket Liga",
    gamesFile: "../Python Files/basketball/poland/data2.csv",
    oddsFile: "../Python Files/basketball/poland/odds2.csv",
    season: "2025-2026",
    country: "Poland",
    threshold: 40,
    isPlayoff: false,
  },
  {
    name: "Divizia A",
    gamesFile: "../Python Files/basketball/romania/data2.csv",
    oddsFile: "../Python Files/basketball/romania/odds2.csv",
    season: "2025-2026",
    country: "Romania",
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
    name: "First League",
    gamesFile: "../Python Files/basketball/serbia/data2.csv",
    oddsFile: "../Python Files/basketball/serbia/odds2.csv",
    season: "2025-2026",
    country: "Serbia",
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
  // {
  //   name: "Primera FEB",
  //   gamesFile: "../Python Files/basketball/sp_b/data2.csv",
  //   oddsFile: "../Python Files/basketball/sp_b/odds2.csv",
  //   season: "2025-2026",
  //   country: "Spain",
  //   threshold: 40,
  //   isPlayoff: false,
  // },
  // {
  //   name: "Basketligan",
  //   gamesFile: "../Python Files/basketball/sweden/data2.csv",
  //   oddsFile: "../Python Files/basketball/sweden/odds2.csv",
  //   season: "2025-2026",
  //   country: "Sweden",
  //   threshold: 40,
  //   isPlayoff: false,
  // },
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
];

async function batchIngest() {
  console.log("🏀 Starting batch ingestion for multiple leagues...\n");

  const results: Array<{
    league: string;
    success: boolean;
    gamesCreated?: number;
    gamesSkipped?: number;
    oddsCreated?: number;
    oddsSkipped?: number;
    error?: string;
  }> = [];

  for (const config of leagueConfigs) {
    console.log(`\n📊 Processing: ${config.name}`);
    console.log("━".repeat(50));

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

      results.push({ league: config.name, ...result });
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
  let totalGamesSkipped = 0;
  let totalOddsCreated = 0;
  let totalOddsSkipped = 0;
  let successCount = 0;
  let failCount = 0;

  for (const result of results) {
    console.log(`\n${result.league}:`);
    if (result.success) {
      console.log(`  ✅ Success`);
      console.log(`     Games created:  ${result.gamesCreated}`);
      console.log(`     Games skipped:  ${result.gamesSkipped}`);
      console.log(`     Odds created:   ${result.oddsCreated}`);
      console.log(`     Odds skipped:   ${result.oddsSkipped}`);

      totalGamesCreated += result.gamesCreated ?? 0;
      totalGamesSkipped += result.gamesSkipped ?? 0;
      totalOddsCreated += result.oddsCreated ?? 0;
      totalOddsSkipped += result.oddsSkipped ?? 0;
      successCount++;
    } else {
      console.log(`  ❌ Failed: ${result.error ?? "Unknown error"}`);
      failCount++;
    }
  }

  console.log("\n" + "═".repeat(50));
  console.log(`Total leagues processed: ${successCount + failCount}`);
  console.log(`Successful:             ${successCount}`);
  console.log(`Failed:                 ${failCount}`);
  console.log(`Total games created:    ${totalGamesCreated}`);
  console.log(`Total games skipped:    ${totalGamesSkipped}`);
  console.log(`Total odds created:     ${totalOddsCreated}`);
  console.log(`Total odds skipped:     ${totalOddsSkipped}`);
}

batchIngest()
  .then(() => {
    console.log("\n✨ All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Batch ingestion failed:", error);
    process.exit(1);
  });
