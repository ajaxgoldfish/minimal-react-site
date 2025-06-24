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
  const [debug, setDebug] = useState<string>('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // 检查环境变量
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    console.log('PayPal Client ID:', clientId ? `${clientId.substring(0, 10)}...` : 'undefined');
    
    if (!clientId) {
      setError('PayPal Client ID 未配置');
      setIsLoading(false);
      return;
    }

    setDebug(`Client ID: ${clientId.substring(0, 10)}...\nWaiting for SDK to load...`);

    // 设置一个超时检查
    const timeout = setTimeout(() => {
      if (!scriptLoaded) {
        setDebug(prev => prev + '\nSDK loading timeout - checking manually...');
        
        // 手动检查 PayPal 是否已加载
        if (window.paypal) {
          setDebug(prev => prev + '\nPayPal found in window object');
          handleScriptLoadSuccess();
        } else {
          setDebug(prev => prev + '\nPayPal not found in window object');
          setError('PayPal SDK 加载超时');
          setIsLoading(false);
        }
      }
    }, 10000); // 10秒超时

    return () => clearTimeout(timeout);
  }, [scriptLoaded]);

  const initializePayPal = () => {
    console.log('Initializing PayPal...');
    setDebug(prev => prev + '\nInitializing PayPal...');

    if (!window.paypal) {
      console.error('PayPal SDK not loaded');
      setError('PayPal SDK 未正确加载');
      setIsLoading(false);
      return;
    }

    setDebug(prev => prev + '\nPayPal SDK found, creating buttons...');

    try {
      console.log('Creating PayPal buttons...');
      setDebug(prev => prev + '\nCreating PayPal buttons...');

      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
          height: 50,
        },
        
        createOrder: async () => {
          console.log('Creating order for orderId:', orderId);
          setDebug(prev => prev + `\nCreating order for orderId: ${orderId}`);
          
          try {
            const response = await fetch('/api/payments/paypal/create-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ orderId }),
            });

            console.log('Create order response status:', response.status);
            setDebug(prev => prev + `\nAPI response status: ${response.status}`);

            if (!response.ok) {
              const errorText = await response.text();
              console.error('Create order failed:', errorText);
              throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Create order response:', data);
            
            if (!data.success) {
              throw new Error(data.error || 'Failed to create PayPal order');
            }

            console.log('PayPal order created:', data.paypalOrderId);
            setDebug(prev => prev + `\nPayPal order created: ${data.paypalOrderId}`);
            return data.paypalOrderId;
          } catch (error) {
            console.error('Error creating PayPal order:', error);
            setDebug(prev => prev + `\nError: ${error}`);
            onError(error);
            throw error;
          }
        },

        onApprove: async (data: any) => {
          console.log('Payment approved:', data);
          setDebug(prev => prev + `\nPayment approved: ${data.orderID}`);
          
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
              console.log('Payment captured successfully');
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
          console.error('PayPal button error:', err);
          setDebug(prev => prev + `\nPayPal error: ${err}`);
          onError(err);
        },

        onCancel: () => {
          console.log('Payment cancelled by user');
          setDebug(prev => prev + '\nPayment cancelled');
          onCancel();
        },
      }).render('#paypal-button-container').then(() => {
        console.log('PayPal buttons rendered successfully');
        setDebug(prev => prev + '\nPayPal buttons rendered successfully');
        setIsLoading(false);
      }).catch((error: any) => {
        console.error('Error rendering PayPal buttons:', error);
        setDebug(prev => prev + `\nRender error: ${error}`);
        setError('PayPal 按钮渲染失败: ' + error.message);
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Error initializing PayPal:', error);
      setDebug(prev => prev + `\nInitialization error: ${error}`);
      setError('初始化PayPal支付失败: ' + (error as Error).message);
      setIsLoading(false);
    }
  };

  const handleScriptLoadSuccess = () => {
    console.log('PayPal SDK loaded successfully');
    setScriptLoaded(true);
    setDebug(prev => prev + '\nPayPal SDK loaded successfully');
    
    // 添加一个小延迟确保SDK完全初始化
    setTimeout(() => {
      initializePayPal();
    }, 200);
  };

  const handleScriptLoad = () => {
    handleScriptLoadSuccess();
  };

  const handleScriptError = (error: any) => {
    console.error('Failed to load PayPal SDK:', error);
    setError('PayPal SDK 加载失败');
    setDebug(prev => prev + '\nPayPal SDK 加载失败: ' + error);
    setIsLoading(false);
  };

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">PayPal Client ID 未配置，请检查环境变量。</p>
      </div>
    );
  }

  // 构建PayPal SDK URL
  const paypalSdkUrl = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture&disable-funding=credit,card`;

  return (
    <div className="w-full">
      <Script
        src={paypalSdkUrl}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy="lazyOnload"
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
          <div className="py-8">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">加载PayPal支付...</span>
            </div>
            
            {/* 调试信息 */}
            <details className="mt-4">
              <summary className="text-sm text-gray-500 cursor-pointer">显示调试信息</summary>
              <pre className="mt-2 p-2 bg-gray-100 text-xs rounded whitespace-pre-wrap">
                {debug || '正在初始化...'}
              </pre>
              <div className="mt-2 text-xs text-gray-400">
                <p>SDK URL: {paypalSdkUrl}</p>
                <p>Script Loaded: {scriptLoaded ? '是' : '否'}</p>
                <p>PayPal Object: {typeof window !== 'undefined' && window.paypal ? '存在' : '不存在'}</p>
              </div>
            </details>
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
            
            {/* 调试信息 */}
            <details className="mt-2">
              <summary className="text-sm text-red-500 cursor-pointer">显示调试信息</summary>
              <pre className="mt-2 p-2 bg-red-100 text-xs rounded whitespace-pre-wrap">
                {debug}
              </pre>
              <div className="mt-2 text-xs text-red-400">
                <p>SDK URL: {paypalSdkUrl}</p>
                <p>Script Loaded: {scriptLoaded ? '是' : '否'}</p>
                <p>PayPal Object: {typeof window !== 'undefined' && window.paypal ? '存在' : '不存在'}</p>
              </div>
            </details>
            
            <button
              onClick={() => {
                setError(null);
                setDebug('');
                setIsLoading(true);
                setScriptLoaded(false);
                window.location.reload();
              }}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              重试
            </button>
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