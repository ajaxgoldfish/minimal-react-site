'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface OrderActionsProps {
  orderId: number;
  orderStatus: string;
  productName: string;
  amount: number;
}

export function OrderActions({ orderId, orderStatus, productName, amount }: OrderActionsProps) {
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // 只对待支付订单显示操作按钮
  if (orderStatus !== 'pending') {
    return null;
  }

  return (
    <>
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
    </>
  );
} 