import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import "reflect-metadata";
import { AppDataSource } from "@/db/data-source";
import { User } from "@/db/entity/User";
import { Order } from "@/db/entity/Order";
import { Button } from "@/components/ui/button";
import { cancelOrder, repayOrder } from "@/app/actions";

async function getOrders(clerkId: string) {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const orderRepository = AppDataSource.getRepository(Order);
  // 使用 QueryBuilder 来进行更复杂的查询
  const orders = await orderRepository
    .createQueryBuilder("order")
    .leftJoinAndSelect("order.product", "product")
    .leftJoin("order.user", "user")
    .where("user.clerkId = :clerkId", { clerkId })
    .orderBy("order.createdAt", "DESC")
    .getMany();
  
  return orders;
}

export default async function UserPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const orders = await getOrders(user.id);

  const welcomeMessage = user.firstName
    ? `欢迎, ${user.firstName}`
    : `欢迎, ${user.username}`;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{welcomeMessage}</h1>
        <p className="text-gray-600">订单中心</p>
      </div>
      
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">您还没有任何订单。</p>
          </div>
        ) : (
          orders.map((order) => {
            const isPending = order.status === 'pending';
            const isCancelled = order.status === 'cancelled';
            const statusStyles = {
              paid: 'bg-green-100 text-green-800',
              pending: 'bg-yellow-100 text-yellow-800',
              cancelled: 'bg-gray-100 text-gray-500',
            };
            const statusTexts = {
              paid: '已支付',
              pending: '待支付',
              cancelled: '已取消',
            };

            return (
              <div key={order.id} className={`bg-white shadow-md rounded-lg p-6 flex flex-col sm:flex-row justify-between items-start ${isCancelled ? 'opacity-60' : ''}`}>
                <div className="flex-grow mb-4 sm:mb-0">
                  <p className="text-sm text-gray-500 font-mono">订单号: {order.id}</p>
                  <h2 className="text-xl font-semibold mt-1">{order.product.name}</h2>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                  <p className="text-2xl font-bold mb-2">¥{Number(order.amount).toFixed(2)}</p>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[order.status as keyof typeof statusStyles]}`}>
                    {statusTexts[order.status as keyof typeof statusTexts]}
                  </span>
                  {isPending && (
                    <div className="flex items-center gap-2 mt-4">
                      <form action={cancelOrder}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <Button type="submit" variant="ghost" size="sm">取消订单</Button>
                      </form>
                      <form action={repayOrder}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <Button type="submit" size="sm">重新支付</Button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 