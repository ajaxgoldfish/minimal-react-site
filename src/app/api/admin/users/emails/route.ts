import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { user } from '@/db/schema';
import { isNotNull, desc } from 'drizzle-orm';

// 获取所有用户邮箱列表 (GET)
export async function GET() {
  try {
    // 验证管理员权限
    await requireAdmin();

    const emails = await db
      .select({
        email: user.email,
      })
      .from(user)
      .where(isNotNull(user.email))
      .orderBy(desc(user.email))
      .groupBy(user.email);

    const emailList = emails.map(item => item.email).filter(Boolean);

    return NextResponse.json({
      success: true,
      emails: emailList,
    });
  } catch (error) {
    console.error('获取用户邮箱列表时出错:', error);
    
    if (error instanceof Error) {
      if (error.message === '未登录') {
        return NextResponse.json({ error: '未登录' }, { status: 401 });
      }
      if (error.message === '需要管理员权限') {
        return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: '内部服务器错误' },
      { status: 500 }
    );
  }
}
