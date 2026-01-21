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
   */
  static async getActiveSubscription(userId: string) {
    return await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
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

    // Update user role back to FREE
    await prisma.user.update({
      where: { id: subscription.userId },
      data: { role: "FREE" },
    });

    return subscription;
  }

  /**
   * Expire subscriptions that have passed their end date
   * Run this as a cron job
   */
  static async expireSubscriptions() {
    const expired = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: { lt: new Date() },
      },
      include: { user: true },
    });

    for (const sub of expired) {
      // Update subscription status
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "EXPIRED" },
      });

      // Downgrade user to FREE
      await prisma.user.update({
        where: { id: sub.userId },
        data: { role: "FREE" },
      });
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
