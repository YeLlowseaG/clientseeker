import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { experienceCodes, experienceCodeUsages, credits, users, subscriptions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userEmail } = body;

    if (!code || !userEmail) {
      return NextResponse.json(
        { success: false, error: "CODE_INVALID" },
        { status: 400 }
      );
    }

    // 查找体验码
    const experienceCode = await db()
      .select()
      .from(experienceCodes)
      .where(eq(experienceCodes.code, code.trim()))
      .limit(1);

    if (experienceCode.length === 0) {
      return NextResponse.json(
        { success: false, error: "CODE_INVALID" },
        { status: 400 }
      );
    }

    const codeData = experienceCode[0];

    // 检查体验码是否有效
    if (!codeData.is_active) {
      return NextResponse.json(
        { success: false, error: "CODE_INVALID" },
        { status: 400 }
      );
    }

    // 检查体验码是否过期
    const now = new Date();
    if (codeData.expires_at && new Date(codeData.expires_at) < now) {
      return NextResponse.json(
        { success: false, error: "CODE_INVALID" },
        { status: 400 }
      );
    }

    // 检查使用次数是否超限
    if (codeData.used_count >= codeData.max_uses) {
      return NextResponse.json(
        { success: false, error: "CODE_INVALID" },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await db()
      .select()
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { success: false, error: "USER_NOT_FOUND" },
        { status: 400 }
      );
    }

    const userData = user[0];

    // 检查用户是否已有有效套餐（不允许已购买用户使用体验码）
    const userSubscription = await db()
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.user_uuid, userData.uuid),
          eq(subscriptions.status, "active")
        )
      )
      .limit(1);

    if (userSubscription.length > 0) {
      const subscription = userSubscription[0];
      // 检查是否是免费套餐以外的套餐
      if (subscription.product_id !== "free") {
        return NextResponse.json(
          { success: false, error: "ALREADY_SUBSCRIBED" },
          { status: 400 }
        );
      }
    }

    // 检查该用户是否已经使用过此体验码
    const existingUsage = await db()
      .select()
      .from(experienceCodeUsages)
      .where(
        and(
          eq(experienceCodeUsages.code_id, codeData.id),
          eq(experienceCodeUsages.user_uuid, userData.uuid)
        )
      )
      .limit(1);

    if (existingUsage.length > 0) {
      return NextResponse.json(
        { success: false, error: "CODE_ALREADY_USED" },
        { status: 400 }
      );
    }

    // 获取客户端IP地址
    const clientIP = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";

    // 开始事务处理
    const result = await db().transaction(async (tx) => {
      // 1. 增加体验码使用次数
      await tx
        .update(experienceCodes)
        .set({
          used_count: sql`${experienceCodes.used_count} + 1`
        })
        .where(eq(experienceCodes.id, codeData.id));

      // 2. 记录使用记录
      await tx.insert(experienceCodeUsages).values({
        code_id: codeData.id,
        user_uuid: userData.uuid,
        user_email: userEmail,
        used_at: new Date(),
        credits_granted: codeData.credits,
        ip_address: clientIP
      });

      // 3. 给用户添加积分 - 体验码固定1天有效期
      const transNo = `EXP_${Date.now()}_${uuidv4().substring(0, 8)}`;
      await tx.insert(credits).values({
        trans_no: transNo,
        created_at: new Date(),
        user_uuid: userData.uuid,
        trans_type: "experience_code",
        credits: codeData.credits,
        expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1天过期
      });

      return { credits: codeData.credits };
    });

    return NextResponse.json({
      success: true,
      credits: result.credits,
      message: "Experience code applied successfully"
    });

  } catch (error) {
    console.error("Experience code application error:", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}