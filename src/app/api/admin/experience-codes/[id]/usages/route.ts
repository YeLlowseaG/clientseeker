import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { experienceCodeUsages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// 获取体验码使用记录
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const codeId = parseInt((await params).id);
    if (isNaN(codeId)) {
      return NextResponse.json(
        { success: false, error: "Invalid code ID" },
        { status: 400 }
      );
    }

    const usages = await db()
      .select()
      .from(experienceCodeUsages)
      .where(eq(experienceCodeUsages.code_id, codeId))
      .orderBy(desc(experienceCodeUsages.used_at));

    return NextResponse.json({
      success: true,
      usages: usages
    });
  } catch (error) {
    console.error("Get experience code usages error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch usage records" },
      { status: 500 }
    );
  }
}