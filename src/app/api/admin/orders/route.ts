import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { order, user } from '@/db/schema';
import { and, eq, like, desc, count, inArray } from 'drizzle-orm';

type OrderWithRelations = {
  id: number;
  status: string;
  amount: number;
  currency: string;
  paypalOrderId: string | null;
  createdAt: Date;
  userId: number | null;
  productId: number | null;
  productVariantId: number | null;
  notes: string | null;
  user: {
    id: number;
    name: string | null;
    clerkId: string;
    email: string | null;
  } | null;
  product: {
    id: number;
    name: string;
    description: string;
    category: string;
  } | null;
  productVariant: {
    id: number;
    productId: number;
    name: string;
    price: number;
    imageData: string | null;
    imageMimeType: string | null;
    isDefault: number | null;
  } | null;
};

// 获取订单列表 (GET)
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const email = searchParams.get('email') || '';
    const orderId = searchParams.get('orderId') || '';

    // 获取总数和分页数据
    let totalCount = 0;
    let orders: OrderWithRelations[] = [];

    if (email || orderId) {
      // 有查询条件时，使用复杂查询
      const query = db
        .select({
          order: order,
          user: user,
        })
        .from(order)
        .leftJoin(user, eq(order.userId, user.id));

      const conditions = [];
      if (email) {
        conditions.push(like(user.email, `%${email}%`));
      }
      if (orderId) {
        conditions.push(eq(order.id, parseInt(orderId)));
      }

      const whereClause = and(...conditions);

      // 获取总数
      const totalCountResult = await query.where(whereClause);
      totalCount = totalCountResult.length;

      // 获取分页数据
      const paginatedResults = await query
        .where(whereClause)
        .orderBy(desc(order.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      // 获取完整的订单信息
      const orderIds = paginatedResults.map(r => r.order.id);
      if (orderIds.length > 0) {
        orders = await db.query.order.findMany({
          with: {
            user: true,
            product: true,
            productVariant: true,
          },
          where: inArray(order.id, orderIds),
          orderBy: [desc(order.createdAt)],
        });
      }
    } else {
      // 无查询条件时，直接查询
      const totalCountResult = await db.select({ count: count() }).from(order);
      totalCount = totalCountResult[0]?.count || 0;

      orders = await db.query.order.findMany({
        with: {
          user: true,
          product: true,
          productVariant: true,
        },
        orderBy: [desc(order.createdAt)],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
    }

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error('获取订单列表时出错:', error);

    if (error instanceof Error) {
      if (error.message === '未登录') {
        return NextResponse.json({ error: '未登录' }, { status: 401 });
      }
      if (error.message === '需要管理员权限') {
        return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: '内部服务器错误' },
      { status: 500 }
    );
  }
}
