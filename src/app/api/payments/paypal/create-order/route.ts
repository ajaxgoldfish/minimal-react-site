import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getPayPalService } from '@/lib/paypal';
import { db } from '@/db';
import { user, order } from '@/db/schema';
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

    // 获取用户信息
    const dbUser = await db.query.user.findFirst({
      where: eq(user.clerkId, authResult.userId),
    });
    if (!dbUser) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 获取订单信息，并带上商品信息
    const dbOrder = await db.query.order.findFirst({
      where: eq(order.id, orderId),
      with: {
        product: true,
      },
    });

    if (!dbOrder || !dbOrder.product) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    if (dbOrder.status !== 'pending') {
      return NextResponse.json({ error: '订单状态无效' }, { status: 400 });
    }

    if (dbOrder.userId !== dbUser.id) {
      return NextResponse.json({ error: '无权限访问此订单' }, { status: 403 });
    }

    // 创建 PayPal 订单
    const paypalService = getPayPalService();
    const paypalResult = await paypalService.createOrder({
      orderId: dbOrder.id,
      amount: dbOrder.amount.toFixed(2),
      currency: dbOrder.currency,
      description: `购买 ${dbOrder.product.name}`,
    });

    if (!paypalResult.success) {
      return NextResponse.json(
        { error: 'PayPal 订单创建失败' },
        { status: 500 }
      );
    }

    // 更新订单的 PayPal 订单ID
    await db
      .update(order)
      .set({ paypalOrderId: paypalResult.paypalOrderId })
      .where(eq(order.id, dbOrder.id));

    return NextResponse.json({
      success: true,
      paypalOrderId: paypalResult.paypalOrderId,
    });
  } catch (error) {
    console.error('创建 PayPal 订单时出错:', error);
    return NextResponse.json(
      { error: '内部服务器错误' },
      { status: 500 }
    );
  }
} 