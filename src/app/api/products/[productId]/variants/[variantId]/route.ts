import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { productVariant } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ productId: string; variantId: string }> }
) {
  try {
    const params = await context.params;
    const productId = parseInt(params.productId);
    const variantId = parseInt(params.variantId);
    
    if (isNaN(productId) || isNaN(variantId)) {
      return NextResponse.json({ error: '无效的ID' }, { status: 400 });
    }

    const variant = await db.query.productVariant.findFirst({
      where: eq(productVariant.id, variantId),
      with: {
        product: true,
      },
    });

    if (!variant) {
      return NextResponse.json({ error: '规格不存在' }, { status: 404 });
    }

    if (variant.productId !== productId) {
      return NextResponse.json({ error: '规格不属于该商品' }, { status: 400 });
    }

    // 解析详情图JSON数据
    const variantWithParsedImages = {
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
    };

    return NextResponse.json(variantWithParsedImages);
  } catch (error) {
    console.error('获取商品规格详情时出错:', error);
    return NextResponse.json(
      { error: '内部服务器错误' },
      { status: 500 }
    );
  }
}
