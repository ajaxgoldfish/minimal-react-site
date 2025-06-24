import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import "reflect-metadata";
import { AppDataSource } from "@/db/data-source";
import { User } from "@/db/entity/User";
import { Order } from "@/db/entity/Order";

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
          orders.map((order) => (
            <div key={order.id} className="bg-white shadow-md rounded-lg p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex-grow mb-4 sm:mb-0">
                <p className="text-sm text-gray-500 font-mono">订单号: {order.id}</p>
                <h2 className="text-xl font-semibold mt-1">{order.product.name}</h2>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                <p className="text-2xl font-bold mb-2">¥{Number(order.amount).toFixed(2)}</p>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status === 'paid' ? '已支付' : '待支付'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 