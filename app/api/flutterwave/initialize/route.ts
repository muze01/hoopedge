// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@/lib/auth";
// import { headers } from "next/headers";
// import {
//   FLUTTERWAVE_CONFIG,
//   FLUTTERWAVE_PLANS,
//   FlutterwaveCurrency,
// } from "@/lib/flutterwave";
// import { PRICING } from "@/lib/regions";

// export async function POST(req: NextRequest) {
//   try {
//     const session = await auth.api.getSession({
//       headers: await headers(),
//     });

//     if (!session) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { plan, currency } = await req.json();

//     if (plan !== "monthly" && plan !== "yearly") {
//       return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
//     }

//     const validCurrencies: FlutterwaveCurrency[] = ["NGN", "USD", "GBP"];
//     const resolvedCurrency: FlutterwaveCurrency = validCurrencies.includes(
//       currency,
//     )
//       ? currency
//       : "USD";

//     const planConfig =
//       FLUTTERWAVE_PLANS[resolvedCurrency][plan as "monthly" | "yearly"];
//     const pricing = PRICING[resolvedCurrency];

//     if (!planConfig.planId) {
//       console.error(
//         `Flutterwave plan ID not configured for: ${resolvedCurrency} ${plan}`,
//       );
//       return NextResponse.json(
//         { error: "Payment plan not configured" },
//         { status: 500 },
//       );
//     }

//     const amount = plan === "monthly" ? pricing.monthly : pricing.yearly;
//     const txRef = `hoopedge_${Date.now()}_${session.user.id}`;

//     return NextResponse.json({
//       success: true,
//       publicKey: FLUTTERWAVE_CONFIG.publicKey,
//       amount,
//       currency: resolvedCurrency,
//       txRef,
//       planId: planConfig.planId,
//       meta: {
//         userId: session.user.id,
//         userEmail: session.user.email,
//         userName: session.user.name,
//         plan: "PRO",
//         interval: plan, // "monthly" | "yearly"
//         currency: resolvedCurrency,
//       },
//     });
//   } catch (error) {
//     console.error("Flutterwave initialization error:", error);
//     return NextResponse.json(
//       { error: "Failed to initialize payment" },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { FLUTTERWAVE_CONFIG, FlutterwaveCurrency } from "@/lib/flutterwave";
import { PRICING } from "@/lib/regions";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, currency } = await req.json();

    if (plan !== "monthly" && plan !== "yearly") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const validCurrencies: FlutterwaveCurrency[] = ["NGN", "USD", "GBP"];
    const resolvedCurrency: FlutterwaveCurrency = validCurrencies.includes(
      currency,
    )
      ? currency
      : "USD";

    const pricing = PRICING[resolvedCurrency];
    const amount = plan === "monthly" ? pricing.monthly : pricing.yearly;
    const txRef = `hoopedge_${Date.now()}_${session.user.id}`;

    return NextResponse.json({
      success: true,
      publicKey: FLUTTERWAVE_CONFIG.publicKey,
      amount,
      currency: resolvedCurrency,
      txRef,
      customerName: session.user.name,
    });
  } catch (error) {
    console.error("Flutterwave initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 },
    );
  }
}