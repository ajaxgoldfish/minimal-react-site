import "reflect-metadata";
import { Order } from "@/db/entity/Order";
import { notFound } from "next/navigation";
import PaymentPageClient from "./PaymentPageClient";

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

  // 转换数据格式以匹配客户端组件的接口
  const orderData = {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency || 'USD',
    status: order.status,
    product: {
      name: order.product.name,
    },
  };

  return <PaymentPageClient order={orderData} />;
} 