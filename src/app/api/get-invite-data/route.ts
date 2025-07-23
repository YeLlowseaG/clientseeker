import { NextRequest, NextResponse } from "next/server";
import {
  getAffiliatesByUserUuid,
  getAffiliateSummary,
} from "@/models/affiliate";
import { getOrdersByPaidEmail, getOrdersByUserUuid } from "@/models/order";
import { findUserByEmail, findUserByUuid } from "@/models/user";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({
        code: 1,
        message: "Email is required"
      });
    }

    // 通过邮箱找到用户
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({
        code: 1,
        message: "User not found"
      });
    }

    const user_uuid = user.uuid;

    // 获取用户订单（用于权限检查）
    let orders = await getOrdersByUserUuid(user_uuid);
    if (!orders || orders.length === 0) {
      orders = await getOrdersByPaidEmail(email);
    }

    // 简化权限控制：所有注册用户都可以分销
    user.is_affiliate = true;

    // 获取邀请数据
    const affiliates = await getAffiliatesByUserUuid(user_uuid);
    const summary = await getAffiliateSummary(user_uuid);

    return NextResponse.json({
      code: 0,
      message: "Success",
      data: {
        affiliates: affiliates || [],
        summary: summary || {},
        user: {
          ...user,
          is_affiliate: true
        }
      }
    });

  } catch (error) {
    console.error("Get invite data error:", error);
    return NextResponse.json({
      code: 1,
      message: "Internal server error"
    });
  }
}