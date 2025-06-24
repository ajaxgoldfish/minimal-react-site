# PayPal 支付集成指南

## 🚀 快速开始

本项目已经集成了 PayPal 沙盒支付功能，您可以在没有真实 PayPal 账户的情况下进行完整的支付测试。

## 📋 配置步骤

### 1. 注册 PayPal 开发者账户

1. 访问 [PayPal Developer](https://developer.paypal.com/)
2. 使用任意邮箱注册开发者账户（无需真实 PayPal 账户）
3. 登录后进入 Developer Dashboard

### 2. 创建沙盒应用

1. 在 Dashboard 中点击 **"Create App"**
2. 填写应用信息：
   - App Name: `您的应用名称`
   - Merchant: 选择默认的测试商户账户
   - Features: 勾选 **"Accept payments"**
3. 点击 **"Create App"**

### 3. 获取 API 凭据

创建应用后，您将获得以下凭据：
- **Client ID**: 公开标识符（以 `AY` 或 `Aa` 开头）
- **Client Secret**: 私密密钥

### 4. 配置环境变量

在项目根目录创建 `.env.local` 文件，添加以下配置：

```bash
# Clerk 配置
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret

# PayPal 沙盒配置
NEXT_PUBLIC_PAYPAL_CLIENT_ID=你的PayPal客户端ID
PAYPAL_CLIENT_SECRET=你的PayPal客户端密钥
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com

# 网站配置
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# 可选：Webhook ID（用于生产环境）
PAYPAL_WEBHOOK_ID=test-webhook-id
```

## 🧪 测试支付功能

### PayPal 测试账户

PayPal 沙盒环境提供了测试用的买家和卖家账户：

**测试买家账户:**
- 邮箱: `sb-buyer@business.example.com`
- 密码: `test1234`

**测试卖家账户:**
- 邮箱: `sb-seller@business.example.com`
- 密码: `test1234`

### 测试信用卡信息

在 PayPal 沙盒中，您可以使用以下测试信用卡：

| 卡类型 | 卡号 | 到期日期 | CVV |
|--------|------|----------|-----|
| Visa | 4032032115055572 | 01/2026 | 123 |
| MasterCard | 5555555555554444 | 01/2026 | 123 |
| American Express | 378282246310005 | 01/2026 | 1234 |

## 🔧 代码结构说明

```
src/
├── lib/paypal.ts                           # PayPal 服务类
├── app/api/payments/paypal/
│   ├── create-order/route.ts               # 创建订单 API
│   ├── capture-payment/route.ts            # 捕获支付 API
│   └── webhook/route.ts                    # Webhook 处理
├── app/payment/
│   ├── [orderId]/
│   │   ├── page.tsx                        # 支付页面
│   │   └── PaymentPageClient.tsx           # 客户端支付组件
│   └── processing/page.tsx                 # 支付处理页面
└── components/
    ├── PayPalPayment.tsx                   # PayPal 支付组件
    └── PurchaseModal.tsx                   # 购买模态框
```

## 💳 支付流程

1. **用户选择商品** → 触发购买流程
2. **登录验证** → 使用 Clerk 认证
3. **创建本地订单** → 在数据库中生成订单记录
4. **选择支付方式** → PayPal 或模拟支付
5. **PayPal 支付**:
   - 调用 `/api/payments/paypal/create-order`
   - 重定向到 PayPal 支付页面
   - 用户完成支付授权
   - 返回到 `/payment/processing`
   - 调用 `/api/payments/paypal/capture-payment`
   - 更新订单状态为已支付

## 🔧 Webhook 配置（可选）

在生产环境中，建议配置 Webhook 以接收 PayPal 的异步通知：

1. 在 PayPal Developer Dashboard 中创建 Webhook
2. 设置 Webhook URL: `https://your-domain.com/api/payments/paypal/webhook`
3. 选择事件类型:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `CHECKOUT.ORDER.APPROVED`
   - `CHECKOUT.ORDER.CANCELLED`

## 🚀 启动项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 开始测试支付功能。

## 📝 测试流程

1. 访问商品页面：`http://localhost:3000/products`
2. 点击任意商品的"购买"按钮
3. 登录（使用 Clerk 认证）
4. 确认订单信息
5. 进入支付页面，选择 PayPal 支付
6. 使用测试账户完成支付
7. 查看支付结果

## 🔍 故障排除

### 常见问题

1. **PayPal SDK 加载失败**
   - 检查 `NEXT_PUBLIC_PAYPAL_CLIENT_ID` 是否正确配置
   - 确认网络连接正常

2. **创建订单失败**
   - 验证 `PAYPAL_CLIENT_SECRET` 配置
   - 检查 API 路由是否正常工作

3. **支付捕获失败**
   - 确认订单状态为 `pending`
   - 检查 PayPal 订单 ID 是否正确

### 调试技巧

- 查看浏览器控制台错误信息
- 检查 Next.js 服务器日志
- 在 PayPal Developer Dashboard 查看 API 调用日志

## 🌟 生产环境部署

部署到生产环境时：

1. 将 `PAYPAL_ENVIRONMENT` 改为 `production`
2. 将 `PAYPAL_BASE_URL` 改为 `https://api-m.paypal.com`
3. 使用生产环境的 PayPal 应用凭据
4. 配置真实的 Webhook 端点
5. 完善错误处理和日志记录

## 📚 参考资源

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal JavaScript SDK](https://developer.paypal.com/docs/checkout/reference/customize-sdk/)
- [PayPal REST API](https://developer.paypal.com/docs/api/overview/)
- [PayPal Webhooks](https://developer.paypal.com/docs/api/webhooks/)

---

现在您已经可以开始测试 PayPal 支付功能了！🎉 