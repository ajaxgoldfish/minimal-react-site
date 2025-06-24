import "reflect-metadata";
import { AppDataSource } from "@/db/data-source";
import { Product } from "@/db/entity/Product";
import ProductList from "@/components/ProductList";

export const revalidate = 60; // 每60秒重新验证一次数据

async function getProducts() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const productRepository = AppDataSource.getRepository(Product);
  return productRepository.find();
}

export default async function ProductsPage() {
  const products = await getProducts();
  const plainProducts = JSON.parse(JSON.stringify(products));
  
  return (
    <ProductList products={plainProducts} />
  );
} 