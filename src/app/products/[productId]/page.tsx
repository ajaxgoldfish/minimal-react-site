'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PurchaseModal } from '@/components/PurchaseModal';

interface DetailImage {
  imageData: string;
  imageMimeType: string;
}

interface ProductVariant {
  id: number;
  productId: number;
  name: string;
  price: number;
  imageData: string | null;
  imageMimeType: string | null;
  detailImages: DetailImage[] | null;
  isDefault: number;
}

interface Product {
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

export default function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState<string>('');

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
          const productData = await response.json();
          // 解析详情图JSON数据
          if (productData.detailImages && typeof productData.detailImages === 'string') {
            try {
              productData.detailImages = JSON.parse(productData.detailImages);
            } catch (e) {
              console.error('Failed to parse detail images:', e);
              productData.detailImages = null;
            }
          }
          setProduct(productData);

          // 设置默认选中的规格
          if (productData.variants && productData.variants.length > 0) {
            const defaultVariant = productData.variants.find((v: ProductVariant) => v.isDefault === 1) || productData.variants[0];
            setSelectedVariant(defaultVariant);
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
            {selectedVariant?.imageData ? (
              <Image
                src={`data:${selectedVariant.imageMimeType};base64,${selectedVariant.imageData}`}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
                unoptimized={true}
              />
            ) : product.imageData ? (
              <Image
                src={`data:${product.imageMimeType};base64,${product.imageData}`}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
                unoptimized={true}
              />
            ) : product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">无图片</span>
              </div>
            )}
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
                  ¥{selectedVariant?.price.toFixed(2) || product.price.toFixed(2)}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {product.category}
                </span>
              </div>

              {/* 规格选择 */}
              {product.variants && product.variants.length > 1 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">选择规格</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-3 border rounded-lg text-sm transition-colors ${
                          selectedVariant?.id === variant.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-medium">{variant.name}</div>
                        <div className="text-xs text-gray-500">¥{variant.price.toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 购买按钮 */}
            <div className="space-y-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!selectedVariant}
              >
                {!selectedVariant ? '请选择规格' : '立即购买'}
              </button>
            </div>
          </div>
        </div>

        {/* 商品详情图 */}
        {((selectedVariant?.detailImages && selectedVariant.detailImages.length > 0) ||
          (product.detailImages && product.detailImages.length > 0)) && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">商品详情</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(selectedVariant?.detailImages || product.detailImages || []).map((img, index) => (
                <div key={index} className="aspect-[3/4] relative">
                  <Image
                    src={`data:${img.imageMimeType};base64,${img.imageData}`}
                    alt={`${product.name} 详情图 ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    unoptimized={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <PurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedVariant ? {
          id: product.id.toString(),
          name: product.name,
          price: selectedVariant.price,
          image: product.image,
          imageData: selectedVariant.imageData,
          imageMimeType: selectedVariant.imageMimeType,
          variantId: selectedVariant.id,
          variantName: selectedVariant.name,
        } : {
          id: product.id.toString(),
          name: product.name,
          price: product.price,
          image: product.image,
        }}
      />
    </div>
  );
} 