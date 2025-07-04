'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2, Plus } from 'lucide-react';
import Image from 'next/image';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
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

  const handleDelete = async (productId: number) => {
    if (deletingId) return; // 防止重复点击
    
    if (window.confirm('确定要删除这个商品吗？此操作不可撤销。')) {
      setDeletingId(productId);
      try {
        onDelete(productId);
      } finally {
        setDeletingId(null);
      }
    }
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
                    价格
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
                                    className="object-cover rounded-md"
                                    unoptimized={true}
                                    sizes="48px"
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
                                  className="object-cover rounded-md"
                                  sizes="48px"
                                />
                              );
                            }
                          }
                          return (
                            <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                              <span className="text-xs text-gray-500">无图片</span>
                            </div>
                          );
                        })()}
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
                      <span className="font-medium">¥{product.price.toFixed(2)}</span>
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
    </div>
  );
}
