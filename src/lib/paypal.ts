// PayPal 沙盒 REST API 集成
// 使用简单的HTTP请求，更稳定和灵活

interface PayPalAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export class PayPalService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly baseUrl: string;

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
    this.baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
  }

  /**
   * 获取 PayPal 访问令牌
   */
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const data: PayPalAccessToken = await response.json();
    return data.access_token;
  }

  /**
   * 创建 PayPal 订单
   */
  async createOrder(orderData: {
    orderId: number;
    amount: string;
    currency: string;
    description?: string;
  }) {
    try {
      const accessToken = await this.getAccessToken();
      
      const requestBody = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderData.orderId.toString(),
            description: orderData.description || `订单 #${orderData.orderId}`,
            amount: {
              currency_code: orderData.currency,
              value: orderData.amount,
            },
          },
        ],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/processing?orderId=${orderData.orderId}`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/${orderData.orderId}?cancelled=true`,
          brand_name: '外贸网站',
          landing_page: 'LOGIN',
          user_action: 'PAY_NOW',
        },
      };

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PayPal API Error:', response.status, errorText);
        throw new Error(`PayPal API Error: ${response.status}`);
      }

      const order: PayPalOrderResponse = await response.json();
      const approvalUrl = order.links.find(link => link.rel === 'approve')?.href;
      
      return {
        success: true,
        paypalOrderId: order.id,
        approvalUrl,
        order,
      };
    } catch (error) {
      console.error('PayPal Create Order Error:', error);
      throw new Error('创建PayPal订单失败');
    }
  }

  /**
   * 捕获 PayPal 支付
   */
  async capturePayment(paypalOrderId: string) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PayPal Capture Error:', response.status, errorText);
        throw new Error(`PayPal Capture Error: ${response.status}`);
      }

      const captureData = await response.json();
      const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
      
      return {
        success: true,
        paymentId: capture?.id,
        status: capture?.status,
        amount: capture?.amount,
        captureData,
      };
    } catch (error) {
      console.error('PayPal Capture Error:', error);
      throw new Error('捕获PayPal支付失败');
    }
  }

  /**
   * 获取订单详情
   */
  async getOrderDetails(paypalOrderId: string) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${paypalOrderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PayPal Get Order Error:', response.status, errorText);
        throw new Error(`PayPal Get Order Error: ${response.status}`);
      }

      const order = await response.json();
      
      return {
        success: true,
        order,
      };
    } catch (error) {
      console.error('PayPal Get Order Error:', error);
      throw new Error('获取PayPal订单详情失败');
    }
  }

  /**
   * 验证 Webhook 签名（沙盒环境简化版）
   */
  async verifyWebhookSignature(
    headers: Headers,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _body: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _webhookId: string
  ): Promise<boolean> {
    try {
      // 获取 PayPal webhook 验证所需的头部信息
      const authAlgo = headers.get('paypal-auth-algo');
      const transmission_id = headers.get('paypal-transmission-id');
      const cert_id = headers.get('paypal-cert-id');
      const transmission_sig = headers.get('paypal-transmission-sig');
      const transmission_time = headers.get('paypal-transmission-time');

      if (!authAlgo || !transmission_id || !cert_id || !transmission_sig || !transmission_time) {
        console.log('Missing webhook headers');
        return false;
      }

      // 沙盒环境：简单验证基本信息存在
      // 生产环境需要完整的签名验证
      console.log('Webhook verification (sandbox mode):', {
        authAlgo,
        transmission_id,
        cert_id,
        hasSignature: !!transmission_sig,
        transmission_time,
      });

      return true; // 沙盒环境暂时返回 true
    } catch (error) {
      console.error('Webhook verification error:', error);
      return false;
    }
  }
}

// 导出单例实例
export const paypalService = new PayPalService(); 