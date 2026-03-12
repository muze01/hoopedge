import { NextRequest, NextResponse } from "next/server";
import { verifyAndCreateSubscription } from "@/lib/verify-payment";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const transactionId = searchParams.get("transaction_id");

  if (!transactionId) {
    return NextResponse.json(
      { error: "No transaction_id provided" },
      { status: 400 },
    );
  }

  const result = await verifyAndCreateSubscription(transactionId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "Subscription created successfully",
  });
}
