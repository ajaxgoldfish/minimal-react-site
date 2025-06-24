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
  const { userId } = await auth();
  if (!userId) {
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
  let dbUser = await userRepository.findOne({ where: { clerkId: userId } });
  if (!dbUser) {
    // 仅在需要创建新用户时，才获取完整的用户信息
    const user = await currentUser();
    if (!user) {
        // 这理论上不应该发生，因为我们已经通过了userId检查
        throw new Error("无法获取用户详细信息。")
    }
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

// 新增：专门为Modal流程设计的创建订单函数
export async function createOrderForModal(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
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
  let dbUser = await userRepository.findOne({ where: { clerkId: userId } });
  if (!dbUser) {
    const user = await currentUser();
    if (!user) {
        throw new Error("无法获取用户详细信息。")
    }
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

  // 返回订单信息而不是重定向
  return {
    success: true,
    order: {
      id: order.id,
      amount: order.amount,
      status: order.status,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
      }
    }
  };
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

export async function cancelOrder(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  // 可以在这里添加额外的用户权限校验，确保只有订单所有者才能取消
  // const { userId } = auth(); ...

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

  // 只能取消待支付的订单
  if (order.status === 'pending') {
    order.status = "cancelled";
    await orderRepository.save(order);
  }

  // 操作完成后刷新当前页面
  redirect("/user");
}

export async function repayOrder(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  if (!orderId) {
    throw new Error("Order ID is required");
  }
  redirect(`/payment/${orderId}`);
} 