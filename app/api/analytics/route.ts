import { NextRequest, NextResponse } from "next/server";
import { calculateTeamAnalytics, getLeagues } from "@/lib/analytics/team-stats";
import { analyzeOddsPerformance } from "@/lib/analytics/odds-analysis";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const leagueId = searchParams.get("leagueId") || undefined;
    const threshold = searchParams.get("threshold")
      ? parseInt(searchParams.get("threshold")!)
      : 40;
    const lastNGames = searchParams.get("lastNGames")
      ? parseInt(searchParams.get("lastNGames")!)
      : undefined;
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : new Date();
    const minOdds = searchParams.get("minOdds")
      ? parseFloat(searchParams.get("minOdds")!)
      : 1.7; // note that these are your default odds settings, i think you should look round and lower
    const maxOdds = searchParams.get("maxOdds")
      ? parseFloat(searchParams.get("maxOdds")!)
      : 1.79;

    // Check if we should include odds analysis (for initial load)
    const includeOdds = searchParams.get("includeOdds") !== "false";

    const analytics = await calculateTeamAnalytics({
      leagueId,
      threshold,
      lastNGames,
      startDate,
      endDate,
    });

    // Get available leagues for filters
    const leagues = await getLeagues();

    const response: any = {
      success: true,
      data: {
        ...analytics,
      },
      leagues,
      filters: {
        leagueId,
        threshold,
        lastNGames,
        startDate,
        endDate,
        minOdds,
        maxOdds,
      },
    };

    // Only calculate odds if requested
    if (includeOdds) {
      const oddsAnalysis = await analyzeOddsPerformance({
        leagueId,
        startDate,
        endDate,
        minOdds,
        maxOdds,
      });
      response.data.oddsAnalysis = oddsAnalysis;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
