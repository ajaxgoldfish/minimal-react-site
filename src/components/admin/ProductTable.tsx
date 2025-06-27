'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2, Plus, Settings } from 'lucide-react';
import Image from 'next/image';
import VariantManager from './VariantManager';

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

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string | null;
  variants: ProductVariant[];
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
  onAdd: () => void;
  loading?: boolean;
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  onAdd,
  loading = false,
}: ProductTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showVariantManager, setShowVariantManager] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleDelete = async (productId: number) => {
    if (deletingId) return; // 防止重复点击
    
    if (window.confirm('确定要删除这个商品吗？此操作不可撤销。')) {
      setDeletingId(productId);
      try {
        await onDelete(productId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  const handleManageVariants = (product: Product) => {
    setSelectedProduct(product);
    setShowVariantManager(true);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">加载中...</div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 头部操作栏 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">商品管理</h2>
        <Button onClick={onAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          添加商品
        </Button>
      </div>

      {/* 商品表格 */}
      <Card className="overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>暂无商品数据</p>
            <Button onClick={onAdd} variant="outline" className="mt-4">
              添加第一个商品
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品图片
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    描述
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分类
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    价格范围
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    规格数量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative aspect-[3/4] w-12">
                        {product.imageData ? (
                          <Image
                            src={`data:${product.imageMimeType};base64,${product.imageData}`}
                            alt={product.name}
                            fill
                            className="object-cover rounded-md"
                            unoptimized={true}
                            sizes="48px"
                          />
                        ) : product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover rounded-md"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-xs text-gray-500">无图片</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {product.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.variants && product.variants.length > 0 ? (
                        <div>
                          <div className="font-medium">
                            ¥{Math.min(...product.variants.map(v => v.price)).toFixed(2)} -
                            ¥{Math.max(...product.variants.map(v => v.price)).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            默认: ¥{product.variants.find(v => v.isDefault === 1)?.price.toFixed(2) || product.variants[0]?.price.toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">无规格</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="font-medium">{product.variants?.length || 0}</span>
                        <span className="ml-1 text-xs text-gray-500">个规格</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(product)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          编辑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageVariants(product)}
                          className="flex items-center gap-1"
                        >
                          <Settings className="h-3 w-3" />
                          规格
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          {deletingId === product.id ? '删除中...' : '删除'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 规格管理器 */}
      {showVariantManager && selectedProduct && (
        <VariantManager
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          onClose={() => {
            setShowVariantManager(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
