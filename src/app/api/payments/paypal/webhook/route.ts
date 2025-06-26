import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { order } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证 PayPal webhook 签名（生产环境中应该实现）
    // 这里简化处理，实际项目中需要验证 webhook 的真实性
    
    if (body.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const paypalOrderId = body.resource?.supplementary_data?.related_ids?.order_id;
      
      if (paypalOrderId) {
        const updatedOrder = await db
          .update(order)
          .set({ status: 'paid' })
          .where(eq(order.paypalOrderId, paypalOrderId))
          .returning();
        
        console.log('订单状态已通过 webhook 更新:', updatedOrder);
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('处理 PayPal webhook 时出错:', error);
    return NextResponse.json(
      { error: '内部服务器错误' },
      { status: 500 }
    );
  }
} 