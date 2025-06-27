import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { order } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { orderId, action, refundRequestInfo } = await request.json();

    if (!orderId || !action) {
      return NextResponse.json({ error: '订单ID和操作类型是必需的' }, { status: 400 });
    }

    // 验证操作类型
    if (!['apply', 'cancel'].includes(action)) {
      return NextResponse.json({ error: '无效的操作类型' }, { status: 400 });
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

    // 只有已支付的订单才能申请退款
    if (dbOrder.status !== 'paid') {
      return NextResponse.json({ error: '只有已支付的订单才能申请退款' }, { status: 400 });
    }

    let newRefundStatus: string;
    let message: string;

    if (action === 'apply') {
      // 申请退款
      if (dbOrder.refundStatus !== 'normal') {
        return NextResponse.json({ error: '订单已在退款流程中' }, { status: 400 });
      }

      // 验证退货申请信息
      if (!refundRequestInfo || !refundRequestInfo.trim()) {
        return NextResponse.json({ error: '请填写申请退货信息' }, { status: 400 });
      }

      if (!refundRequestInfo.includes('@')) {
        return NextResponse.json({ error: '请在申请退货信息中留下您的电子邮件地址' }, { status: 400 });
      }

      newRefundStatus = 'pending';
      message = '退款申请已提交，等待管理员审核';
    } else {
      // 取消申请
      if (dbOrder.refundStatus !== 'pending') {
        return NextResponse.json({ error: '只能取消申请中的退款' }, { status: 400 });
      }
      newRefundStatus = 'normal';
      message = '退款申请已取消';
    }

    // 更新退款状态
    const updateData: { refundStatus: string; refundRequestInfo?: string | null } = {
      refundStatus: newRefundStatus
    };

    // 如果是申请退款，保存申请信息；如果是取消申请，清空申请信息
    if (action === 'apply') {
      updateData.refundRequestInfo = refundRequestInfo;
    } else if (action === 'cancel') {
      updateData.refundRequestInfo = null;
    }

    const [updatedOrder] = await db
      .update(order)
      .set(updateData)
      .where(eq(order.id, parseInt(orderId)))
      .returning();

    return NextResponse.json({
      success: true,
      message,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('处理退款申请时出错:', error);
    return NextResponse.json(
      { error: '内部服务器错误' },
      { status: 500 }
    );
  }
}
