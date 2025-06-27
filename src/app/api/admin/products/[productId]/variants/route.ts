import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { product, productVariant } from '@/db/schema';
import { eq } from 'drizzle-orm';

// 获取商品的所有规格 (GET)
export async function GET(
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

    // 获取规格列表
    const variants = await db.query.productVariant.findMany({
      where: eq(productVariant.productId, productId),
      orderBy: (variants, { asc, desc }) => [desc(variants.isDefault), asc(variants.id)],
    });

    // 解析详情图JSON数据
    const variantsWithParsedImages = variants.map(variant => ({
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
    }));

    return NextResponse.json({
      success: true,
      variants: variantsWithParsedImages,
    });
  } catch (error) {
    console.error('获取商品规格时出错:', error);
    
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

// 创建新规格 (POST)
export async function POST(
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
    const { name, price, imageData, imageMimeType, detailImages, isDefault } = body;

    // 验证必填字段
    if (!name || !price) {
      return NextResponse.json(
        { error: '规格名称和价格都是必填的' },
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

    // 如果设置为默认规格，取消其他规格的默认状态
    if (isDefault) {
      await db
        .update(productVariant)
        .set({ isDefault: 0 })
        .where(eq(productVariant.productId, productId));
    }

    // 处理详情图数据
    let detailImagesJson: string | null = null;
    if (detailImages && Array.isArray(detailImages) && detailImages.length > 0) {
      detailImagesJson = JSON.stringify(detailImages);
    }

    // 创建规格
    const [newVariant] = await db
      .insert(productVariant)
      .values({
        productId: productId,
        name: name.trim(),
        price: numPrice,
        imageData: imageData || null,
        imageMimeType: imageMimeType || null,
        detailImages: detailImagesJson,
        isDefault: isDefault ? 1 : 0,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: '规格创建成功',
      variant: newVariant,
    });
  } catch (error) {
    console.error('创建规格时出错:', error);
    
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
