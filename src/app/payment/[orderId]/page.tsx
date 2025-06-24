import "reflect-metadata";
// import { AppDataSource } from "@/db/data-source"; // We will move this
import { Order } from "@/db/entity/Order";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { confirmPayment } from "@/app/actions";

async function getOrder(orderId: number) {
  try {
    const { AppDataSource } = await import("@/db/data-source");
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const orderRepository = AppDataSource.getRepository(Order);
    const order = await orderRepository.findOne({
      where: { id: orderId },
      relations: ["product", "user"],
    });
    return order;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = await params;
  const orderId = parseInt(resolvedParams.orderId);
  
  if (isNaN(orderId)) {
    notFound();
  }
  
  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">确认订单</h1>
        <div className="space-y-4 text-lg">
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">订单号:</span>
            <span className="font-mono">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">商品:</span>
            <span className="font-semibold">{order.product.name}</span>
          </div>
          <div className="border-t my-4"></div>
          <div className="flex justify-between text-2xl font-bold">
            <span className="font-medium">总金额:</span>
            <span>¥ {Number(order.amount).toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-8">
          <form action={confirmPayment}>
            <input type="hidden" name="orderId" value={order.id} />
            <Button type="submit" className="w-full text-lg py-6">
              确认支付
            </Button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          这是一个模拟支付页面。
        </p>
      </div>
    </div>
  );
} 