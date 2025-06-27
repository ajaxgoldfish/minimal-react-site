import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { product, productVariant } from '@/db/schema';

// 获取所有商品 (GET)
export async function GET() {
  try {
    // 验证管理员权限
    await requireAdmin();

    const products = await db.query.product.findMany({
      orderBy: (products, { desc }) => [desc(products.id)],
      with: {
        variants: {
          orderBy: (variants, { asc, desc }) => [desc(variants.isDefault), asc(variants.id)],
        },
      },
    });

    // 转换数据格式，解析规格的详情图JSON
    const productsWithVariants = products.map(product => ({
      ...product,
      variants: product.variants.map(variant => ({
        ...variant,
        detailImages: variant.detailImages ?
          (() => {
            try {
              return JSON.parse(variant.detailImages);
            } catch (e) {
              console.error('Failed to parse detail images for variant', variant.id, e);
              return null;
            }
          })() : null,
      })),
    }));

    return NextResponse.json({
      success: true,
      products: productsWithVariants,
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
    const { name, description, category, image } = body;

    // 验证必填字段
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: '商品名称、描述和分类都是必填的' },
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
        image: image ? image.trim() : null,
      })
      .returning();

    // 创建默认规格
    const [defaultVariant] = await db
      .insert(productVariant)
      .values({
        productId: newProduct.id,
        name: '默认规格',
        price: 0,
        isDefault: 1,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: '商品创建成功',
      product: {
        ...newProduct,
        variants: [defaultVariant],
      },
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
