// 这是一个基础的详情页面，后续我们会填充更多内容

import "reflect-metadata";
import { AppDataSource } from "@/db/data-source";
import { Product } from "@/db/entity/Product";

type ProductDetailPageProps = {
  params: {
    productId: string;
  };
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const productRepository = AppDataSource.getRepository(Product);
  const productId = parseInt(params.productId, 10);
  const product = await productRepository.findOneBy({ id: productId });

  if (!product) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold">商品未找到</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">这是 {product.name} 的详情界面</h1>
      <p className="mt-4 text-lg">{product.description}</p>
      <p className="mt-2 text-xl font-semibold">价格: ${product.price}</p>
      {/* 更多商品详情内容将在这里添加 */}
    </div>
  );
} 