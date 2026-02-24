import { NextRequest, NextResponse } from "next/server";
import { getTeamDetail } from "@/lib/analytics/team-stats";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const { teamId } = await params;
    const sp = request.nextUrl.searchParams;

    const minOdds = sp.get("minOdds") ? parseFloat(sp.get("minOdds")!) : 1.7;
    const maxOdds = sp.get("maxOdds") ? parseFloat(sp.get("maxOdds")!) : 1.79;
    const oddsType = (sp.get("oddsType") ?? "over") as "over" | "under";

    const data = await getTeamDetail(teamId, minOdds, maxOdds, oddsType);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Team detail API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status:
          error instanceof Error && error.message === "Team not found"
            ? 404
            : 500,
      },
    );
  }
}
