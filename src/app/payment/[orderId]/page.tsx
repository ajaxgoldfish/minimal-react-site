import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import PaymentPageClient from './PaymentPageClient';
import { db } from '@/db';
import { order } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function getOrderDetails(orderId: string, clerkId: string) {
  const dbOrder = await db.query.order.findFirst({
    where: eq(order.id, parseInt(orderId)),
    with: {
      user: true,
      product: true,
      productVariant: true,
    },
  });

  if (!dbOrder || !dbOrder.user || !dbOrder.product) {
    return null;
  }

  // 验证订单所有者
  if (dbOrder.user.clerkId !== clerkId) {
    return null;
  }

  return dbOrder;
}

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const authResult = await auth();
  if (!authResult.userId) {
    redirect('/sign-in');
  }

  const resolvedParams = await params;
  const orderDetails = await getOrderDetails(resolvedParams.orderId, authResult.userId);
  if (!orderDetails) {
    redirect('/user');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">支付订单</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 订单详情 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">订单详情</h2>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">订单号: {orderDetails.id}</p>
            <h3 className="text-lg font-semibold mt-2">
              {orderDetails.product!.name}
            </h3>
            {orderDetails.productVariant && (
              <p className="text-sm text-gray-600">规格: {orderDetails.productVariant.name}</p>
            )}
            <p className="text-gray-600">{orderDetails.product!.description}</p>
            <p className="text-2xl font-bold mt-4">
              ¥{orderDetails.amount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* 支付表单 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">支付方式</h2>
          <PaymentPageClient order={orderDetails} />
        </div>
      </div>
    </div>
  );
} 