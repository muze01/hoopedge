import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import PricingClient from "./pricingClient";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

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
  
  // const country = (await headers()).get("x-user-country") || "US"; // You need to setup a middleware for this. Not needed atm.
  // const isNigerian = country === "NG";
  const isNigerian = true;
  
  return <PricingClient
      isNigerian={isNigerian}
      userEmail={session?.user?.email ?? null}
    />
}
