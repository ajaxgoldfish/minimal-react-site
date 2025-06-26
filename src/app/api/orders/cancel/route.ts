import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { order } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: '订单ID是必需的' }, { status: 400 });
    }

    // 验证用户身份
    const authResult = await auth();
    if (!authResult.userId) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 });
    }

    // 获取订单信息并验证所有者
    const dbOrder = await db.query.order.findFirst({
      where: eq(order.id, parseInt(orderId)),
      with: {
        user: true,
        product: true,
      },
    });

    if (!dbOrder) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    if (dbOrder.user?.clerkId !== authResult.userId) {
      return NextResponse.json({ error: '无权限操作此订单' }, { status: 403 });
    }

    if (dbOrder.status !== 'pending') {
      return NextResponse.json({ error: '只能取消待支付的订单' }, { status: 400 });
    }

    // 取消订单
    const [updatedOrder] = await db
      .update(order)
      .set({ status: 'cancelled' })
      .where(eq(order.id, parseInt(orderId)))
      .returning();

    return NextResponse.json({
      success: true,
      message: '订单已成功取消',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('取消订单时出错:', error);
    return NextResponse.json(
      { error: '内部服务器错误' },
      { status: 500 }
    );
  }
} 