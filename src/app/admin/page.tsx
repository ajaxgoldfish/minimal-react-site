import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { order, product, user } from '@/db/schema';
import { count, sql } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

// 这个页面需要权限检查，使用动态渲染
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // 权限检查：要求管理员权限
  try {
    await requireAdmin();
  } catch {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">无权限访问</h1>
          <p className="text-gray-600 mb-6">抱歉，您没有访问管理员页面的权限。</p>
          <Link href="/user">
            <Button>返回用户中心</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 获取统计数据
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    pendingOrders,
    paidOrders,
  ] = await Promise.all([
    db.select({ count: count() }).from(user),
    db.select({ count: count() }).from(product),
    db.select({ count: count() }).from(order),
    db.select({ count: count() }).from(order).where(sql`status = 'pending'`),
    db.select({ count: count() }).from(order).where(sql`status = 'paid'`),
  ]);

  // 获取最新订单
  const recentOrders = await db.query.order.findMany({
    with: {
      user: true,
      product: true,
    },
    limit: 10,
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">管理员仪表板</h1>
        <div className="flex gap-2">
          <Link href="/admin/products">
            <Button>商品管理</Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="outline">订单管理</Button>
          </Link>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">总用户数</h3>
          <p className="text-3xl font-bold text-blue-600">{totalUsers[0].count}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">总商品数</h3>
          <p className="text-3xl font-bold text-green-600">{totalProducts[0].count}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">总订单数</h3>
          <p className="text-3xl font-bold text-purple-600">{totalOrders[0].count}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">待支付</h3>
          <p className="text-3xl font-bold text-yellow-600">{pendingOrders[0].count}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">已支付</h3>
          <p className="text-3xl font-bold text-emerald-600">{paidOrders[0].count}</p>
        </Card>
      </div>

      {/* 最新订单 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">最新订单</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">订单ID</th>
                <th className="text-left p-2">用户</th>
                <th className="text-left p-2">商品</th>
                <th className="text-left p-2">金额</th>
                <th className="text-left p-2">状态</th>
                <th className="text-left p-2">时间</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="p-2">#{order.id}</td>
                  <td className="p-2">{order.user?.name || '未知用户'}</td>
                  <td className="p-2">{order.product?.name || '未知商品'}</td>
                  <td className="p-2">${order.amount.toFixed(2)}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.status === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'paid' ? '已支付' : 
                       order.status === 'pending' ? '待支付' : '已取消'}
                    </span>
                  </td>
                  <td className="p-2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {recentOrders.length === 0 && (
          <p className="text-center text-gray-500 py-8">暂无订单</p>
        )}
      </Card>
    </div>
  );
} 