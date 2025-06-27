'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import Image from 'next/image';

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string | null;
  imageData: string | null;
  imageMimeType: string | null;
}

interface ProductFormProps {
  product?: Product | null; // null 表示新增，有值表示编辑
  onSubmit: (productData: Omit<Product, 'id'>) => Promise<void>;
  onCancel: () => void;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  price: string;
  imageFile: File | null;
}

interface FormErrors {
  name?: string;
  description?: string;
  category?: string;
  price?: string;
  imageFile?: string;
}

export default function ProductForm({
  product,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    price: '',
    imageFile: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isEditing = !!product;

  // 初始化表单数据
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price.toString(),
        imageFile: null,
      });

      // 设置预览图片
      if (product.imageData && product.imageMimeType) {
        setPreviewUrl(`data:${product.imageMimeType};base64,${product.imageData}`);
      } else if (product.image) {
        setPreviewUrl(product.image);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        imageFile: null,
      });
      setPreviewUrl(null);
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

    // 对于新增商品，必须上传图片
    // 对于编辑商品，如果没有上传新图片，则使用原有图片
    if (!isEditing && !formData.imageFile) {
      newErrors.imageFile = '请选择商品图片';
    } else if (formData.imageFile) {
      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(formData.imageFile.type)) {
        newErrors.imageFile = '请选择有效的图片文件（支持 JPG, PNG, GIF, WebP 格式）';
      }

      // 验证文件大小（限制为5MB）
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (formData.imageFile.size > maxSize) {
        newErrors.imageFile = '图片文件大小不能超过5MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 将文件转换为base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // 移除 "data:image/jpeg;base64," 前缀，只保留base64数据
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      let imageData: string | null = null;
      let imageMimeType: string | null = null;
      let imageUrl: string | null = null;

      if (formData.imageFile) {
        // 如果上传了新图片，转换为base64
        imageData = await fileToBase64(formData.imageFile);
        imageMimeType = formData.imageFile.type;
        imageUrl = null; // 清除URL，使用二进制数据
      } else if (isEditing && product) {
        // 如果是编辑且没有上传新图片，保持原有图片数据
        imageData = product.imageData;
        imageMimeType = product.imageMimeType;
        imageUrl = product.image;
      }

      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        price: parseFloat(formData.price),
        image: imageUrl,
        imageData,
        imageMimeType,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, imageFile: file }));

    // 清除错误
    if (errors.imageFile) {
      setErrors(prev => ({ ...prev, imageFile: undefined }));
    }

    // 生成预览URL
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
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
                商品图片 {!isEditing && '*'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.imageFile ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={submitting}
              />
              {errors.imageFile && (
                <p className="text-red-500 text-sm mt-1">{errors.imageFile}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                支持 JPG, PNG, GIF, WebP 格式，文件大小不超过5MB
              </p>

              {/* 图片预览 */}
              {previewUrl && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500 mb-2">图片预览：</p>
                  <div className="relative inline-block">
                    <Image
                      src={previewUrl}
                      alt="商品图片预览"
                      width={128}
                      height={128}
                      className="object-cover rounded border"
                      unoptimized={previewUrl.startsWith('data:')}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl(null);
                        setFormData(prev => ({ ...prev, imageFile: null }));
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      disabled={submitting}
                    >
                      ×
                    </button>
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
