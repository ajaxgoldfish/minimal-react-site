import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { order } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    await requireAdmin();

    const { orderId, shippingStatus, shippingInfo } = await request.json();

    if (!orderId || !shippingStatus) {
      return NextResponse.json(
        { error: '订单ID和发货状态是必需的' },
        { status: 400 }
      );
    }

    // 验证发货状态值
    if (!['not_shipped', 'shipped'].includes(shippingStatus)) {
      return NextResponse.json(
        { error: '无效的发货状态' },
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

    // 只有已支付的订单才能更新发货状态
    if (existingOrder.status !== 'paid') {
      return NextResponse.json(
        { error: '只有已支付的订单才能更新发货状态' },
        { status: 400 }
      );
    }

    // 更新发货状态
    const updateData: {
      shippingStatus: string;
      shippingInfo?: string | null;
    } = {
      shippingStatus,
    };

    // 如果是发货状态，可以设置发货信息
    if (shippingStatus === 'shipped' && shippingInfo) {
      updateData.shippingInfo = shippingInfo;
    }

    // 如果是取消发货，清除发货信息
    if (shippingStatus === 'not_shipped') {
      updateData.shippingInfo = null;
    }

    const [updatedOrder] = await db
      .update(order)
      .set(updateData)
      .where(eq(order.id, parseInt(orderId)))
      .returning();

    return NextResponse.json({
      success: true,
      message: '发货状态更新成功',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('更新发货状态时出错:', error);
    
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
