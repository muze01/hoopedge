import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SubscriptionService } from "@/lib/subscription-service";
import {
  renewalReminderEmail,
  subscriptionExpiredEmail,
} from "@/services/sub-email-service";
import { emailService } from "@/services/email-service";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = {
    reminders7day: 0,
    reminders1day: 0,
    expired: 0,
    errors: [] as string[],
  };

  try {
    // 1. Subs expiring in 7 days 
    const in7DaysStart = new Date(now);
    in7DaysStart.setDate(in7DaysStart.getDate() + 7);
    in7DaysStart.setHours(0, 0, 0, 0);
    const in7DaysEnd = new Date(in7DaysStart);
    in7DaysEnd.setHours(23, 59, 59, 999);

    const expiring7 = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: { gte: in7DaysStart, lte: in7DaysEnd },
      },
      include: { user: true },
    });

    for (const sub of expiring7) {
      try {
        const { subject, html } = renewalReminderEmail({
          userName: sub.user.name ?? "there",
          daysLeft: 7,
          endDate: sub.endDate!,
          interval: sub.interval ?? "monthly",
          amount: sub.amount ?? 0,
          currency: sub.currency ?? "NGN",
        });
        await emailService.sendRawEmail(sub.user.email, subject, html);
        results.reminders7day++;
      } catch (err) {
        results.errors.push(
          `7-day reminder failed for ${sub.user.email}: ${err}`,
        );
      }
    }

    // 2. Subs expiring in 1 day 
    const in1DayStart = new Date(now);
    in1DayStart.setDate(in1DayStart.getDate() + 1);
    in1DayStart.setHours(0, 0, 0, 0);
    const in1DayEnd = new Date(in1DayStart);
    in1DayEnd.setHours(23, 59, 59, 999);

    const expiring1 = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: { gte: in1DayStart, lte: in1DayEnd },
      },
      include: { user: true },
    });

    for (const sub of expiring1) {
      try {
        const { subject, html } = renewalReminderEmail({
          userName: sub.user.name ?? "there",
          daysLeft: 1,
          endDate: sub.endDate!,
          interval: sub.interval ?? "monthly",
          amount: sub.amount ?? 0,
          currency: sub.currency ?? "NGN",
        });
        await emailService.sendRawEmail(sub.user.email, subject, html);
        results.reminders1day++;
      } catch (err) {
        results.errors.push(
          `1-day reminder failed for ${sub.user.email}: ${err}`,
        );
      }
    }

    // 3. Expire past-endDate subs + send expired emails 
    const expired = await SubscriptionService.expireSubscriptions();

    for (const sub of expired) {
      try {
        const { subject, html } = subscriptionExpiredEmail({
          userName: sub.user.name ?? "there",
        });
        await emailService.sendRawEmail(sub.user.email, subject, html);
        results.expired++;
      } catch (err) {
        results.errors.push(
          `Expired email failed for ${sub.user.email}: ${err}`,
        );
      }
    }

    // console.log("Subscription cron completed:", results);
    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error("Subscription cron error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
