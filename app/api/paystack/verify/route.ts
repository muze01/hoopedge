import { NextRequest, NextResponse } from "next/server";
import { verifyAndCreateSubscription } from "@/lib/verify-payment";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json(
      { error: "No reference provided" },
      { status: 400 },
    );
  }

  const result = await verifyAndCreateSubscription(reference);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "Subscription created successfully",
  });
}
