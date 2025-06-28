'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Plus, Edit, Trash2, Star } from 'lucide-react';
import Image from 'next/image';

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

interface VariantManagerProps {
  productId: number;
  productName: string;
  onClose: () => void;
}

export default function VariantManager({
  productId,
  productName,
  onClose,
}: VariantManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

  // 加载规格列表
  const loadVariants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${productId}/variants`);
      const data = await response.json();
      
      if (data.success) {
        setVariants(data.variants);
      } else {
        alert(data.error || '加载规格失败');
      }
    } catch (error) {
      console.error('加载规格失败:', error);
      alert('加载规格失败');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadVariants();
  }, [productId, loadVariants]);

  // 删除规格
  const handleDelete = async (variantId: number) => {
    if (!confirm('确定要删除这个规格吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}/variants/${variantId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('规格删除成功');
        loadVariants();
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除规格失败:', error);
      alert('删除规格失败');
    }
  };

  // 设置默认规格
  const handleSetDefault = async (variantId: number) => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}/variants/${variantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...variant,
          isDefault: true,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadVariants();
      } else {
        alert(data.error || '设置默认规格失败');
      }
    } catch (error) {
      console.error('设置默认规格失败:', error);
      alert('设置默认规格失败');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingVariant(null);
    loadVariants();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-4xl p-6">
          <div className="text-center">加载中...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 头部 */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">规格管理</h2>
              <p className="text-gray-600">商品: {productName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setEditingVariant(null);
                  setShowForm(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                添加规格
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 规格列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {variants.map((variant) => (
              <Card key={variant.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{variant.name}</h3>
                    {variant.isDefault === 1 && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingVariant(variant);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(variant.id)}
                      disabled={variants.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 规格图片 */}
                {variant.imageData && (
                  <div className="mb-3">
                    <div className="relative aspect-[3/4] w-full max-w-[120px]">
                      <Image
                        src={`data:${variant.imageMimeType};base64,${variant.imageData}`}
                        alt={variant.name}
                        fill
                        className="object-cover rounded-md"
                        unoptimized={true}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-lg font-bold text-blue-600">
                    ¥{variant.price.toFixed(2)}
                  </div>
                  
                  {variant.detailImages && variant.detailImages.length > 0 && (
                    <div className="text-sm text-gray-500">
                      详情图: {variant.detailImages.length} 张
                    </div>
                  )}

                  {variant.isDefault !== 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(variant.id)}
                      className="w-full"
                    >
                      设为默认
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {variants.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无规格，请添加规格
            </div>
          )}
        </div>
      </Card>

      {/* 规格表单 */}
      {showForm && (
        <VariantForm
          productId={productId}
          variant={editingVariant}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingVariant(null);
          }}
        />
      )}
    </div>
  );
}

// 规格表单组件
interface VariantFormProps {
  productId: number;
  variant?: ProductVariant | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function VariantForm({ productId, variant, onSuccess, onCancel }: VariantFormProps) {
  const isEditing = !!variant;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: variant?.name || '',
    price: variant?.price || 0,
    isDefault: variant?.isDefault === 1,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [detailImageFiles, setDetailImageFiles] = useState<File[]>([]);

  // 文件转base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || formData.price <= 0) {
      alert('请填写规格名称和有效价格');
      return;
    }

    setSubmitting(true);

    try {
      let imageData = variant?.imageData;
      let imageMimeType = variant?.imageMimeType;
      let detailImages = variant?.detailImages;

      // 处理主图
      if (imageFile) {
        imageData = await fileToBase64(imageFile);
        imageMimeType = imageFile.type;
      }

      // 处理详情图
      if (detailImageFiles.length > 0) {
        detailImages = await Promise.all(
          detailImageFiles.map(async (file) => ({
            imageData: await fileToBase64(file),
            imageMimeType: file.type,
          }))
        );
      }

      const url = isEditing 
        ? `/api/admin/products/${productId}/variants/${variant.id}`
        : `/api/admin/products/${productId}/variants`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          price: formData.price,
          imageData,
          imageMimeType,
          detailImages,
          isDefault: formData.isDefault,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(isEditing ? '规格更新成功' : '规格创建成功');
        onSuccess();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">
              {isEditing ? '编辑规格' : '添加规格'}
            </h3>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  规格名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="如：红色-L码"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  价格 *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  disabled={submitting}
                />
                <span className="text-sm font-medium text-gray-700">设为默认规格</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                规格图片
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                详情图片
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setDetailImageFiles(Array.from(e.target.files || []))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? '保存中...' : (isEditing ? '更新' : '创建')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
