# 极简电商网站 | Minimal E-commerce Site

一个基于 Next.js 15 的现代电商应用，具备完整的用户认证、商品管理和支付功能。

*A modern e-commerce application built with Next.js 15, featuring complete user authentication, product management, and payment functionality.*

[English](#english) | 中文

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **数据库**: SQLite + Drizzle ORM
- **认证**: Clerk
- **支付**: PayPal
- **UI**: Tailwind CSS + shadcn/ui
- **部署**: PM2 + Shell Scripts

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── payments/      # PayPal 支付接口
│   │   └── products/      # 商品接口
│   ├── products/          # 商品页面
│   ├── payment/           # 支付页面
│   ├── user/              # 用户中心
│   └── sign-in/           # 登录页面
├── components/            # React 组件
│   ├── ui/                # 基础 UI 组件
│   ├── ProductList.tsx    # 商品列表
│   ├── PurchaseModal.tsx  # 购买弹窗
│   └── OrderActions.tsx   # 订单操作
├── db/                    # 数据库
│   ├── schema.ts          # 数据表结构
│   └── index.ts           # 数据库连接
├── hooks/                 # 自定义 Hooks
└── lib/                   # 工具函数
```

## 核心功能

- ✅ 用户注册/登录 (Clerk)
- ✅ 商品展示与分类
- ✅ 购物车与订单管理
- ✅ 订单状态控制 (待支付/已支付/已取消)
- ✅ PayPal 支付集成
- ✅ 响应式设计
- ✅ TypeScript 类型安全

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 环境配置
创建 `.env.local` 文件：
```env
# Clerk 认证
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_secret
```

### 3. 数据库初始化
```bash
npm run db:push     # 创建数据表
npm run db:seed     # 初始化数据
```

### 4. 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 生产部署

使用包含的部署脚本：
```bash
chmod +x deploy.sh
./deploy.sh
```

## 数据库结构

- **user**: 用户信息
- **product**: 商品信息  
- **order**: 订单信息

关系：`user` 1:N `order` N:1 `product`

---

## English

A modern e-commerce application built with Next.js 15, featuring complete user authentication, product management, and payment functionality.

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: SQLite + Drizzle ORM
- **Authentication**: Clerk
- **Payment**: PayPal
- **UI**: Tailwind CSS + shadcn/ui
- **Deployment**: PM2 + Shell Scripts

### Core Features

- ✅ User Registration/Login (Clerk)
- ✅ Product Display & Categorization
- ✅ Shopping Cart & Order Management
- ✅ Order Status Control (Pending/Paid/Cancelled)
- ✅ PayPal Payment Integration
- ✅ Responsive Design
- ✅ TypeScript Type Safety

### Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
   CLERK_SECRET_KEY=your_secret
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_CLIENT_SECRET=your_secret
   ```

3. **Database Setup**
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### Production Deployment

Use the included deployment script:
```bash
chmod +x deploy.sh
./deploy.sh
```
