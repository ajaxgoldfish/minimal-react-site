'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PayPalPayment } from '@/components/PayPalPayment';
import { confirmPayment } from '@/app/actions';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface Order {
  id: number;
  amount: number;
  currency: string;
  status: string;
  product: {
    name: string;
  };
}

interface PaymentPageClientProps {
  order: Order;
}

export default function PaymentPageClient({ order }: PaymentPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'mock'>('paypal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<'success' | 'error' | null>(null);
  const [resultMessage, setResultMessage] = useState('');

  const success = searchParams.get('success');
  const cancelled = searchParams.get('cancelled');

  // 如果是成功或取消状态，显示相应信息
  if (success) {
    return (
      <div className="container mx-auto max-w-md px-4 py-12">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-600 mb-4">支付成功！</h1>
          <div className="space-y-2 text-gray-600 mb-6">
            <p>订单号: #{order.id}</p>
            <p>商品: {order.product.name}</p>
            <p>金额: {order.currency} {order.amount.toFixed(2)}</p>
          </div>
          <Button onClick={() => router.push('/products')} className="w-full">
            返回商品列表
          </Button>
        </div>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="container mx-auto max-w-md px-4 py-12">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-orange-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-orange-600 mb-4">支付已取消</h1>
          <div className="space-y-2 text-gray-600 mb-6">
            <p>您已取消了支付流程</p>
            <p>订单号: #{order.id} 仍然有效</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/products')} 
              className="flex-1"
            >
              返回商品列表
            </Button>
            <Button onClick={() => window.location.reload()} className="flex-1">
              重新支付
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 处理支付结果显示
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

  const handlePayPalSuccess = (paymentData: any) => {
    setPaymentResult('success');
    setResultMessage(`支付成功完成！支付ID: ${paymentData.paymentDetails?.paymentId || 'N/A'}`);
  };

  const handlePayPalError = (error: any) => {
    setPaymentResult('error');
    setResultMessage(error.message || '支付过程中发生错误，请重试');
  };

  const handlePayPalCancel = () => {
    setResultMessage('您已取消支付');
  };

  const handleMockPayment = async () => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('orderId', order.id.toString());
      await confirmPayment(formData);
      setPaymentResult('success');
      setResultMessage('模拟支付成功完成！');
    } catch (error) {
      setPaymentResult('error');
      setResultMessage('模拟支付失败，请重试');
    } finally {
      setIsProcessing(false);
    }
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
              <span className="font-semibold">{order.product.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">状态:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                order.status === 'paid' ? 'bg-green-100 text-green-800' :
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status === 'paid' ? '已支付' : 
                 order.status === 'pending' ? '待支付' : order.status}
              </span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-xl font-bold">
                <span>总金额:</span>
                <span className="text-blue-600">{order.currency} {order.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 支付方式选择 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">选择支付方式</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              className={`p-4 border-2 rounded-lg transition-colors ${
                paymentMethod === 'paypal' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setPaymentMethod('paypal')}
            >
              <div className="text-center">
                <div className="font-semibold text-blue-600 mb-1">PayPal支付</div>
                <div className="text-sm text-gray-600">支持PayPal账户和信用卡</div>
              </div>
            </button>
            
            <button
              className={`p-4 border-2 rounded-lg transition-colors ${
                paymentMethod === 'mock' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setPaymentMethod('mock')}
            >
              <div className="text-center">
                <div className="font-semibold text-green-600 mb-1">模拟支付</div>
                <div className="text-sm text-gray-600">用于测试的模拟支付</div>
              </div>
            </button>
          </div>
        </div>

        {/* 支付组件 */}
        <div className="space-y-6">
          {paymentMethod === 'paypal' && (
            <PayPalPayment
              orderId={order.id}
              amount={order.amount}
              currency={order.currency}
              onSuccess={handlePayPalSuccess}
              onError={handlePayPalError}
              onCancel={handlePayPalCancel}
            />
          )}

          {paymentMethod === 'mock' && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">模拟支付</h3>
              <p className="text-gray-600 mb-4">
                这是一个模拟支付系统，点击下方按钮即可完成"支付"。
              </p>
              <Button 
                onClick={handleMockPayment}
                disabled={isProcessing}
                className="w-full text-lg py-3"
              >
                {isProcessing ? '处理中...' : '确认模拟支付'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 