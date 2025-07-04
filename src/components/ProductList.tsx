"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export interface ProductType {
  id: number;
  name: string;
  description: string;
  image: string | null;
  category: string;
  price: number;
  isActive: number;
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
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center">商品展示</h1>

      {/* 提示卡片 */}
      <div className="flex justify-center mb-8">
        <Card className="max-w-2xl mx-auto p-6 bg-blue-50 border-blue-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              <span className="text-yellow-500 mr-2">⚠️</span>
              温馨提示
            </h3>
            <p className="text-blue-800 leading-relaxed">
              下面的商品只是我们的部分商品、部分型号的代表。因为型号太多，所以强烈建议您联系客服进行沟通后我们上架，然后您再下单。
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <Link href="/contact">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  联系客服
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

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
          let displayImage = null;
          if (product.image) {
            try {
              const imageData = JSON.parse(product.image);
              displayImage = imageData.main;
            } catch {
              displayImage = product.image;
            }
          }

          return (
            <div key={product.id} className="border rounded-lg shadow-lg overflow-hidden flex flex-col">
              <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center relative">
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized={true}
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
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-blue-600">
                      ¥{product.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full">
                    <Link href={`/products/${product.id}`} passHref className="w-full">
                      <Button className="w-full">立即购买</Button>
                    </Link>
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
    </div>
  );
}
