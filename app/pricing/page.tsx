import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import PricingClient from "./pricing-client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrencyForCountry } from "@/lib/regions";

export default async function PricingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, id: true },
  });

  if (!user) {
    redirect("/auth");
  }

  // Set by middleware from x-vercel-ip-country. Falls back to "US" in dev.
  const country = (await headers()).get("x-user-country") ?? "US";
  const currency = getCurrencyForCountry("NG");

  return (
    <PricingClient
      currency={currency}
      userEmail={session.user.email ?? null}
    />
  );
}
