"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const products = [
  {
    id: 1,
    name: "高性能笔记本电脑",
    description: "搭载最新一代处理器，适用于专业工作和游戏。",
    image: "/file.svg", // 暂时使用占位图
    category: "电子产品",
  },
  {
    id: 2,
    name: "无线降噪耳机",
    description: "沉浸式音效体验，长达30小时电池续航。",
    image: "/globe.svg", // 暂时使用占位图
    category: "电子产品",
  },
  {
    id: 3,
    name: "智能运动手表",
    description: "全天候健康监测，多种运动模式可选。",
    image: "/window.svg", // 暂时使用占位图
    category: "穿戴设备",
  },
  {
    id: 4,
    name: "4K超高清显示器",
    description: "色彩精准，细节丰富，为创作者和设计师打造。",
    image: "/file.svg", // 暂时使用占位图
    category: "电子产品",
  },
  {
    id: 5,
    name: "人体工学办公椅",
    description: "舒适支撑，缓解久坐疲劳，提升工作效率。",
    image: "/globe.svg",
    category: "家居办公",
  },
  {
    id: 6,
    name: "便携咖啡机",
    description: "随时随地享用香醇咖啡，简单易用。",
    image: "/window.svg",
    category: "生活电器",
  },
  {
    id: 7,
    name: "多功能登山包",
    description: "轻便耐磨，大容量设计，满足户外探险需求。",
    image: "/file.svg",
    category: "户外运动",
  },
];

const categories = ["所有商品", "电子产品", "穿戴设备", "家居办公", "生活电器", "户外运动"];

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // 每页显示4个商品
  
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
                <Button variant="outline">详情</Button>
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