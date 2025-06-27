import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { product } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    // 创建商品
    const [newProduct] = await db
      .insert(product)
      .values({
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        price: numPrice,
        image: image.trim(),
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
