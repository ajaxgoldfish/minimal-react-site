"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { PurchaseModal } from "@/components/PurchaseModal";
import type { ProductInfo } from "@/hooks/usePurchaseFlow";

// 详情图类型定义
export interface DetailImage {
  imageData: string;
  imageMimeType: string;
}

// 商品规格类型定义
export interface ProductVariant {
  id: number;
  productId: number;
  name: string;
  price: number;
  imageData: string | null;
  imageMimeType: string | null;
  detailImages: DetailImage[] | null;
  isDefault: number;
}

// 为客户端组件定义一个纯粹的、与数据库实现无关的类型
export interface ProductType {
  id: number;
  name: string;
  description: string;
  image: string | null;
  imageData: string | null;
  imageMimeType: string | null;
  detailImages: DetailImage[] | null;
  category: string;
  price: number;
  variants: ProductVariant[];
}

interface ProductListProps {
  products: ProductType[];
  selectedCategory: string;
}

export default function ProductList({
  products,
  selectedCategory,
}: ProductListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<{[productId: number]: ProductVariant}>({});
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // 初始化每个商品的默认规格选择
  useEffect(() => {
    const initialVariants: {[productId: number]: ProductVariant} = {};
    products.forEach(product => {
      if (product.variants && product.variants.length > 0) {
        const defaultVariant = product.variants.find(v => v.isDefault === 1) || product.variants[0];
        initialVariants[product.id] = defaultVariant;
      }
    });
    setSelectedVariants(initialVariants);
  }, [products]);

  const categories = ["所有商品", "一类", "二类", "三类", "四类", "五类"];

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handlePurchaseClick = (product: ProductType) => {
    const selectedVariant = selectedVariants[product.id];
    if (!selectedVariant) {
      alert('请先选择商品规格');
      return;
    }

    // 转换为Modal所需的格式
    const productInfo: ProductInfo = {
      id: product.id.toString(),
      name: product.name,
      price: selectedVariant.price,
      image: product.image,
      imageData: selectedVariant.imageData,
      imageMimeType: selectedVariant.imageMimeType,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
    };
    setSelectedProduct(productInfo);
    setIsModalOpen(true);
  };

  const handleVariantChange = (productId: number, variant: ProductVariant) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variant,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center">商品展示</h1>

      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
        {categories.map((category) => (
          <Link
            key={category}
            href={
              category === "所有商品"
                ? "/products"
                : `/products?category=${category}`
            }
            passHref
          >
            <Button
              variant={selectedCategory === category ? "default" : "ghost"}
            >
              {category}
            </Button>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentProducts.map((product) => {
          const selectedVariant = selectedVariants[product.id];
          const displayImage = selectedVariant?.imageData || product.imageData;
          const displayImageType = selectedVariant?.imageMimeType || product.imageMimeType;

          return (
            <div key={product.id} className="border rounded-lg shadow-lg overflow-hidden flex flex-col">
              <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center relative">
                {displayImage ? (
                  <Image
                    src={`data:${displayImageType};base64,${displayImage}`}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized={true}
                  />
                ) : product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-300 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-sm">无图片</span>
                  </div>
                )}
              </div>
            <div className="p-4 flex flex-col flex-grow">
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 line-clamp-2 min-h-[3rem]">
                {product.description}
              </p>
              <div className="mt-auto pt-4">
                {/* 规格选择 */}
                {product.variants && product.variants.length > 1 && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      规格选择:
                    </label>
                    <select
                      value={selectedVariant?.id || ''}
                      onChange={(e) => {
                        const variantId = parseInt(e.target.value);
                        const variant = product.variants.find(v => v.id === variantId);
                        if (variant) {
                          handleVariantChange(product.id, variant);
                        }
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {product.variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-bold text-blue-600">
                    ¥{selectedVariant?.price.toFixed(2) || product.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/products/${product.id}`} passHref className="flex-1">
                    <Button variant="outline" className="w-full">详情</Button>
                  </Link>
                  <Button
                    onClick={() => handlePurchaseClick(product)}
                    className="flex-1"
                  >
                    购买
                  </Button>
                </div>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      <div className="flex justify-center items-center gap-4 mt-8">
        <Button onClick={handlePrevPage} disabled={currentPage === 1} variant="outline">
          上一页
        </Button>
        <span>第 {currentPage} / {totalPages} 页</span>
        <Button onClick={handleNextPage} disabled={currentPage === totalPages} variant="outline">
          下一页
        </Button>
      </div>

      {/* 购买Modal */}
      <PurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
} 