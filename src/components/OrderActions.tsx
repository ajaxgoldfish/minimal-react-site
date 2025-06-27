'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, RefreshCw, Ban } from 'lucide-react';

interface OrderActionsProps {
  orderId: number;
  orderStatus: string;
  productName: string;
  amount: number;
  shippingStatus?: string;
  refundStatus?: string;
  shippingInfo?: string | null;
}

export function OrderActions({
  orderId,
  orderStatus,
  productName,
  amount,
  shippingStatus = 'not_shipped',
  refundStatus = 'normal',
  shippingInfo
}: OrderActionsProps) {
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundRequestInfo, setRefundRequestInfo] = useState('');

  const handleContinuePayment = () => {
    router.push(`/payment/${orderId}`);
  };

  const handleCancelOrder = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: orderId.toString() }),
      });

      if (response.ok) {
        router.refresh(); // 刷新页面数据
        setShowCancelDialog(false);
      } else {
        const error = await response.json();
        alert(error.message || '取消订单失败，请重试');
      }
    } catch (error) {
      console.error('取消订单失败:', error);
      alert('取消订单失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefundAction = async (action: 'apply' | 'cancel') => {
    // 如果是申请退款，检查是否填写了退款申请信息
    if (action === 'apply') {
      if (!refundRequestInfo.trim()) {
        alert('请填写申请退货信息');
        return;
      }
      if (!refundRequestInfo.includes('@')) {
        alert('请在申请退货信息中留下您的电子邮件地址');
        return;
      }
    }

    setRefundLoading(true);
    try {
      const response = await fetch('/api/orders/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId.toString(),
          action,
          refundRequestInfo: action === 'apply' ? refundRequestInfo : undefined
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        router.refresh(); // 刷新页面数据
        setShowRefundDialog(false);
        setRefundRequestInfo(''); // 清空输入
      } else {
        const error = await response.json();
        alert(error.error || '操作失败，请重试');
      }
    } catch (error) {
      console.error('退款操作失败:', error);
      alert('操作失败，请重试');
    } finally {
      setRefundLoading(false);
    }
  };

  // 根据订单状态显示不同的操作按钮
  const renderActions = () => {
    if (orderStatus === 'pending') {
      // 待支付订单：继续支付、取消订单
      return (
        <div className="flex gap-3 pt-3 border-t">
          <Button
            onClick={handleContinuePayment}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            继续支付
          </Button>
          <Button
            onClick={() => setShowCancelDialog(true)}
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
          >
            取消订单
          </Button>
        </div>
      );
    }

    if (orderStatus === 'paid') {
      // 已支付订单：显示发货状态和退款操作
      return (
        <div className="pt-3 border-t space-y-3">
          {/* 发货状态显示 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">发货状态:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              shippingStatus === 'shipped'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
              {shippingStatus === 'shipped' ? '已发货' : '未发货'}
            </span>
          </div>

          {/* 发货信息 */}
          {shippingInfo && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">发货信息:</span>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {shippingInfo}
              </span>
            </div>
          )}

          {/* 退款操作 */}
          {refundStatus === 'normal' && (
            <Button
              onClick={() => setShowRefundDialog(true)}
              variant="outline"
              className="w-full border-yellow-300 text-yellow-600 hover:bg-yellow-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              申请退款
            </Button>
          )}

          {refundStatus === 'pending' && (
            <div className="space-y-2">
              <div className="text-center text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                退款申请已提交，等待管理员审核
              </div>
              <Button
                onClick={() => handleRefundAction('cancel')}
                variant="outline"
                className="w-full"
                disabled={refundLoading}
              >
                {refundLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4 mr-2" />
                    取消申请
                  </>
                )}
              </Button>
            </div>
          )}

          {refundStatus === 'approved' && (
            <div className="text-center text-sm text-green-600 bg-green-50 p-2 rounded">
              ✓ 退款已批准，请等待退款到账
            </div>
          )}

          {refundStatus === 'rejected' && (
            <div className="text-center text-sm text-red-600 bg-red-50 p-2 rounded">
              ✗ 退款申请已被拒绝
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {renderActions()}

      {/* 取消确认对话框 */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <h3 className="text-lg font-semibold">确认取消订单</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-2">您确定要取消以下订单吗？</p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium">{productName}</p>
                <p className="text-sm text-gray-600">订单号: {orderId}</p>
                <p className="text-sm text-gray-600">金额: ${amount.toFixed(2)}</p>
              </div>
              <p className="text-sm text-red-600 mt-2">
                ⚠️ 取消后将无法恢复，需要重新下单
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setShowCancelDialog(false)}
                variant="outline" 
                className="flex-1"
                disabled={isLoading}
              >
                保留订单
              </Button>
              <Button 
                onClick={handleCancelOrder}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    取消中...
                  </>
                ) : (
                  '确认取消'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 退款确认对话框 */}
      {showRefundDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="h-6 w-6 text-yellow-500" />
              <h3 className="text-lg font-semibold">申请退款</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">请填写申请退货信息：</p>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="font-medium">{productName}</p>
                <p className="text-sm text-gray-600">订单号: {orderId}</p>
                <p className="text-sm text-gray-600">金额: ${amount.toFixed(2)}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  申请退货信息 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={refundRequestInfo}
                  onChange={(e) => setRefundRequestInfo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  rows={4}
                  placeholder="请详细说明退货原因，并务必留下您的电子邮件地址以便联系"
                />
              </div>

              <p className="text-sm text-yellow-600">
                ⚠️ 请务必在申请信息中留下您的电子邮件地址，申请提交后需要等待管理员审核
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowRefundDialog(false);
                  setRefundRequestInfo('');
                }}
                variant="outline"
                className="flex-1"
                disabled={refundLoading}
              >
                取消
              </Button>
              <Button
                onClick={() => handleRefundAction('apply')}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                disabled={refundLoading}
              >
                {refundLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    申请中...
                  </>
                ) : (
                  '确认申请'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}