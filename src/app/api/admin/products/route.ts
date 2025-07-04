import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { product } from '@/db/schema';

// 获取所有商品 (GET)
export async function GET() {
  try {
    // 验证管理员权限
    await requireAdmin();

    const products = await db.query.product.findMany({
      orderBy: (products, { desc }) => [desc(products.id)],
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error('获取商品列表时出错:', error);
    
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

// 创建新商品 (POST)
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    await requireAdmin();

    const body = await request.json();
    const { name, description, category, price, image, isActive } = body;

    // 验证必填字段
    if (!name || !description || !category || !price) {
      return NextResponse.json(
        { error: '商品名称、描述、分类和价格都是必填的' },
        { status: 400 }
      );
    }

    // 创建商品
    const [newProduct] = await db
      .insert(product)
      .values({
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        price: parseFloat(price),
        image: image ? image.trim() : null,
        isActive: isActive !== undefined ? isActive : 1,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: '商品创建成功',
      product: newProduct,
    });
  } catch (error) {
    console.error('创建商品时出错:', error);
    
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
