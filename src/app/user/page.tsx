// 这个页面需要权限检查，使用动态渲染
export const dynamic = 'force-dynamic';

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { OrderActions } from '@/components/OrderActions';
import Link from 'next/link';

export default async function UserPage() {
  const authResult = await auth();
  if (!authResult.userId) {
    redirect('/sign-in');
  }

  const currentUserData = await currentUser();
  if (!currentUserData) {
    redirect('/sign-in');
  }

  // 查找或创建用户
  let dbUser = await db.query.user.findFirst({
    where: eq(user.clerkId, authResult.userId),
  });

  if (!dbUser) {
    const [newUser] = await db
      .insert(user)
      .values({
        clerkId: currentUserData.id,
        name: currentUserData.firstName || currentUserData.username || '',
      })
      .returning();
    dbUser = newUser;
  }

  // 获取用户的订单，包含商品信息
  const userOrders = await db.query.user.findFirst({
    where: eq(user.id, dbUser.id),
    with: {
      orders: {
        with: {
          product: true,
        },
        orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">用户中心</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">个人信息</h2>
        <p><strong>姓名:</strong> {dbUser.name || '未设置'}</p>
        <p><strong>用户ID:</strong> {dbUser.clerkId}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">我的订单</h2>
        {userOrders?.orders && userOrders.orders.length > 0 ? (
          <div className="space-y-4">
            {userOrders.orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{order.product?.name}</h3>
                    <p className="text-gray-600">订单号: {order.id}</p>
                    <p className="text-sm text-gray-500">
                      创建时间: {order.createdAt instanceof Date
                        ? order.createdAt.toISOString().slice(0, 19).replace('T', ' ')
                        : new Date(order.createdAt).toISOString().slice(0, 19).replace('T', ' ')
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">${order.amount}</p>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.status === 'paid' ? '已支付' : 
                       order.status === 'pending' ? '待支付' : '已取消'}
                    </span>
                  </div>
                </div>
                
                {/* 订单操作组件 */}
                <OrderActions
                  orderId={order.id}
                  orderStatus={order.status}
                  productName={order.product?.name || '商品信息不可用'}
                  amount={order.amount}
                  shippingStatus={order.shippingStatus}
                  refundStatus={order.refundStatus}
                  shippingInfo={order.shippingInfo}
                />
                
                {/* 已取消订单的提示 */}
                {order.status === 'cancelled' && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-500">此订单已被取消</p>
                  </div>
                )}
                
                {/* 已支付订单的提示 */}
                {order.status === 'paid' && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-green-600">✓ 支付完成，感谢您的购买</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">暂无订单</p>
            <Link href="/products">
              <Button>
                去购物
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 