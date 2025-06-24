'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface PayPalPaymentProps {
  orderId: number;
  amount: number;
  currency: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export function PayPalPayment({ 
  orderId, 
  amount, 
  currency, 
  onSuccess, 
  onError, 
  onCancel 
}: PayPalPaymentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializePayPal = () => {
    if (!window.paypal) {
      setError('PayPal SDK 加载失败');
      return;
    }

    try {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
          height: 50,
        },
        
        createOrder: async () => {
          try {
            const response = await fetch('/api/payments/paypal/create-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ orderId }),
            });

            const data = await response.json();
            
            if (!data.success) {
              throw new Error(data.error || 'Failed to create PayPal order');
            }

            return data.paypalOrderId;
          } catch (error) {
            console.error('Error creating PayPal order:', error);
            onError(error);
            throw error;
          }
        },

        onApprove: async (data: any) => {
          try {
            const response = await fetch('/api/payments/paypal/capture-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                paypalOrderId: data.orderID 
              }),
            });

            const result = await response.json();
            
            if (result.success) {
              onSuccess(result);
            } else {
              throw new Error(result.error || 'Payment capture failed');
            }
          } catch (error) {
            console.error('Error capturing payment:', error);
            onError(error);
          }
        },

        onError: (err: any) => {
          console.error('PayPal error:', err);
          onError(err);
        },

        onCancel: () => {
          console.log('Payment cancelled by user');
          onCancel();
        },
      }).render('#paypal-button-container');

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing PayPal:', error);
      setError('初始化PayPal支付失败');
      setIsLoading(false);
    }
  };

  const handleScriptLoad = () => {
    console.log('PayPal SDK loaded');
    initializePayPal();
  };

  const handleScriptError = () => {
    console.error('Failed to load PayPal SDK');
    setError('PayPal SDK 加载失败');
    setIsLoading(false);
  };

  return (
    <div className="w-full">
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=${currency}&intent=capture`}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      
      <div className="bg-white rounded-lg border p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">PayPal支付</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>订单号: #{orderId}</p>
            <p>金额: {currency} {amount.toFixed(2)}</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">加载PayPal支付...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-red-700 font-medium">错误</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* PayPal 按钮容器 */}
        <div id="paypal-button-container" className={isLoading || error ? 'hidden' : ''}></div>

        {!isLoading && !error && (
          <div className="mt-4 text-xs text-gray-500">
            <p>• 支持PayPal账户和信用卡支付</p>
            <p>• 支付信息由PayPal安全处理</p>
            <p>• 支持多种货币和国际支付</p>
          </div>
        )}
      </div>
    </div>
  );
} 