import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { experienceCodes } from "@/db/schema";
import { eq } from "drizzle-orm";

// 更新体验码
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, credits, valid_days, max_uses, is_active } = body;

    // 构建更新对象
    const updateData: any = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { success: false, error: "Name is required" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || "";
    }

    if (credits !== undefined) {
      if (credits < 1) {
        return NextResponse.json(
          { success: false, error: "Credits must be at least 1" },
          { status: 400 }
        );
      }
      updateData.credits = credits;
    }

    if (valid_days !== undefined) {
      if (valid_days < 1) {
        return NextResponse.json(
          { success: false, error: "Valid days must be at least 1" },
          { status: 400 }
        );
      }
      updateData.valid_days = valid_days;
      
      // 重新计算过期时间
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + valid_days);
      updateData.expires_at = expiresAt;
    }

    if (max_uses !== undefined) {
      if (max_uses < 1) {
        return NextResponse.json(
          { success: false, error: "Max uses must be at least 1" },
          { status: 400 }
        );
      }
      updateData.max_uses = max_uses;
    }

    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    // 检查体验码是否存在
    const existingCode = await db()
      .select()
      .from(experienceCodes)
      .where(eq(experienceCodes.id, id))
      .limit(1);

    if (existingCode.length === 0) {
      return NextResponse.json(
        { success: false, error: "Experience code not found" },
        { status: 404 }
      );
    }

    // 执行更新
    const updatedCode = await db()
      .update(experienceCodes)
      .set(updateData)
      .where(eq(experienceCodes.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      code: updatedCode[0]
    });
  } catch (error) {
    console.error("Update experience code error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update experience code" },
      { status: 500 }
    );
  }
}

// 删除体验码
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    // 检查体验码是否存在
    const existingCode = await db()
      .select()
      .from(experienceCodes)
      .where(eq(experienceCodes.id, id))
      .limit(1);

    if (existingCode.length === 0) {
      return NextResponse.json(
        { success: false, error: "Experience code not found" },
        { status: 404 }
      );
    }

    // 检查是否已被使用
    const codeData = existingCode[0];
    if (codeData.used_count > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete used experience code" },
        { status: 400 }
      );
    }

    // 执行删除
    await db()
      .delete(experienceCodes)
      .where(eq(experienceCodes.id, id));

    return NextResponse.json({
      success: true,
      message: "Experience code deleted successfully"
    });
  } catch (error) {
    console.error("Delete experience code error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete experience code" },
      { status: 500 }
    );
  }
}