import { NextRequest, NextResponse } from 'next/server';
import { getPayPalService } from '@/lib/paypal';
import { db } from '@/db';
import { order } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { paypalOrderId } = await request.json();

    if (!paypalOrderId) {
      return NextResponse.json(
        { error: 'PayPal 订单ID是必需的' },
        { status: 400 }
      );
    }

    // 验证用户身份
    const authResult = await auth();
    if (!authResult.userId) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 });
    }

    // 获取订单信息
    const dbOrder = await db.query.order.findFirst({
      where: eq(order.paypalOrderId, paypalOrderId),
      with: {
        user: true,
        product: true,
      },
    });

    if (!dbOrder) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    if (dbOrder.user?.clerkId !== authResult.userId) {
      return NextResponse.json({ error: '无权限访问此订单' }, { status: 403 });
    }

    // 捕获 PayPal 支付
    const paypalService = getPayPalService();
    const captureResult = await paypalService.capturePayment(paypalOrderId);

    if (!captureResult.success) {
      return NextResponse.json(
        { error: 'PayPal 支付捕获失败' },
        { status: 500 }
      );
    }

    // 更新订单状态
    const [updatedOrder] = await db
      .update(order)
      .set({ status: 'paid' })
      .where(eq(order.id, dbOrder.id))
      .returning();

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('捕获 PayPal 支付时出错:', error);
    return NextResponse.json(
      { error: '内部服务器错误' },
      { status: 500 }
    );
  }
} 