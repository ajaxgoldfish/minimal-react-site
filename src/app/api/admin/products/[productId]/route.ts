import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { product } from '@/db/schema';
import { eq } from 'drizzle-orm';

// 更新商品 (PUT)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    // 验证管理员权限
    await requireAdmin();

    const params = await context.params;
    const productId = parseInt(params.productId);
    
    if (isNaN(productId)) {
      return NextResponse.json({ error: '无效的商品ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, category, price, image } = body;

    // 验证必填字段
    if (!name || !description || !category || !price || !image) {
      return NextResponse.json(
        { error: '所有字段都是必填的' },
        { status: 400 }
      );
    }

    // 验证价格
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return NextResponse.json(
        { error: '价格必须是大于0的数字' },
        { status: 400 }
      );
    }

    // 检查商品是否存在
    const existingProduct = await db.query.product.findFirst({
      where: eq(product.id, productId),
    });

    if (!existingProduct) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    // 更新商品
    const [updatedProduct] = await db
      .update(product)
      .set({
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        price: numPrice,
        image: image.trim(),
      })
      .where(eq(product.id, productId))
      .returning();

    return NextResponse.json({
      success: true,
      message: '商品更新成功',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('更新商品时出错:', error);
    
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

// 删除商品 (DELETE)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    // 验证管理员权限
    await requireAdmin();

    const params = await context.params;
    const productId = parseInt(params.productId);
    
    if (isNaN(productId)) {
      return NextResponse.json({ error: '无效的商品ID' }, { status: 400 });
    }

    // 检查商品是否存在
    const existingProduct = await db.query.product.findFirst({
      where: eq(product.id, productId),
    });

    if (!existingProduct) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    // 删除商品
    await db.delete(product).where(eq(product.id, productId));

    return NextResponse.json({
      success: true,
      message: '商品删除成功',
    });
  } catch (error) {
    console.error('删除商品时出错:', error);
    
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
