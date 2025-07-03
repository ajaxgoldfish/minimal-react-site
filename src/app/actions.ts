'use server';

import { redirect } from 'next/navigation';
import { db } from '@/db';
import { product, order } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

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

export async function createOrder(productId: string, variantId?: number) {
  try {
    // 使用新的权限系统
    const currentUser = await requireAuth();

    // 查找商品
    const dbProduct = await db.query.product.findFirst({
      where: eq(product.id, parseInt(productId)),
      with: {
        variants: true,
      },
    });

    if (!dbProduct) {
      throw new Error('Product not found');
    }

    // 确定使用的规格
    let selectedVariant;
    if (variantId) {
      selectedVariant = dbProduct.variants.find(v => v.id === variantId);
      if (!selectedVariant) {
        throw new Error('Product variant not found');
      }
    } else {
      // 如果没有指定规格，使用默认规格
      selectedVariant = dbProduct.variants.find(v => v.isDefault === 1) || dbProduct.variants[0];
      if (!selectedVariant) {
        throw new Error('No product variant available');
      }
    }



    // 创建订单
    const [newOrder] = await db
      .insert(order)
      .values({
        userId: currentUser.id,
        productId: dbProduct.id,
        productVariantId: selectedVariant.id,
        amount: selectedVariant.price,
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
          price: selectedVariant.price,
        },
        variant: {
          id: selectedVariant.id,
          name: selectedVariant.name,
          price: selectedVariant.price,
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
  try {
    // 验证用户身份
    const currentUser = await requireAuth();

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

    // 验证订单所有权（管理员可以操作所有订单）
    if (currentUser.role !== 'admin' && dbOrder.userId !== currentUser.id) {
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