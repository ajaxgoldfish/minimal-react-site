import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { paypalService } from '@/lib/paypal';
import { AppDataSource } from '@/db/data-source';
import { Order } from '@/db/entity/Order';
import { Product } from '@/db/entity/Product';
import { User } from '@/db/entity/User';

export async function POST(request: NextRequest) {
  try {
    // 检查用户认证
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '需要登录才能创建订单' },
        { status: 401 }
      );
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: '缺少订单ID' },
        { status: 400 }
      );
    }

    // 初始化数据库连接
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // 首先获取当前用户信息
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取订单信息
    const orderRepo = AppDataSource.getRepository(Order);
    const order = await orderRepo.findOne({
      where: { id: orderId },
      relations: ['product'],
    });

    if (!order) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      );
    }

    // 验证订单状态
    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: '订单状态无效' },
        { status: 400 }
      );
    }

    // 验证订单所有者（使用数据库用户ID）
    if (order.userId !== user.id) {
      return NextResponse.json(
        { error: '无权限访问此订单' },
        { status: 403 }
      );
    }

    // 创建 PayPal 订单
    const paypalResult = await paypalService.createOrder({
      orderId: order.id,
      amount: order.amount.toFixed(2),
      currency: order.currency,
      description: `购买 ${order.product.name}`,
    });

    if (!paypalResult.success) {
      return NextResponse.json(
        { error: '创建PayPal订单失败' },
        { status: 500 }
      );
    }

    // 更新订单的 PayPal 订单ID
    order.paypalOrderId = paypalResult.paypalOrderId;
    await orderRepo.save(order);

    return NextResponse.json({
      success: true,
      paypalOrderId: paypalResult.paypalOrderId,
      approvalUrl: paypalResult.approvalUrl,
    });

  } catch (error) {
    console.error('Create PayPal order error:', error);
    return NextResponse.json(
      { error: '创建PayPal订单时发生错误' },
      { status: 500 }
    );
  }
} 