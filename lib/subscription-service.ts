import { prisma } from "./auth";

export type SubscriptionPlan = "FREE" | "PRO" | "ADMIN";
export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED" | "TRIAL";

interface CreateSubscriptionParams {
  userId: string;
  plan: SubscriptionPlan;
  provider?: "STRIPE" | "PAYSTACK" | "FLUTTERWAVE" | "MANUAL";
  providerSubId?: string;
  providerCustomerId?: string;
  amount?: number;
  currency?: string;
  interval?: "monthly" | "yearly";
  endDate?: Date;
}

export class SubscriptionService {
  /**
   * Create a new subscription for a user
   */
  static async createSubscription(params: CreateSubscriptionParams) {
    const {
      userId,
      plan,
      provider = "MANUAL",
      providerSubId,
      providerCustomerId,
      amount,
      currency,
      interval = "monthly",
      endDate,
    } = params;

    // Calculate end date if not provided (30 days for monthly)
    const calculatedEndDate =
      endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Cancel any existing active subscriptions
    await this.cancelUserSubscriptions(userId);

    // Create new subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        status: "ACTIVE",
        provider,
        providerSubId,
        providerCustomerId,
        amount,
        currency,
        interval,
        endDate: calculatedEndDate,
      },
    });

    // Update user role
    await prisma.user.update({
      where: { id: userId },
      data: { role: plan },
    });

    return subscription;
  }

  /**
   * Get user's active subscription
   * Active = status is ACTIVE OR (status is CANCELLED but endDate hasn't passed)
   */
  static async getActiveSubscription(userId: string) {
    return await prisma.subscription.findFirst({
      where: {
        userId,
        OR: [
          // Active subscriptions
          {
            status: "ACTIVE",
            OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
          },
          // Cancelled but still within billing period
          {
            status: "CANCELLED",
            endDate: { gt: new Date() },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Check if user has active subscription
   */
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    const sub = await this.getActiveSubscription(userId);
    return sub !== null;
  }

  /**
   * Cancel user's active subscriptions
   */
  static async cancelUserSubscriptions(userId: string) {
    await prisma.subscription.updateMany({
      where: {
        userId,
        status: "ACTIVE",
      },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });
  }

  /**
   * Cancel specific subscription
   * User keeps access until endDate (end of billing period)
   */
  static async cancelSubscription(subscriptionId: string) {
    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
      include: { user: true },
    });

    // Check if subscription has already expired
    const hasExpired =
      subscription.endDate && subscription.endDate < new Date();

    // Only downgrade if already expired, otherwise let it expire naturally
    if (hasExpired) {
      await prisma.user.update({
        where: { id: subscription.userId },
        data: { role: "FREE" },
      });
    }
    // If not expired, user keeps PRO access until endDate
    // The cron job will handle downgrading when endDate passes

    return subscription;
  }

  /**
   * Expire subscriptions that have passed their end date
   * Run this as a cron job
   * This handles BOTH active subscriptions that expired AND cancelled subscriptions
   */
  static async expireSubscriptions() {
    const expired = await prisma.subscription.findMany({
      where: {
        OR: [
          // Active subscriptions that expired
          {
            status: "ACTIVE",
            endDate: { lt: new Date() },
          },
          // Cancelled subscriptions that reached end of billing period
          {
            status: "CANCELLED",
            endDate: { lt: new Date() },
          },
        ],
      },
      include: { user: true },
    });

    for (const sub of expired) {
      // Update subscription status to EXPIRED
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "EXPIRED" },
      });

      // Check if user has any other active subscriptions
      const otherActiveSub = await this.getActiveSubscription(sub.userId);

      // Only downgrade if no other active subscription
      if (!otherActiveSub) {
        await prisma.user.update({
          where: { id: sub.userId },
          data: { role: "FREE" },
        });
      }
    }

    return expired;
  }

  /**
   * Extend subscription (e.g., after renewal payment)
   */
  static async extendSubscription(subscriptionId: string, days: number = 30) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) throw new Error("Subscription not found");

    const currentEndDate = subscription.endDate || new Date();
    const newEndDate = new Date(
      currentEndDate.getTime() + days * 24 * 60 * 60 * 1000,
    );

    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        endDate: newEndDate,
        status: "ACTIVE",
      },
    });
  }

  /**
   * Get user's subscription history
   */
  static async getSubscriptionHistory(userId: string) {
    return await prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Manual upgrade (for testing or admin actions)
   */
  static async manualUpgrade(
    userId: string,
    plan: SubscriptionPlan,
    durationDays: number = 30,
  ) {
    return await this.createSubscription({
      userId,
      plan,
      provider: "MANUAL",
      interval: "monthly",
      endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
    });
  }

  /**
   * Get subscription stats (for admin dashboard)
   */
  static async getStats() {
    const [total, active, cancelled, expired] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.count({ where: { status: "CANCELLED" } }),
      prisma.subscription.count({ where: { status: "EXPIRED" } }),
    ]);

    return { total, active, cancelled, expired };
  }
}
