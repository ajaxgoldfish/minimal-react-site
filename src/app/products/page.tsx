import ProductList from '@/components/ProductList';
import { db } from '@/db';
import { product } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const revalidate = 60; // 每60秒重新验证一次数据

async function getProducts(category?: string) {
  if (category && category !== '所有商品') {
    return await db.query.product.findMany({
      where: eq(product.category, category),
    });
  }
  return await db.query.product.findMany();
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