'use server';

import { redirect } from 'next/navigation';
import { db } from '@/db';
import { user, product, order } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getUsers() {
  try {
    const allUsers = await db.query.user.findMany();
    console.log('Fetched users:', allUsers);
    return allUsers;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function createOrder(productId: string) {
  const { auth } = await import('@clerk/nextjs/server');
  const { currentUser } = await import('@clerk/nextjs/server');

  try {
    // 验证用户身份
    const authResult = await auth();
    if (!authResult.userId) {
      throw new Error('用户未登录。');
    }

    // 查找或创建用户
    let dbUser = await db.query.user.findFirst({
      where: eq(user.clerkId, authResult.userId),
    });

    if (!dbUser) {
      const currentUserData = await currentUser();
      if (!currentUserData) {
        throw new Error('无法获取用户详细信息。');
      }
      const [newUser] = await db
        .insert(user)
        .values({
          clerkId: currentUserData.id,
          name: currentUserData.firstName || currentUserData.username || '',
        })
        .returning();
      dbUser = newUser;
    }

    // 查找商品
    const dbProduct = await db.query.product.findFirst({
      where: eq(product.id, parseInt(productId)),
    });

    if (!dbProduct) {
      throw new Error('Product not found');
    }

    // 创建订单
    const [newOrder] = await db
      .insert(order)
      .values({
        userId: dbUser.id,
        productId: dbProduct.id,
        amount: dbProduct.price,
        status: 'pending',
      })
      .returning();

    return {
      success: true,
      order: {
        id: newOrder.id,
        amount: newOrder.amount,
        status: newOrder.status,
        product: {
          id: dbProduct.id,
          name: dbProduct.name,
          price: dbProduct.price,
        },
      },
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const [updatedOrder] = await db
      .update(order)
      .set({ status: status as 'pending' | 'paid' | 'cancelled' })
      .where(eq(order.id, parseInt(orderId)))
      .returning();

    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export async function cancelOrder(orderId: string) {
  const { auth } = await import('@clerk/nextjs/server');
  
  try {
    // 验证用户身份
    const authResult = await auth();
    if (!authResult.userId) {
      throw new Error('用户未登录');
    }

    // 获取订单信息并验证所有者
    const dbOrder = await db.query.order.findFirst({
      where: eq(order.id, parseInt(orderId)),
      with: {
        user: true,
      },
    });

    if (!dbOrder) {
      throw new Error('订单不存在');
    }

    if (dbOrder.user?.clerkId !== authResult.userId) {
      throw new Error('无权限操作此订单');
    }

    if (dbOrder.status !== 'pending') {
      throw new Error('只能取消待支付的订单');
    }

    // 取消订单
    await db
      .update(order)
      .set({ status: 'cancelled' })
      .where(eq(order.id, parseInt(orderId)));

    return { success: true, message: '订单已成功取消' };
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
}

export async function repayOrder(formData: FormData) {
  const orderId = formData.get('orderId') as string;
  if (!orderId) {
    throw new Error('Order ID is required');
  }
  redirect(`/payment/${orderId}`);
} 