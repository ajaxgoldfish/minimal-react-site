import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { createOrder } from '@/app/actions';
import { useRouter } from 'next/navigation';

export type PurchaseStep = 'idle' | 'login' | 'confirm' | 'payment' | 'loading' | 'success' | 'error';

export interface ProductInfo {
  id: string;
  name: string;
  price: number;
  image?: string | null;
}

export interface OrderInfo {
  id: number;
  amount: number;
  status: string;
  product: {
    id: number;
    name: string;
    price: number;
  };
}

export const usePurchaseFlow = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [step, setStep] = useState<PurchaseStep>('idle');
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
  const [createdOrder, setCreatedOrder] = useState<OrderInfo | null>(null);
  const [error, setError] = useState<string>('');

  // 重置流程
  const resetFlow = () => {
    setStep('idle');
    setSelectedProduct(null);
    setCreatedOrder(null);
    setError('');
  };

  // 开始购买流程
  const startPurchase = async (product: ProductInfo) => {
    setError('');
    setSelectedProduct(product);

    // 检查用户登录状态
    if (!isLoaded) {
      // Clerk还在加载中
      setStep('loading');
      return;
    }

    if (!user) {
      // 用户未登录，显示登录弹窗
      setStep('login');
      return;
    }

    // 用户已登录，显示确认弹窗
    setStep('confirm');
  };

  // 确认购买
  const confirmPurchase = async () => {
    if (!selectedProduct) return;

    setStep('loading');
    setError('');

    try {
      // 调用创建订单的服务器action
      const result = await createOrder(selectedProduct.id);

      if (result.success && result.order) {
        setCreatedOrder(result.order);
        setStep('success');
      } else {
        throw new Error('创建订单失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建订单失败，请重试');
      setStep('error');
    }
  };

  // 处理登录成功后的回调
  const handleLoginSuccess = () => {
    if (selectedProduct) {
      setStep('confirm');
    } else {
      resetFlow();
    }
  };

  // 跳转到支付页面
  const goToPayment = (orderId: number) => {
    router.push(`/payment/${orderId}`);
    resetFlow();
  };

  return {
    step,
    selectedProduct,
    createdOrder,
    error,
    startPurchase,
    confirmPurchase,
    handleLoginSuccess,
    goToPayment,
    resetFlow,
    setStep,
  };
}; 