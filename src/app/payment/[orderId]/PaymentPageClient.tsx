'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PayPalPayment } from '@/components/PayPalPayment';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface Order {
  id: number;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  paypalOrderId: string | null;
  userId: number | null;
  productId: number | null;
  user: {
    id: number;
    clerkId: string;
    name: string | null;
    age: number | null;
  } | null;
  product: {
    id: number;
    name: string;
    description: string;
    image: string;
    category: string;
    price: number;
  } | null;
}

interface PaymentPageClientProps {
  order: Order;
}

export default function PaymentPageClient({ order }: PaymentPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentResult, setPaymentResult] = useState<'success' | 'error' | null>(null);
  const [resultMessage, setResultMessage] = useState('');

  const success = searchParams.get('success');
  const cancelled = searchParams.get('cancelled');

  // 如果URL参数包含 success，显示成功信息
  if (success) {
    return (
      <div className="container mx-auto max-w-md px-4 py-12">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-600 mb-4">支付成功！</h1>
          <div className="space-y-2 text-gray-600 mb-6">
            <p>订单号: #{order.id}</p>
            <p>商品: {order.product?.name || '商品信息不可用'}</p>
            <p>金额: {order.currency} {order.amount.toFixed(2)}</p>
          </div>
          <Button onClick={() => router.push('/products')} className="w-full">
            返回商品列表
          </Button>
        </div>
      </div>
    );
  }

  // 如果URL参数包含 cancelled，显示取消信息
  if (cancelled) {
    return (
      <div className="container mx-auto max-w-md px-4 py-12">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-orange-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-orange-600 mb-4">支付已取消</h1>
          <div className="space-y-2 text-gray-600 mb-6">
            <p>您已取消了支付流程。</p>
            <p>订单号: #{order.id} 仍然有效，您可以随时返回重新支付。</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/products')} 
              className="flex-1"
            >
              返回商品列表
            </Button>
            <Button onClick={() => router.push(`/payment/${order.id}`)} className="flex-1">
              重新支付
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 处理支付组件的回调结果
  if (paymentResult) {
    return (
      <div className="container mx-auto max-w-md px-4 py-12">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          {paymentResult === 'success' ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-green-600 mb-4">支付成功！</h1>
            </>
          ) : (
            <>
              <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-600 mb-4">支付失败</h1>
            </>
          )}
          <p className="text-gray-600 mb-6">{resultMessage}</p>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setPaymentResult(null)} 
              className="flex-1"
            >
              {paymentResult === 'success' ? '返回' : '重试'}
            </Button>
            {paymentResult === 'success' && (
              <Button onClick={() => router.push('/products')} className="flex-1">
                返回商品列表
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePayPalSuccess = (paymentData: any) => {
    setPaymentResult('success');
    setResultMessage(`支付成功完成！支付ID: ${paymentData.paymentDetails?.paymentId || 'N/A'}`);
    // 支付成功后也可以跳转
    // router.push(`/payment/${order.id}?success=true`);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePayPalError = (error: any) => {
    setPaymentResult('error');
    setResultMessage(error.message || '支付过程中发生错误，请重试');
  };

  const handlePayPalCancel = () => {
    // 可以选择显示一个消息，或者直接不做任何事
    console.log('Payment cancelled');
    router.push(`/payment/${order.id}?cancelled=true`);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">支付订单</h1>
        
        {/* 订单信息 */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">订单详情</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">订单号:</span>
              <span className="font-mono">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">商品:</span>
              <span className="font-semibold">{order.product?.name || '商品信息不可用'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">状态:</span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                order.status === 'paid' ? 'bg-green-100 text-green-800' :
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status === 'paid' ? '已支付' : 
                 order.status === 'pending' ? '待支付' : order.status}
              </span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-xl font-bold">
                <span>总金额:</span>
                <span className="text-blue-600">{order.currency} {order.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 支付组件 */}
        <div className="space-y-6">
          <PayPalPayment
            orderId={order.id}
            amount={order.amount}
            currency={order.currency}
            onSuccess={handlePayPalSuccess}
            onError={handlePayPalError}
            onCancel={handlePayPalCancel}
          />
        </div>
      </div>
    </div>
  );
} 