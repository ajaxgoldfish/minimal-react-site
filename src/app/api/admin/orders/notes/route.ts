import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { order } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    await requireAdmin();

    const { orderId, notes } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: '订单ID是必需的' },
        { status: 400 }
      );
    }

    // 查找订单
    const existingOrder = await db.query.order.findFirst({
      where: eq(order.id, parseInt(orderId)),
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      );
    }

    // 更新备注信息
    const [updatedOrder] = await db
      .update(order)
      .set({ notes: notes || null })
      .where(eq(order.id, parseInt(orderId)))
      .returning();

    return NextResponse.json({
      success: true,
      message: '备注信息更新成功',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('更新备注信息时出错:', error);
    
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
