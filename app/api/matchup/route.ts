// app/api/matchup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { analyzeMatchup, searchTeams } from "@/lib/analytics/matchup-analyzer";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");

    // Handle team search
    if (action === "search") {
      const leagueId = searchParams.get("leagueId");
      const query = searchParams.get("query") || "";

      if (!leagueId) {
        return NextResponse.json(
          { success: false, error: "League ID required" },
          { status: 400 }
        );
      }

      const teams = await searchTeams(leagueId, query);
      return NextResponse.json({ success: true, teams });
    }

    // Handle matchup analysis
    const homeTeam = searchParams.get("homeTeam");
    const awayTeam = searchParams.get("awayTeam");
    const leagueId = searchParams.get("leagueId");

    if (!homeTeam || !awayTeam || !leagueId) {
      return NextResponse.json(
        {
          success: false,
          error: "Home team, away team, and league are required",
        },
        { status: 400 }
      );
    }

    const minOdds = searchParams.get("minOdds")
      ? parseFloat(searchParams.get("minOdds")!)
      : 1.7;
    const maxOdds = searchParams.get("maxOdds")
      ? parseFloat(searchParams.get("maxOdds")!)
      : 1.79;
    const lastNGames = searchParams.get("lastNGames")
      ? parseInt(searchParams.get("lastNGames")!)
      : undefined;

    const result = await analyzeMatchup({
      homeTeamName: homeTeam,
      awayTeamName: awayTeam,
      leagueId,
      minOdds,
      maxOdds,
      lastNGames,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Matchup API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
