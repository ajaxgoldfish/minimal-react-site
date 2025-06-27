'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
}

interface ProductFormProps {
  product?: Product | null; // null 表示新增，有值表示编辑
  onSubmit: (productData: Omit<Product, 'id'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  price: string;
  image: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  category?: string;
  price?: string;
  image?: string;
}

export default function ProductForm({
  product,
  onSubmit,
  onCancel,
  loading = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    price: '',
    image: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!product;

  // 初始化表单数据
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price.toString(),
        image: product.image,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        image: '',
      });
    }
    setErrors({});
  }, [product]);

  // 表单验证
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
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = '价格必须是大于0的数字';
      }
    }

    if (!formData.image.trim()) {
      newErrors.image = '商品图片URL不能为空';
    } else {
      const imageUrl = formData.image.trim();
      // 检查是否是完整的URL
      const isFullUrl = imageUrl.startsWith('http://') || imageUrl.startsWith('https://');
      // 检查是否是相对路径（以/开头）
      const isRelativePath = imageUrl.startsWith('/');
      // 检查文件扩展名
      const hasValidExtension = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(imageUrl);

      if (!isFullUrl && !isRelativePath) {
        newErrors.image = '请输入完整的图片URL（如 https://example.com/image.jpg）或相对路径（如 /images/product.jpg）';
      } else if (!hasValidExtension) {
        newErrors.image = '图片URL必须以图片格式结尾（支持 jpg, png, gif, webp, svg）';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        price: parseFloat(formData.price),
        image: formData.image.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 商品名称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商品名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
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

            {/* 商品描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商品描述 *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入商品描述"
                disabled={submitting}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* 商品分类 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商品分类 *
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
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

            {/* 商品价格 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商品价格 *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
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

            {/* 商品图片 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商品图片URL *
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.image ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入图片URL或路径，例如：https://example.com/image.jpg 或 /images/product.png"
                disabled={submitting}
              />
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image}</p>
              )}
              {formData.image && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">图片预览：</p>
                  <div className="relative">
                    <img
                      src={formData.image}
                      alt="商品图片预览"
                      className="w-20 h-20 object-cover rounded border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        // 显示错误提示
                        const errorDiv = target.nextElementSibling as HTMLElement;
                        if (errorDiv) {
                          errorDiv.style.display = 'flex';
                        }
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'block';
                        // 隐藏错误提示
                        const errorDiv = target.nextElementSibling as HTMLElement;
                        if (errorDiv) {
                          errorDiv.style.display = 'none';
                        }
                      }}
                    />
                    <div
                      className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500 text-center"
                      style={{ display: 'none' }}
                    >
                      图片加载失败
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 按钮组 */}
            <div className="flex justify-end space-x-3 pt-4">
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
