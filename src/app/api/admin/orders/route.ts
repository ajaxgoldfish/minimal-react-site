import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';

// 获取所有订单 (GET)
export async function GET() {
  try {
    // 验证管理员权限
    await requireAdmin();

    const orders = await db.query.order.findMany({
      with: {
        user: true,
        product: true,
      },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('获取订单列表时出错:', error);
    
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
