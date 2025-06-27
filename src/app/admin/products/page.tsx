'use client';

import { useState, useEffect, useCallback } from 'react';
import ProductTable from '@/components/admin/ProductTable';
import SimpleProductForm from '@/components/admin/SimpleProductForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // 加载商品列表
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchWithRetry('/api/admin/products');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取商品列表失败');
      }

      // 解析详情图JSON数据
      const productsWithParsedImages = data.products.map((product: Product & { detailImages: string | null }) => ({
        ...product,
        detailImages: product.detailImages ?
          (() => {
            try {
              return JSON.parse(product.detailImages) as DetailImage[];
            } catch (e) {
              console.error('Failed to parse detail images for product', product.id, e);
              return null;
            }
          })() : null
      }));
      setProducts(productsWithParsedImages);
    } catch (error) {
      console.error('加载商品列表失败:', error);
      setError(error instanceof Error ? error.message : '加载商品列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 检查权限
  const checkPermission = useCallback(async () => {
    try {
      const response = await fetch('/api/user/me');
      if (!response.ok) {
        setHasPermission(false);
        return;
      }

      const user = await response.json();
      if (user.role !== 'admin') {
        setHasPermission(false);
        return;
      }

      setHasPermission(true);
      loadProducts();
    } catch (error) {
      console.error('权限检查失败:', error);
      setHasPermission(false);
    }
  }, [loadProducts]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // 显示通知的函数
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    // 3秒后自动隐藏通知
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // 带重试的 fetch 函数
  const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 1): Promise<Response> => {
    const fetchOptions = {
      ...options,
      credentials: 'include' as RequestCredentials,
    };

    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(url, fetchOptions);

        // 如果是认证错误且还有重试次数，等待一下再重试
        if (response.status === 401 && i < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        return response;
      } catch (error) {
        if (i === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw new Error('请求失败');
  };





  // 添加商品
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const response = await fetchWithRetry('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '创建商品失败');
      }
      
      // 重新加载商品列表
      await loadProducts();
      setShowForm(false);

      // 显示成功消息
      showNotification('success', '商品创建成功！');
    } catch (error) {
      console.error('创建商品失败:', error);
      showNotification('error', error instanceof Error ? error.message : '创建商品失败');
    }
  };

  // 编辑商品
  const handleEditProduct = async (productData: Omit<Product, 'id'>) => {
    if (!editingProduct) return;
    
    try {
      const response = await fetchWithRetry(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '更新商品失败');
      }
      
      // 重新加载商品列表
      await loadProducts();
      setEditingProduct(null);
      setShowForm(false);

      // 显示成功消息
      showNotification('success', '商品更新成功！');
    } catch (error) {
      console.error('更新商品失败:', error);
      showNotification('error', error instanceof Error ? error.message : '更新商品失败');
    }
  };

  // 删除商品
  const handleDeleteProduct = async (productId: number) => {
    try {
      const response = await fetchWithRetry(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '删除商品失败');
      }
      
      // 重新加载商品列表
      await loadProducts();

      // 显示成功消息
      showNotification('success', '商品删除成功！');
    } catch (error) {
      console.error('删除商品失败:', error);
      showNotification('error', error instanceof Error ? error.message : '删除商品失败');
    }
  };

  // 打开添加表单
  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  // 打开编辑表单
  const handleOpenEditForm = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  // 关闭表单
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // 权限检查中
  if (hasPermission === null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">检查权限中...</div>
        </div>
      </div>
    );
  }

  // 无权限访问
  if (hasPermission === false) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">无权限访问</h1>
          <p className="text-gray-600 mb-6">抱歉，您没有访问商品管理页面的权限。</p>
          <div className="space-x-4">
            <Link href="/admin">
              <Button variant="outline">返回管理后台</Button>
            </Link>
            <Link href="/">
              <Button>返回首页</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">加载失败</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={loadProducts}>重试</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 通知组件 */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg transition-all duration-300 ${
          notification.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 面包屑导航 */}
      <div className="mb-6">
        <nav className="text-sm text-gray-500">
          <Link href="/admin" className="hover:text-gray-700">管理后台</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">商品管理</span>
        </nav>
      </div>

      {/* 商品表格 */}
      <ProductTable
        products={products}
        onEdit={handleOpenEditForm}
        onDelete={handleDeleteProduct}
        onAdd={handleOpenAddForm}
        loading={loading}
      />

      {/* 商品表单弹窗 */}
      {showForm && (
        <SimpleProductForm
          product={editingProduct}
          onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
}
