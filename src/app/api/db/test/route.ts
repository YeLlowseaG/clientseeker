import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { findUserByEmail } from '@/models/user';

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [DB Test] Testing database connection...");
    
    // 检查环境变量
    const hasDbUrl = !!process.env.DATABASE_URL;
    console.log("🔍 [DB Test] Has DATABASE_URL:", hasDbUrl);
    
    if (!hasDbUrl) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not set',
        step: 'env_check'
      });
    }
    
    // 测试基本数据库连接
    console.log("🔍 [DB Test] Testing basic DB connection...");
    const dbInstance = db();
    console.log("🔍 [DB Test] DB instance created");
    
    // 测试简单查询
    console.log("🔍 [DB Test] Testing simple query...");
    const result = await dbInstance.execute('SELECT 1 as test');
    console.log("🔍 [DB Test] Simple query result:", result);
    
    // 测试用户表查询
    console.log("🔍 [DB Test] Testing user lookup...");
    const testUser = await findUserByEmail('hwonghai438@gmail.com');
    console.log("🔍 [DB Test] User lookup result:", !!testUser);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection working',
      data: {
        hasDbUrl: true,
        simpleQuery: true,
        userLookup: !!testUser,
        userFound: testUser ? {
          email: testUser.email,
          uuid: testUser.uuid,
          id: testUser.id
        } : null
      }
    });
    
  } catch (error: any) {
    console.error("🔍 [DB Test] Database test failed:", error);
    console.error("🔍 [DB Test] Error message:", error.message);
    console.error("🔍 [DB Test] Error code:", error.code);
    console.error("🔍 [DB Test] Error stack:", error.stack);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      stack: error.stack,
      step: 'db_query'
    }, { status: 500 });
  }
}