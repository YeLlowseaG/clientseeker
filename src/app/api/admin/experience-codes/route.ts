import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { experienceCodes } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// 获取体验码列表
export async function GET(request: NextRequest) {
  try {
    const codes = await db()
      .select()
      .from(experienceCodes)
      .orderBy(desc(experienceCodes.created_at));

    return NextResponse.json({
      success: true,
      codes: codes
    });
  } catch (error) {
    console.error("Get experience codes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch experience codes" },
      { status: 500 }
    );
  }
}

// 创建体验码
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, credits, valid_days, max_uses, is_active } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    if (!credits || credits < 1) {
      return NextResponse.json(
        { success: false, error: "Credits must be at least 1" },
        { status: 400 }
      );
    }

    if (!valid_days || valid_days < 1) {
      return NextResponse.json(
        { success: false, error: "Valid days must be at least 1" },
        { status: 400 }
      );
    }

    if (!max_uses || max_uses < 1) {
      return NextResponse.json(
        { success: false, error: "Max uses must be at least 1" },
        { status: 400 }
      );
    }

    // 生成唯一的体验码
    const generateCode = () => {
      const prefix = "EXP";
      const randomStr = uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();
      return `${prefix}${randomStr}`;
    };

    let code = generateCode();
    
    // 确保生成的码是唯一的
    let attempts = 0;
    while (attempts < 10) {
      const existing = await db()
        .select()
        .from(experienceCodes)
        .where(eq(experienceCodes.code, code))
        .limit(1);
      
      if (existing.length === 0) {
        break;
      }
      
      code = generateCode();
      attempts++;
    }

    if (attempts >= 10) {
      return NextResponse.json(
        { success: false, error: "Failed to generate unique code" },
        { status: 500 }
      );
    }

    // 计算过期时间
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + valid_days);

    const newCode = await db()
      .insert(experienceCodes)
      .values({
        code,
        name: name.trim(),
        description: description?.trim() || "",
        credits,
        valid_days,
        max_uses,
        used_count: 0,
        is_active: is_active ?? true,
        created_at: new Date(),
        created_by: "admin", // TODO: 这里应该从session中获取管理员信息
        expires_at: expiresAt
      })
      .returning();

    return NextResponse.json({
      success: true,
      code: newCode[0]
    });
  } catch (error) {
    console.error("Create experience code error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create experience code" },
      { status: 500 }
    );
  }
}