import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { product } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
      where: eq(product.id, productId),
      with: {
        variants: {
          orderBy: (variants, { asc, desc }) => [desc(variants.isDefault), asc(variants.id)],
        },
      },
    });

    if (!dbProduct) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    // 转换数据格式，包含规格信息
    const defaultVariant = dbProduct.variants.find(v => v.isDefault === 1) || dbProduct.variants[0];

    const productWithVariants = {
      ...dbProduct,
      // 从默认规格获取价格和图片信息（向后兼容）
      price: defaultVariant?.price || 0,
      imageData: defaultVariant?.imageData || null,
      imageMimeType: defaultVariant?.imageMimeType || null,
      detailImages: defaultVariant?.detailImages ?
        (() => {
          try {
            return JSON.parse(defaultVariant.detailImages);
          } catch (e) {
            console.error('Failed to parse detail images for variant', defaultVariant.id, e);
            return null;
          }
        })() : null,
      variants: dbProduct.variants.map(variant => ({
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
    };

    return NextResponse.json(productWithVariants);
  } catch (error) {
    console.error('获取商品详情时出错:', error);
    return NextResponse.json(
      { error: '内部服务器错误' },
      { status: 500 }
    );
  }
} 