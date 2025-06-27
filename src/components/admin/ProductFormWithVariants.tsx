'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface DetailImage {
  imageData: string;
  imageMimeType: string;
}

interface ProductVariant {
  id?: number;
  name: string;
  price: number;
  imageData: string | null;
  imageMimeType: string | null;
  detailImages: DetailImage[] | null;
  stock: number;
  isDefault: boolean;
  imageFile?: File | null;
  detailImageFiles?: File[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string | null;
  variants: ProductVariant[];
}

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (productData: any) => Promise<void>;
  onCancel: () => void;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  image: string;
  variants: ProductVariant[];
}

interface FormErrors {
  name?: string;
  description?: string;
  category?: string;
  variants?: string;
}

export default function ProductFormWithVariants({
  product,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const isEditing = !!product;
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    image: '',
    variants: [{
      name: '默认规格',
      price: 0,
      imageData: null,
      imageMimeType: null,
      detailImages: null,
      stock: 0,
      isDefault: true,
      imageFile: null,
      detailImageFiles: [],
    }],
  });

  // 初始化表单数据
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        image: product.image || '',
        variants: product.variants.map(variant => ({
          ...variant,
          isDefault: variant.isDefault === 1,
          imageFile: null,
          detailImageFiles: [],
        })),
      });
    }
  }, [product]);

  // 文件转base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // 移除 data:image/...;base64, 前缀
      };
      reader.onerror = error => reject(error);
    });
  };

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

    if (formData.variants.length === 0) {
      newErrors.variants = '至少需要一个商品规格';
    } else {
      const defaultVariants = formData.variants.filter(v => v.isDefault);
      if (defaultVariants.length === 0) {
        newErrors.variants = '必须设置一个默认规格';
      } else if (defaultVariants.length > 1) {
        newErrors.variants = '只能有一个默认规格';
      }

      for (const variant of formData.variants) {
        if (!variant.name.trim()) {
          newErrors.variants = '规格名称不能为空';
          break;
        }
        if (variant.price <= 0) {
          newErrors.variants = '规格价格必须大于0';
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 添加规格
  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        name: '',
        price: 0,
        imageData: null,
        imageMimeType: null,
        detailImages: null,
        stock: 0,
        isDefault: false,
        imageFile: null,
        detailImageFiles: [],
      }],
    }));
  };

  // 删除规格
  const removeVariant = (index: number) => {
    if (formData.variants.length <= 1) {
      alert('至少需要保留一个规格');
      return;
    }

    setFormData(prev => {
      const newVariants = prev.variants.filter((_, i) => i !== index);
      // 如果删除的是默认规格，设置第一个为默认
      if (prev.variants[index].isDefault && newVariants.length > 0) {
        newVariants[0].isDefault = true;
      }
      return {
        ...prev,
        variants: newVariants,
      };
    });
  };

  // 更新规格
  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => {
        if (i === index) {
          // 如果设置为默认规格，取消其他规格的默认状态
          if (field === 'isDefault' && value === true) {
            return { ...variant, [field]: value };
          }
          return { ...variant, [field]: value };
        } else if (field === 'isDefault' && value === true) {
          // 取消其他规格的默认状态
          return { ...variant, isDefault: false };
        }
        return variant;
      }),
    }));
  };

  // 处理规格图片上传
  const handleVariantImageUpload = (index: number, file: File) => {
    updateVariant(index, 'imageFile', file);
  };

  // 处理规格详情图上传
  const handleVariantDetailImagesUpload = (index: number, files: FileList) => {
    const fileArray = Array.from(files);
    updateVariant(index, 'detailImageFiles', fileArray);
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // 处理规格数据
      const processedVariants = await Promise.all(
        formData.variants.map(async (variant) => {
          let imageData = variant.imageData;
          let imageMimeType = variant.imageMimeType;
          let detailImages = variant.detailImages;

          // 处理主图
          if (variant.imageFile) {
            imageData = await fileToBase64(variant.imageFile);
            imageMimeType = variant.imageFile.type;
          }

          // 处理详情图
          if (variant.detailImageFiles && variant.detailImageFiles.length > 0) {
            const newDetailImages = await Promise.all(
              variant.detailImageFiles.map(async (file) => ({
                imageData: await fileToBase64(file),
                imageMimeType: file.type,
              }))
            );
            detailImages = newDetailImages;
          }

          return {
            name: variant.name.trim(),
            price: variant.price,
            imageData,
            imageMimeType,
            detailImages,
            stock: variant.stock,
            isDefault: variant.isDefault,
          };
        })
      );

      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        image: formData.image.trim() || null,
        variants: processedVariants,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
            {/* 基本信息 */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">基本信息</h3>
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
              </div>

              <div className="mt-4">
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

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品主图URL（可选）
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入图片URL"
                  disabled={submitting}
                />
              </div>
            </Card>

            {/* 商品规格 */}
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">商品规格</h3>
                <Button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-2"
                  disabled={submitting}
                >
                  <Plus className="h-4 w-4" />
                  添加规格
                </Button>
              </div>

              {errors.variants && (
                <p className="text-red-500 text-sm mb-4">{errors.variants}</p>
              )}

              <div className="space-y-4">
                {formData.variants.map((variant, index) => (
                  <Card key={index} className="p-4 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">规格 {index + 1}</h4>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={variant.isDefault}
                            onChange={(e) => updateVariant(index, 'isDefault', e.target.checked)}
                            disabled={submitting}
                          />
                          默认规格
                        </label>
                        {formData.variants.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeVariant(index)}
                            disabled={submitting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          规格名称 *
                        </label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => updateVariant(index, 'name', e.target.value)}
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
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                          disabled={submitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          库存
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          规格图片
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleVariantImageUpload(index, file);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={submitting}
                        />
                        {(variant.imageData || variant.imageFile) && (
                          <div className="mt-2">
                            <div className="relative aspect-[3/4] w-20">
                              <Image
                                src={variant.imageFile
                                  ? URL.createObjectURL(variant.imageFile)
                                  : `data:${variant.imageMimeType};base64,${variant.imageData}`
                                }
                                alt="规格图片预览"
                                fill
                                className="object-cover rounded-md"
                                unoptimized={true}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          详情图片
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            if (e.target.files) {
                              handleVariantDetailImagesUpload(index, e.target.files);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={submitting}
                        />
                        {((variant.detailImages && variant.detailImages.length > 0) ||
                          (variant.detailImageFiles && variant.detailImageFiles.length > 0)) && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {variant.detailImageFiles && variant.detailImageFiles.length > 0 ? (
                              variant.detailImageFiles.map((file, imgIndex) => (
                                <div key={imgIndex} className="relative aspect-[3/4] w-16">
                                  <Image
                                    src={URL.createObjectURL(file)}
                                    alt={`详情图 ${imgIndex + 1}`}
                                    fill
                                    className="object-cover rounded-md"
                                    unoptimized={true}
                                  />
                                </div>
                              ))
                            ) : (
                              variant.detailImages?.map((img, imgIndex) => (
                                <div key={imgIndex} className="relative aspect-[3/4] w-16">
                                  <Image
                                    src={`data:${img.imageMimeType};base64,${img.imageData}`}
                                    alt={`详情图 ${imgIndex + 1}`}
                                    fill
                                    className="object-cover rounded-md"
                                    unoptimized={true}
                                  />
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

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
