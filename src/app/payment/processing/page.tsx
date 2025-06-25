'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentProcessingState {
  status: 'processing' | 'success' | 'error';
  message: string;
  orderInfo?: {
    id: number;
    amount: number;
    currency: string;
  };
}

function PaymentProcessingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<PaymentProcessingState>({
    status: 'processing',
    message: '正在处理您的支付...',
  });

  useEffect(() => {
    const processPayment = async () => {
      try {
        const orderId = searchParams.get('orderId');
        const token = searchParams.get('token'); // PayPal订单ID
        // const payerId = searchParams.get('PayerID'); // 暂时不使用

        if (!orderId || !token) {
          setState({
            status: 'error',
            message: '缺少必要的支付参数',
          });
          return;
        }

        // 调用捕获支付API
        const response = await fetch('/api/payments/paypal/capture-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paypalOrderId: token,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setState({
            status: 'success',
            message: '支付成功！',
            orderInfo: result.order,
          });

          // 2秒后跳转到支付成功页面
          setTimeout(() => {
            router.push(`/payment/${orderId}?success=true`);
          }, 2000);
        } else {
          setState({
            status: 'error',
            message: result.error || '支付处理失败',
          });
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        setState({
          status: 'error',
          message: '支付处理过程中发生错误',
        });
      }
    };

    processPayment();
  }, [searchParams, router]);

  const getStatusIcon = () => {
    switch (state.status) {
      case 'processing':
        return (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        );
      case 'success':
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (state.status) {
      case 'processing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold">支付处理</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center">
            {getStatusIcon()}
          </div>
          
          <div>
            <p className={`text-lg font-medium ${getStatusColor()}`}>
              {state.message}
            </p>
            
            {state.orderInfo && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">订单信息</p>
                <p className="font-medium">
                  订单号: #{state.orderInfo.id}
                </p>
                <p className="font-medium">
                  金额: {state.orderInfo.currency} {state.orderInfo.amount}
                </p>
              </div>
            )}
          </div>

          {state.status === 'error' && (
            <div className="space-y-2">
              <button
                onClick={() => router.back()}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                返回
              </button>
            </div>
          )}

          {state.status === 'success' && (
            <p className="text-sm text-gray-500">
              正在跳转到订单详情页...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentProcessingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold">支付处理</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-lg font-medium text-blue-600">正在加载...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentProcessingContent />
    </Suspense>
  );
} 