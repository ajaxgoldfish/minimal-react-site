import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { product } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    const params = await context.params;
    const productId = parseInt(params.productId);
    if (isNaN(productId)) {
      return NextResponse.json({ error: '无效的商品ID' }, { status: 400 });
    }

    const dbProduct = await db.query.product.findFirst({
      where: and(eq(product.id, productId), eq(product.isActive, 1)),
    });

    if (!dbProduct) {
      return NextResponse.json({ error: '商品不存在或已下架' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: dbProduct,
    });
  } catch (error) {
    console.error('获取商品详情时出错:', error);
    return NextResponse.json(
      { error: '内部服务器错误' },
      { status: 500 }
    );
  }
} 