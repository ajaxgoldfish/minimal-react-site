'use server';

import "reflect-metadata";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppDataSource } from "@/db/data-source";
import { User } from "@/db/entity/User";
import { Product } from "@/db/entity/Product";
import { Order } from "@/db/entity/Order";

export async function getUsers() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Data Source has been initialized!");

      const userRepository = AppDataSource.getRepository(User);
      const userCount = await userRepository.count();
      if (userCount === 0) {
        console.log("No users found. Seeding database...");
        await userRepository.save([
          { name: "Alice", age: 25 },
          { name: "Bob", age: 30 },
          { name: "Charlie", age: 35 },
        ]);
        console.log("Database has been seeded.");
      }
    }
    
    const users = await AppDataSource.manager.find(User);
    console.log("Fetched users:", users);
    return JSON.parse(JSON.stringify(users)); // Serialize users to be sent to the client
  } catch (error) {
    console.error("Error during data source operation:", error);
    // On subsequent calls after a failed initialization, it might be necessary to reset
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
    return [];
  }
}

export async function createOrder(formData: FormData) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
    return;
  }

  const productId = formData.get("productId") as string;
  if (!productId) {
    throw new Error("Product ID is required");
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const userRepository = AppDataSource.getRepository(User);
  const productRepository = AppDataSource.getRepository(Product);
  const orderRepository = AppDataSource.getRepository(Order);

  // 查找或创建用户
  let dbUser = await userRepository.findOne({ where: { clerkId: user.id } });
  if (!dbUser) {
    dbUser = userRepository.create({
      clerkId: user.id,
      name: user.firstName || user.username || "",
    });
    await userRepository.save(dbUser);
  }

  // 查找商品
  const product = await productRepository.findOne({
    where: { id: parseInt(productId) },
  });
  if (!product) {
    throw new Error("Product not found");
  }

  // 创建订单
  const order = orderRepository.create({
    user: dbUser,
    product: product,
    amount: product.price,
    status: "pending",
  });

  await orderRepository.save(order);

  // 重定向到支付页面
  redirect(`/payment/${order.id}`);
}

export async function confirmPayment(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const orderRepository = AppDataSource.getRepository(Order);
  
  const order = await orderRepository.findOne({
    where: { id: parseInt(orderId) },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  order.status = "paid";
  await orderRepository.save(order);

  // 支付成功后，重定向到用户中心
  redirect("/user");
} 