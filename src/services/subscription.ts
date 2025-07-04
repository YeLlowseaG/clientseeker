import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";

export interface UserSubscription {
  id: number;
  user_uuid: string;
  product_id: string;
  product_name: string;
  status: string;
  credits_total: number;
  credits_used: number;
  credits_remaining: number;
  period_start: Date | null;
  period_end: Date | null;
  stripe_subscription_id: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface QuotaCheckResult {
  hasQuota: boolean;
  remaining: number;
  total: number;
  used: number;
  productId: string;
  message?: string;
}

export class SubscriptionService {
  // 获取用户当前有效订阅
  static async getUserActiveSubscription(userUuid: string): Promise<UserSubscription | null> {
    const now = new Date();
    
    try {
      const subscription = await db()
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.user_uuid, userUuid),
            eq(subscriptions.status, "active"),
            gte(subscriptions.period_end, now)
          )
        )
        .orderBy(subscriptions.period_end)
        .limit(1);

      return subscription[0] || null;
    } catch (error) {
      console.error("Error getting user subscription:", error);
      return null;
    }
  }

  // 检查用户是否有搜索配额
  static async checkUserQuota(userUuid: string): Promise<QuotaCheckResult> {
    const subscription = await this.getUserActiveSubscription(userUuid);
    
    if (!subscription) {
      // 检查是否有免费试用配额
      const freeSubscription = await db()
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.user_uuid, userUuid),
            eq(subscriptions.product_id, "free")
          )
        )
        .limit(1);

      if (freeSubscription[0]) {
        const freeSub = freeSubscription[0];
        return {
          hasQuota: freeSub.credits_remaining > 0,
          remaining: freeSub.credits_remaining,
          total: freeSub.credits_total,
          used: freeSub.credits_used,
          productId: "free",
          message: freeSub.credits_remaining <= 0 ? "Free trial quota exhausted. Please upgrade your plan." : undefined
        };
      }

      // 创建免费试用配额
      await this.createFreeTrialSubscription(userUuid);
      return {
        hasQuota: true,
        remaining: 10,
        total: 10,
        used: 0,
        productId: "free"
      };
    }

    return {
      hasQuota: subscription.credits_remaining > 0,
      remaining: subscription.credits_remaining,
      total: subscription.credits_total,
      used: subscription.credits_used,
      productId: subscription.product_id,
      message: subscription.credits_remaining <= 0 ? "Monthly quota exhausted. Please wait for renewal or upgrade your plan." : undefined
    };
  }

  // 扣减用户搜索配额
  static async deductUserQuota(userUuid: string, amount: number = 1): Promise<boolean> {
    const subscription = await this.getUserActiveSubscription(userUuid);
    
    if (!subscription) {
      // 检查免费试用配额
      const freeSubscription = await db()
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.user_uuid, userUuid),
            eq(subscriptions.product_id, "free")
          )
        )
        .limit(1);

      if (freeSubscription[0] && freeSubscription[0].credits_remaining >= amount) {
        await db()
          .update(subscriptions)
          .set({
            credits_used: freeSubscription[0].credits_used + amount,
            credits_remaining: freeSubscription[0].credits_remaining - amount,
            updated_at: new Date()
          })
          .where(eq(subscriptions.id, freeSubscription[0].id));
        return true;
      }
      return false;
    }

    if (subscription.credits_remaining >= amount) {
      await db()
        .update(subscriptions)
        .set({
          credits_used: subscription.credits_used + amount,
          credits_remaining: subscription.credits_remaining - amount,
          updated_at: new Date()
        })
        .where(eq(subscriptions.id, subscription.id));
      return true;
    }

    return false;
  }

  // 创建免费试用订阅
  static async createFreeTrialSubscription(userUuid: string): Promise<UserSubscription> {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1); // 1个月有效期

    const newSubscription = await db()
      .insert(subscriptions)
      .values({
        user_uuid: userUuid,
        product_id: "free",
        product_name: "ClientSeeker Trial",
        status: "active",
        credits_total: 10,
        credits_used: 0,
        credits_remaining: 10,
        period_start: now,
        period_end: periodEnd,
        created_at: now,
        updated_at: now
      })
      .returning();

    return newSubscription[0];
  }

  // 创建付费订阅
  static async createPaidSubscription(
    userUuid: string,
    productId: string,
    productName: string,
    creditsTotal: number,
    stripeSubscriptionId?: string
  ): Promise<UserSubscription> {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1); // 1个月有效期

    // 先停用所有现有订阅
    await db()
      .update(subscriptions)
      .set({
        status: "inactive",
        updated_at: now
      })
      .where(eq(subscriptions.user_uuid, userUuid));

    const newSubscription = await db()
      .insert(subscriptions)
      .values({
        user_uuid: userUuid,
        product_id: productId,
        product_name: productName,
        status: "active",
        credits_total: creditsTotal,
        credits_used: 0,
        credits_remaining: creditsTotal,
        period_start: now,
        period_end: periodEnd,
        stripe_subscription_id: stripeSubscriptionId,
        created_at: now,
        updated_at: now
      })
      .returning();

    return newSubscription[0];
  }

  // 续费订阅（重置配额）
  static async renewSubscription(userUuid: string): Promise<boolean> {
    const subscription = await this.getUserActiveSubscription(userUuid);
    
    if (!subscription) {
      return false;
    }

    const now = new Date();
    const newPeriodEnd = new Date(now);
    newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

    await db()
      .update(subscriptions)
      .set({
        credits_used: 0,
        credits_remaining: subscription.credits_total,
        period_start: now,
        period_end: newPeriodEnd,
        updated_at: now
      })
      .where(eq(subscriptions.id, subscription.id));

    return true;
  }
}