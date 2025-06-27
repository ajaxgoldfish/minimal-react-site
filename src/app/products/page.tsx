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
    });
  } else {
    products = await db.query.product.findMany();
  }

  // 解析详情图JSON数据
  return products.map(product => ({
    ...product,
    detailImages: product.detailImages ?
      (() => {
        try {
          return JSON.parse(product.detailImages);
        } catch (e) {
          console.error('Failed to parse detail images for product', product.id, e);
          return null;
        }
      })() : null
  }));
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