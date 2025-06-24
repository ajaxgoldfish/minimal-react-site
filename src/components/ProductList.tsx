"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Product } from "@/db/entity/Product";

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const categories = ["所有商品", ...new Set(products.map((p) => p.category))];

  // 分类筛选逻辑（暂存，后续可实现）
  const filteredProducts = products;

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center">商品展示</h1>
      
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
        {categories.map((category) => (
          <Button key={category} variant="ghost" className="text-gray-600">
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentProducts.map((product) => (
          <div key={product.id} className="border rounded-lg shadow-lg overflow-hidden flex flex-col">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <img src={product.image} alt={product.name} className="h-24 w-24 text-gray-500" />
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 line-clamp-2 min-h-[3rem]">
                {product.description}
              </p>
              <div className="flex justify-between mt-auto pt-4">
                <Link href={`/products/${product.id}`} passHref>
                  <Button variant="outline">详情</Button>
                </Link>
                <Button>购买</Button>
              </div>
            </div>
          </div>
        ))}
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
    </div>
  );
} 