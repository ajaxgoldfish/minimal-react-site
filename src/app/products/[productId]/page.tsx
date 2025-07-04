'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PurchaseModal } from '@/components/PurchaseModal';
import { Button } from '@/components/ui/button';


interface Product {
  id: number;
  name: string;
  description: string;
  image: string | null; // JSON格式: {"main":"base64...", "details":["base64..."]}
  category: string;
  price: number;
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const getProductId = async () => {
      const resolvedParams = await params;
      setProductId(resolvedParams.productId);
    };
    getProductId();
  }, [params]);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setProduct(result.product);
          } else {
            setProduct(null);
          }
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 商品图片 */}
          <div className="aspect-[3/4] relative">
            {(() => {
              if (product.image) {
                try {
                  const imageData = JSON.parse(product.image);
                  if (imageData.main) {
                    return (
                      <Image
                        src={imageData.main}
                        alt={product.name}
                        fill
                        className="object-cover rounded-lg"
                        unoptimized={true}
                      />
                    );
                  }
                } catch {
                  // 如果解析失败，可能是旧格式的URL
                  return (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  );
                }
              }
              return (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">无图片</span>
                </div>
              );
            })()}
          </div>

          {/* 商品信息 */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-blue-600">
                  ¥{product.price.toFixed(2)}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {product.category}
                </span>
              </div>

              {/* 购买按钮 */}
              <div className="space-y-4">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full"
                >
                  立即购买
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 商品详情图 */}
        {(() => {
          if (product.image) {
            try {
              const imageData = JSON.parse(product.image);
              if (imageData.details && imageData.details.length > 0) {
                return (
                  <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">商品详情</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {imageData.details.map((img: string, index: number) => (
                        <div key={index} className="aspect-[3/4] relative">
                          <Image
                            src={img}
                            alt={`${product.name} 详情图 ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                            unoptimized={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            } catch {
              // 解析失败，不显示详情图
            }
          }
          return null;
        })()}
      </div>

      {/* 购买弹窗 */}
      {isModalOpen && (
        <PurchaseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={{
            id: product.id.toString(),
            name: product.name,
            price: product.price,
            image: product.image,
          }}
        />
      )}
    </div>
  );
}