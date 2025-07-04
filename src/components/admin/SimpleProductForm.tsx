'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
  isActive: number;
}

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (productData: Omit<Product, 'id'>) => Promise<void>;
  onCancel: () => void;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  isActive: boolean;
  mainImageFile: File | null;
  detailImageFiles: File[];
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  category?: string;
  mainImage?: string;
}

export default function SimpleProductForm({
  product,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const isEditing = !!product;
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // 将文件转换为base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    isActive: true,
    mainImageFile: null,
    detailImageFiles: [],
  });

  // 初始化表单数据
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        isActive: product.isActive === 1,
        mainImageFile: null,
        detailImageFiles: [],
      });
    }
  }, [product]);

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '商品名称不能为空';
    }

    if (!formData.description.trim()) {
      newErrors.description = '商品描述不能为空';
    }

    if (!formData.category.trim()) {
      newErrors.category = '商品分类不能为空';
    }

    if (!formData.price.trim()) {
      newErrors.price = '商品价格不能为空';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = '请输入有效的价格';
    }

    // 验证主图（编辑时如果已有图片则不强制要求上传新图片）
    if (!isEditing && !formData.mainImageFile) {
      newErrors.mainImage = '请上传商品主图';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // 处理图片数据
      let imageData: string | null = null;

      // 如果有上传的文件，转换为JSON格式
      if (formData.mainImageFile || formData.detailImageFiles.length > 0) {
        const imageJson: { main?: string; details: string[] } = { details: [] };

        // 处理主图
        if (formData.mainImageFile) {
          imageJson.main = await fileToBase64(formData.mainImageFile);
        }

        // 处理详情图
        if (formData.detailImageFiles.length > 0) {
          const detailPromises = formData.detailImageFiles.map(file => fileToBase64(file));
          imageJson.details = await Promise.all(detailPromises);
        }

        imageData = JSON.stringify(imageJson);
      } else if (isEditing && product?.image) {
        // 编辑时如果没有上传新图片，保留原有图片
        imageData = product.image;
      }

      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim(),
        image: imageData,
        isActive: formData.isActive ? 1 : 0,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 头部 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {isEditing ? '编辑商品' : '添加商品'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={submitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入商品名称"
                  disabled={submitting}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品分类 *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入商品分类"
                  disabled={submitting}
                />
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品价格 *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入商品价格"
                  disabled={submitting}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    disabled={submitting}
                  />
                  <span className="text-sm font-medium text-gray-700">允许购买</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  取消勾选将禁止用户购买此商品
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商品描述 *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入商品描述"
                rows={3}
                disabled={submitting}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* 主图上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商品主图
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData(prev => ({ ...prev, mainImageFile: file }));
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.mainImage ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={submitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                支持 JPG、PNG、GIF 格式，建议尺寸 3:4
              </p>
              {errors.mainImage && (
                <p className="text-red-500 text-sm mt-1">{errors.mainImage}</p>
              )}
              {formData.mainImageFile && (
                <p className="text-sm text-green-600 mt-1">
                  已选择: {formData.mainImageFile.name}
                </p>
              )}
            </div>

            {/* 详情图上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商品详情图
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setFormData(prev => ({ ...prev, detailImageFiles: files }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                可选择多张图片，支持 JPG、PNG、GIF 格式
              </p>
              {formData.detailImageFiles.length > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  已选择 {formData.detailImageFiles.length} 张图片
                </p>
              )}
            </div>



            {/* 提交按钮 */}
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
                {submitting ? '保存中...' : (isEditing ? '更新商品' : '创建商品')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
