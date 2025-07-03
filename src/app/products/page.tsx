import ProductList from '@/components/ProductList';
import { db } from '@/db';
import { product } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const revalidate = 60; // 每60秒重新验证一次数据

async function getProducts(category?: string) {
  let products;
  if (category && category !== '所有商品') {
    products = await db.query.product.findMany({
      where: eq(product.category, category),
      with: {
        variants: {
          orderBy: (variants, { asc, desc }) => [desc(variants.isDefault), asc(variants.id)],
        },
      },
    });
  } else {
    products = await db.query.product.findMany({
      with: {
        variants: {
          orderBy: (variants, { asc, desc }) => [desc(variants.isDefault), asc(variants.id)],
        },
      },
    });
  }

  // 转换数据格式，包含默认规格信息
  return products.map(product => {
    const defaultVariant = product.variants.find(v => v.isDefault === 1) || product.variants[0];

    return {
      ...product,
      // 从默认规格获取价格和图片信息
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
    };
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const category =
    typeof resolvedSearchParams?.category === 'string'
      ? resolvedSearchParams.category
      : '所有商品';
  const products = await getProducts(category);

  return <ProductList products={products} selectedCategory={category} />;
} 