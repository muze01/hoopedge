import { NextRequest, NextResponse } from "next/server";
import { analyzeOddsPerformance } from "@/lib/analytics/odds-analysis";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const leagueId = searchParams.get("leagueId") || undefined;
    const minOdds = searchParams.get("minOdds")
      ? parseFloat(searchParams.get("minOdds")!)
      : 1.7;
    const maxOdds = searchParams.get("maxOdds")
      ? parseFloat(searchParams.get("maxOdds")!)
      : 1.79;
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : new Date();

    const oddsAnalysis = await analyzeOddsPerformance({
      leagueId,
      startDate,
      endDate,
      minOdds,
      maxOdds,
    });

    return NextResponse.json({
      success: true,
      data: oddsAnalysis,
      filters: {
        leagueId,
        minOdds,
        maxOdds,
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.error("Odds Analysis API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
