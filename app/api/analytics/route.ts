import { NextRequest, NextResponse } from "next/server";
import { calculateTeamAnalytics, getLeagues } from "@/lib/analytics/team-stats";
import { analyzeOddsPerformance } from "@/lib/analytics/odds-analysis";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const leagueId = searchParams.get("leagueId") || undefined;
    const lastNGames = searchParams.get("lastNGames")
      ? parseInt(searchParams.get("lastNGames")!)
      : undefined;
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : new Date();

    // Odds analysis params (independent of team stats)
    const minOdds = searchParams.get("minOdds")
      ? parseFloat(searchParams.get("minOdds")!)
      : 1.7;
    const maxOdds = searchParams.get("maxOdds")
      ? parseFloat(searchParams.get("maxOdds")!)
      : 1.79;
    const oddsType = (searchParams.get("oddsType") || "over") as
      | "over"
      | "under";

    const includeOdds = searchParams.get("includeOdds") !== "false";

    const analytics = await calculateTeamAnalytics({
      leagueId,
      lastNGames,
      startDate,
      endDate,
    });

    const leagues = await getLeagues();

    const response: any = {
      success: true,
      data: {
        ...analytics,
      },
      leagues,
      filters: {
        leagueId,
        lastNGames,
        startDate,
        endDate,
        minOdds,
        maxOdds,
        oddsType,
      },
    };

    if (includeOdds) {
      const oddsAnalysis = await analyzeOddsPerformance({
        leagueId,
        startDate,
        endDate,
        minOdds,
        maxOdds,
        oddsType,
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
