"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PurchaseModal } from '@/components/PurchaseModal';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star } from 'lucide-react';
import type { ProductInfo } from '@/hooks/usePurchaseFlow';

// 临时的产品数据，实际项目中应该从服务器获取
const sampleProducts: Record<string, ProductInfo & { description: string; features: string[] }> = {
  '1': {
    id: '1',
    name: '高品质蓝牙耳机',
    price: 999.99,
    description: '采用最新降噪技术，为您带来卓越的音质体验。无论是音乐欣赏还是通话，都能享受清晰纯净的声音。',
    features: ['主动降噪技术', '30小时续航', '快速充电', 'Hi-Fi音质', '舒适佩戴']
  },
  '2': {
    id: '2',
    name: '智能运动手表',
    price: 249.99,
    description: '全方位健康监测，智能运动伴侣。支持多种运动模式，帮助您科学健身，追踪健康数据。',
    features: ['心率监测', '睡眠分析', '50米防水', 'GPS定位', '多种运动模式']
  },
  '3': {
    id: '3',
    name: '便携充电宝',
    price: 199.99,
    description: '大容量设计，支持快充协议。出行必备，为您的设备提供可靠的电力保障。',
    features: ['20000mAh大容量', '支持PD快充', '多设备同充', 'LED电量显示', '安全保护']
  },
  '4': {
    id: '4',
    name: '无线充电器',
    price: 499.99,
    description: '高效无线充电解决方案，告别线缆束缚。支持多种设备，充电更便捷。',
    features: ['15W快速充电', '智能识别设备', '散热设计', '防滑底座', '指示灯提醒']
  }
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [product, setProduct] = useState<(ProductInfo & { description: string; features: string[] }) | null>(null);

  useEffect(() => {
    // 在实际项目中，这里应该是API调用
    const foundProduct = sampleProducts[productId];
    setProduct(foundProduct || null);
  }, [productId]);

  if (!product) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold text-gray-600">商品未找到</h1>
        <p className="mt-4 text-gray-500">您访问的商品不存在或已下架</p>
      </div>
    );
  }

  const handlePurchaseClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* 商品图片区域 */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <ShoppingCart className="h-16 w-16 mx-auto mb-2" />
              <p>商品图片</p>
            </div>
          </div>
          
          {/* 缩略图 */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-20 bg-gray-100 rounded border-2 border-transparent hover:border-blue-500 cursor-pointer flex items-center justify-center">
                <span className="text-xs text-gray-400">图{i}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 商品信息区域 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            {/* 评分 */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-gray-600">(4.8分 · 1,234条评价)</span>
            </div>

            {/* 价格 */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-blue-600">¥{product.price.toFixed(2)}</span>
              <span className="text-lg text-gray-500 line-through ml-3">¥{(product.price * 1.2).toFixed(2)}</span>
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm ml-3">限时优惠</span>
            </div>
          </div>

          {/* 商品描述 */}
          <div>
            <h3 className="text-lg font-semibold mb-2">商品介绍</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* 产品特性 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">产品特性</h3>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 购买按钮 */}
          <div className="pt-4 border-t">
            <Button 
              onClick={handlePurchaseClick}
              size="lg" 
              className="w-full md:w-auto px-8 py-3 text-lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              立即购买
            </Button>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>• 支持7天无理由退换货</p>
              <p>• 全国包邮，顺丰快递</p>
              <p>• 正品保证，假一赔十</p>
            </div>
          </div>
        </div>
      </div>

      {/* 购买Modal */}
      <PurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
      />
    </div>
  );
} 