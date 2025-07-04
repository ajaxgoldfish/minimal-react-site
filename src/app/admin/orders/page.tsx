'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Loader2, Package, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';

// 订单状态类型定义
type OrderStatus = 'pending' | 'paid' | 'cancelled';

interface Order {
  id: number;
  status: OrderStatus;
  amount: number;
  currency: string;
  paypalOrderId: string | null;
  createdAt: Date;
  userId: number | null;
  productId: number | null;

  notes: string | null;
  user: {
    id: number;
    name: string | null;
    clerkId: string;
    email: string | null;
  } | null;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string | null;
    category: string;
  } | null;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // 分页和查询状态
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [searchEmail, setSearchEmail] = useState('');
  const [searchOrderId, setSearchOrderId] = useState('');
  const [emailOptions, setEmailOptions] = useState<string[]>([]);

  // 显示通知
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // 加载订单列表
  const loadOrders = useCallback(async (page = pagination.page, email = searchEmail, orderId = searchOrderId) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      if (email) params.append('email', email);
      if (orderId) params.append('orderId', orderId);

      const response = await fetch(`/api/admin/orders?${params}`);

      if (!response.ok) {
        throw new Error('获取订单列表失败');
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('加载订单列表失败:', error);
      setError(error instanceof Error ? error.message : '加载订单列表失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // 加载邮箱选项
  const loadEmailOptions = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users/emails');
      if (response.ok) {
        const data = await response.json();
        setEmailOptions(data.emails || []);
      }
    } catch (error) {
      console.error('加载邮箱选项失败:', error);
    }
  }, []);

  // 搜索处理
  const handleSearch = () => {
    loadOrders(1, searchEmail, searchOrderId);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchEmail('');
    setSearchOrderId('');
    loadOrders(1, '', '');
  };

  // 分页处理
  const handlePageChange = (newPage: number) => {
    loadOrders(newPage, searchEmail, searchOrderId);
  };

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
      loadOrders();
    } catch (error) {
      console.error('权限检查失败:', error);
      setHasPermission(false);
    }
  }, [loadOrders]);

  useEffect(() => {
    checkPermission();
    loadEmailOptions();
  }, [checkPermission, loadEmailOptions]);





  // 更新订单动态信息
  const updateNotes = async (orderId: number, notes: string) => {
    try {
      const response = await fetch('/api/admin/orders/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('更新订单动态信息失败');
      }

      showNotification('success', '订单动态信息更新成功');
      loadOrders();
    } catch (error) {
      console.error('更新订单动态信息失败:', error);
      showNotification('error', error instanceof Error ? error.message : '更新订单动态信息失败');
    }
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
          <p className="text-gray-600 mb-6">抱歉，您没有访问订单管理页面的权限。</p>
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

  // 加载中
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">加载订单列表中...</span>
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
          <Button onClick={() => loadOrders()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重试
          </Button>
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
          <span className="text-gray-900">订单管理</span>
        </nav>
      </div>

      {/* 页面标题 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">订单管理</h1>
        <Button onClick={() => loadOrders()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* 查询表单 */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 邮箱查询 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用户邮箱
            </label>
            <Select value={searchEmail || "all"} onValueChange={(value: string) => {
              const newEmail = value === "all" ? "" : value;
              setSearchEmail(newEmail);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="选择或输入邮箱" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部邮箱</SelectItem>
                {emailOptions.map((email) => (
                  <SelectItem key={email} value={email}>
                    {email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="email"
              placeholder="或直接输入邮箱"
              value={searchEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchEmail(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* 订单号查询 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              订单号
            </label>
            <Input
              type="number"
              placeholder="输入订单号"
              value={searchOrderId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchOrderId(e.target.value)}
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex items-end gap-2">
            <Button onClick={handleSearch} className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1">
              重置
            </Button>
          </div>
        </div>
      </Card>

      {/* 订单列表 */}
      {orders.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">暂无订单</h3>
          <p className="text-gray-500">还没有任何订单记录</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateNotes={updateNotes}
            />
          ))}
        </div>
      )}

      {/* 分页组件 */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
            上一页
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => handlePageChange(page)}
                variant={page === pagination.page ? "default" : "outline"}
                size="sm"
                className="min-w-[40px]"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            variant="outline"
            size="sm"
          >
            下一页
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 分页信息 */}
      <div className="text-center text-sm text-gray-500 mt-4">
        共 {pagination.totalCount} 条记录，第 {pagination.page} / {pagination.totalPages} 页
      </div>
    </div>
  );
}

// 订单卡片组件
function OrderCard({ order, onUpdateNotes }: {
  order: Order;
  onUpdateNotes: (orderId: number, notes: string) => void;
}) {
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [notes, setNotes] = useState(order.notes || '');

  // 状态显示文本
  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return '待支付';
      case 'paid': return '已支付';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };





  // 状态颜色
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };







  const confirmNotes = () => {
    onUpdateNotes(order.id, notes);
    setShowNotesDialog(false);
  };

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 订单基本信息 */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">订单 #{order.id}</h3>
              <p className="text-sm text-gray-500">
                创建时间: {new Date(order.createdAt).toLocaleString('zh-CN')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">¥{order.amount.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{order.currency}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">用户信息</p>
              <p className="font-medium">{order.user?.name || '未知用户'}</p>
              <p className="text-xs text-gray-400">ID: {order.user?.clerkId}</p>
              {order.user?.email && (
                <p className="text-xs text-gray-500">邮箱: {order.user.email}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">商品信息</p>
              <p className="font-medium">{order.product?.name || '未知商品'}</p>
              {order.product?.price && (
                <p className="text-sm text-gray-500">单价: ¥{order.product.price.toFixed(2)}</p>
              )}
            </div>
          </div>

          {/* 状态标签 */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              支付状态: {getStatusText(order.status)}
            </span>




          </div>





          {/* 订单动态信息 */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">订单动态信息</p>
            <div className="text-sm bg-blue-50 border border-blue-200 px-3 py-2 rounded">
              {order.notes || '当前还没有更新，请及时关注'}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">


          {/* 编辑订单动态信息按钮 */}
          <Button
            onClick={() => setShowNotesDialog(true)}
            variant="outline"
            className="w-full"
          >
            编辑订单动态
          </Button>


        </div>
      </div>



      {/* 订单动态信息编辑对话框 */}
      {showNotesDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">编辑订单动态信息</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                订单动态信息
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                placeholder="请输入订单动态信息，如：商品已发货、物流信息、处理进度等"
              />
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowNotesDialog(false)}
                variant="outline"
                className="flex-1"
              >
                取消
              </Button>
              <Button
                onClick={confirmNotes}
                className="flex-1"
              >
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
