import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { paypalService } from '@/lib/paypal';
import { AppDataSource } from '@/db/data-source';
import { Order } from '@/db/entity/Order';

export async function POST(request: NextRequest) {
  try {
    // 检查用户认证
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '需要登录才能完成支付' },
        { status: 401 }
      );
    }

    const { paypalOrderId } = await request.json();

    if (!paypalOrderId) {
      return NextResponse.json(
        { error: '缺少PayPal订单ID' },
        { status: 400 }
      );
    }

    // 初始化数据库连接
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // 查找本地订单
    const orderRepo = AppDataSource.getRepository(Order);
    const order = await orderRepo.findOne({
      where: { paypalOrderId },
      relations: ['product'],
    });

    if (!order) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      );
    }

    // 验证订单所有者
    if (order.userId !== userId) {
      return NextResponse.json(
        { error: '无权限访问此订单' },
        { status: 403 }
      );
    }

    // 验证订单状态
    if (order.status === 'paid') {
      return NextResponse.json(
        { 
          success: true, 
          message: '订单已支付',
          order: {
            id: order.id,
            status: order.status,
            amount: order.amount,
            currency: order.currency,
          }
        }
      );
    }

    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: '订单状态无效' },
        { status: 400 }
      );
    }

    // 捕获 PayPal 支付
    const captureResult = await paypalService.capturePayment(paypalOrderId);

    if (!captureResult.success) {
      return NextResponse.json(
        { error: '捕获PayPal支付失败' },
        { status: 500 }
      );
    }

    // 更新订单状态
    order.status = 'paid';
    await orderRepo.save(order);

    return NextResponse.json({
      success: true,
      message: '支付成功',
      order: {
        id: order.id,
        status: order.status,
        amount: order.amount,
        currency: order.currency,
      },
      paymentDetails: {
        paymentId: captureResult.paymentId,
        status: captureResult.status,
        amount: captureResult.amount,
      },
    });

  } catch (error) {
    console.error('Capture PayPal payment error:', error);
    return NextResponse.json(
      { error: '捕获PayPal支付时发生错误' },
      { status: 500 }
    );
  }
} 