import "reflect-metadata";
import { AppDataSource } from "@/db/data-source";
import { Product } from "@/db/entity/Product";
import ProductList from "@/components/ProductList";

export const revalidate = 60; // 每60秒重新验证一次数据

async function getProducts(category?: string) {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const productRepository = AppDataSource.getRepository(Product);
  if (category && category !== "所有商品") {
    return productRepository.find({ where: { category } });
  }
  return productRepository.find();
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const category =
    typeof resolvedSearchParams?.category === "string"
      ? resolvedSearchParams.category
      : "所有商品";
  const products = await getProducts(category);
  const plainProducts = JSON.parse(JSON.stringify(products));

  return <ProductList products={plainProducts} selectedCategory={category} />;
} 