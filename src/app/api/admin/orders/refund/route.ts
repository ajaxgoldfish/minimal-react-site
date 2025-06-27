import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { order } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    await requireAdmin();

    const { orderId, refundStatus } = await request.json();

    if (!orderId || !refundStatus) {
      return NextResponse.json(
        { error: '订单ID和退款状态是必需的' },
        { status: 400 }
      );
    }

    // 验证退款状态值
    if (!['normal', 'pending', 'approved', 'rejected'].includes(refundStatus)) {
      return NextResponse.json(
        { error: '无效的退款状态' },
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

    // 更新退款状态
    const [updatedOrder] = await db
      .update(order)
      .set({ refundStatus })
      .where(eq(order.id, parseInt(orderId)))
      .returning();

    return NextResponse.json({
      success: true,
      message: '退款状态更新成功',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('更新退款状态时出错:', error);
    
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
