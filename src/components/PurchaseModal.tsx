"use client";

import { useEffect } from 'react';
import { X, ShoppingCart, CreditCard, CheckCircle, AlertCircle, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePurchaseFlow, type ProductInfo } from '@/hooks/usePurchaseFlow';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductInfo | null;
}

export function PurchaseModal({ isOpen, onClose, product }: PurchaseModalProps) {
  const {
    step,
    selectedProduct,
    error,
    startPurchase,
    confirmPurchase,
    goToPayment,
    resetFlow,
    setStep,
    createdOrder,
  } = usePurchaseFlow();

  // 当modal打开且有产品信息时，自动开始购买流程
  useEffect(() => {
    if (isOpen && product && step === 'idle') {
      startPurchase(product);
    }
  }, [isOpen, product, step, startPurchase]);

  // 当modal关闭时重置流程
  useEffect(() => {
    if (!isOpen) {
      resetFlow();
    }
  }, [isOpen, resetFlow]);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    resetFlow();
  };

  const handleGoToLogin = () => {
    handleClose();
    window.location.href = '/sign-in';
  };

  const renderStepContent = () => {
    switch (step) {
      case 'loading':
        return (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">处理中...</h3>
            <p className="text-gray-600">请稍候，正在为您创建订单</p>
          </div>
        );

      case 'login':
        return (
          <div className="text-center py-6">
            <LogIn className="h-16 w-16 mx-auto mb-6 text-blue-600" />
            <h3 className="text-xl font-semibold mb-3">需要登录</h3>
            <p className="text-gray-600 mb-6">
              请先登录您的账户，然后再购买商品
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleGoToLogin}
                className="w-full"
                size="lg"
              >
                前往登录
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="w-full"
              >
                稍后再说
              </Button>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-xl font-semibold mb-4">确认购买</h3>
            
            {selectedProduct && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">商品名称:</span>
                  <span>{selectedProduct.name}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>价格:</span>
                  <span className="text-blue-600">¥{selectedProduct.price.toFixed(2)}</span>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
              >
                取消
              </Button>
              <Button 
                onClick={confirmPurchase}
                className="flex-1"
                disabled={!selectedProduct}
              >
                确认购买
              </Button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-4">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-semibold mb-2 text-green-600">订单创建成功!</h3>
            
            {createdOrder && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">订单号:</span>
                  <span className="font-mono">{createdOrder.id}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">商品:</span>
                  <span>{createdOrder.product.name}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>金额:</span>
                  <span className="text-blue-600">¥{createdOrder.amount.toFixed(2)}</span>
                </div>
              </div>
            )}
            
            <p className="text-gray-600 mb-6">
              您的订单已成功创建，现在可以前往支付页面完成支付
            </p>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
              >
                稍后支付
              </Button>
              <Button 
                onClick={() => {
                  if (createdOrder) {
                    goToPayment(createdOrder.id);
                    handleClose();
                  }
                }}
                className="flex-1"
                disabled={!createdOrder}
              >
                立即支付
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-xl font-semibold mb-2 text-red-600">购买失败</h3>
            <p className="text-gray-600 mb-6">{error || '发生了未知错误，请重试'}</p>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
              >
                关闭
              </Button>
              <Button 
                onClick={() => setStep('confirm')}
                className="flex-1"
              >
                重试
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">加载中...</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">购买商品</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
} 