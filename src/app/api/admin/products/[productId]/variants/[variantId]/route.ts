import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { productVariant } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// 更新规格 (PUT)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ productId: string; variantId: string }> }
) {
  try {
    // 验证管理员权限
    await requireAdmin();

    const params = await context.params;
    const productId = parseInt(params.productId);
    const variantId = parseInt(params.variantId);
    
    if (isNaN(productId) || isNaN(variantId)) {
      return NextResponse.json({ error: '无效的ID' }, { status: 400 });
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

    // 检查规格是否存在
    const existingVariant = await db.query.productVariant.findFirst({
      where: and(
        eq(productVariant.id, variantId),
        eq(productVariant.productId, productId)
      ),
    });

    if (!existingVariant) {
      return NextResponse.json({ error: '规格不存在' }, { status: 404 });
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

    // 更新规格
    const [updatedVariant] = await db
      .update(productVariant)
      .set({
        name: name.trim(),
        price: numPrice,
        imageData: imageData || null,
        imageMimeType: imageMimeType || null,
        detailImages: detailImagesJson,
        isDefault: isDefault ? 1 : 0,
      })
      .where(eq(productVariant.id, variantId))
      .returning();

    return NextResponse.json({
      success: true,
      message: '规格更新成功',
      variant: updatedVariant,
    });
  } catch (error) {
    console.error('更新规格时出错:', error);
    
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

// 删除规格 (DELETE)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ productId: string; variantId: string }> }
) {
  try {
    // 验证管理员权限
    await requireAdmin();

    const params = await context.params;
    const productId = parseInt(params.productId);
    const variantId = parseInt(params.variantId);
    
    if (isNaN(productId) || isNaN(variantId)) {
      return NextResponse.json({ error: '无效的ID' }, { status: 400 });
    }

    // 检查规格是否存在
    const existingVariant = await db.query.productVariant.findFirst({
      where: and(
        eq(productVariant.id, variantId),
        eq(productVariant.productId, productId)
      ),
    });

    if (!existingVariant) {
      return NextResponse.json({ error: '规格不存在' }, { status: 404 });
    }

    // 检查是否是最后一个规格
    const variantCount = await db.query.productVariant.findMany({
      where: eq(productVariant.productId, productId),
    });

    if (variantCount.length <= 1) {
      return NextResponse.json(
        { error: '不能删除最后一个规格' },
        { status: 400 }
      );
    }

    // 如果删除的是默认规格，设置第一个剩余规格为默认
    if (existingVariant.isDefault === 1) {
      const otherVariants = variantCount.filter(v => v.id !== variantId);
      if (otherVariants.length > 0) {
        await db
          .update(productVariant)
          .set({ isDefault: 1 })
          .where(eq(productVariant.id, otherVariants[0].id));
      }
    }

    // 删除规格
    await db
      .delete(productVariant)
      .where(eq(productVariant.id, variantId));

    return NextResponse.json({
      success: true,
      message: '规格删除成功',
    });
  } catch (error) {
    console.error('删除规格时出错:', error);
    
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
