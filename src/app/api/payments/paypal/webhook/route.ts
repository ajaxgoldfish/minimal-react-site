import { NextRequest, NextResponse } from 'next/server';
import { paypalService } from '@/lib/paypal';
import { AppDataSource } from '@/db/data-source';
import { Order } from '@/db/entity/Order';

export async function POST(request: NextRequest) {
  try {
    // 获取请求体
    const body = await request.text();
    const headers = request.headers;

    // 验证 Webhook 签名（沙盒环境简化版）
    const webhookId = process.env.PAYPAL_WEBHOOK_ID || 'test-webhook-id';
    const isValid = await paypalService.verifyWebhookSignature(headers, body, webhookId);

    if (!isValid) {
      console.log('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // 解析事件数据
    const event = JSON.parse(body);
    const eventType = event.event_type;

    console.log('PayPal Webhook Event:', eventType, event.id);

    // 初始化数据库连接
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const orderRepo = AppDataSource.getRepository(Order);

    // 处理不同类型的事件
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        // 支付捕获完成
        const resource = event.resource;
        const paypalOrderId = resource.supplementary_data?.related_ids?.order_id;

        if (!paypalOrderId) {
          console.log('No PayPal order ID found in webhook');
          break;
        }

        // 查找本地订单
        const order = await orderRepo.findOne({
          where: { paypalOrderId },
        });

        if (!order) {
          console.log('Local order not found for PayPal order:', paypalOrderId);
          break;
        }

        // 更新订单状态为已支付
        if (order.status !== 'paid') {
          order.status = 'paid';
          await orderRepo.save(order);
          console.log('Order updated to paid:', order.id);
        }

        break;
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED': {
        // 支付被拒绝或失败
        const resource = event.resource;
        const paypalOrderId = resource.supplementary_data?.related_ids?.order_id;

        if (!paypalOrderId) {
          console.log('No PayPal order ID found in webhook');
          break;
        }

        // 查找本地订单
        const order = await orderRepo.findOne({
          where: { paypalOrderId },
        });

        if (!order) {
          console.log('Local order not found for PayPal order:', paypalOrderId);
          break;
        }

        // 更新订单状态为失败
        if (order.status === 'pending') {
          order.status = 'failed';
          await orderRepo.save(order);
          console.log('Order updated to failed:', order.id);
        }

        break;
      }

      case 'CHECKOUT.ORDER.APPROVED': {
        // 用户批准了支付（但还未捕获）
        const resource = event.resource;
        const paypalOrderId = resource.id;

        console.log('PayPal order approved:', paypalOrderId);
        break;
      }

      case 'CHECKOUT.ORDER.CANCELLED': {
        // 用户取消了支付
        const resource = event.resource;
        const paypalOrderId = resource.id;

        // 查找本地订单
        const order = await orderRepo.findOne({
          where: { paypalOrderId },
        });

        if (order && order.status === 'pending') {
          order.status = 'cancelled';
          await orderRepo.save(order);
          console.log('Order updated to cancelled:', order.id);
        }

        break;
      }

      default:
        console.log('Unhandled webhook event type:', eventType);
    }

    // 返回成功响应
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
} 