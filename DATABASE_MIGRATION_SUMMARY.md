# 数据库清理和标准化总结

## 问题描述

项目数据库中存在重复的表结构，既有单数形式的表名（`user`, `product`, `order`），也有复数形式的表名（`users`, `products`, `orders`），造成了数据混乱和代码不一致的问题。

## 解决方案

采用了**大众稳健经典的数据库设计方案**：

### 1. 表名标准化
- **选择单数形式**：`user`, `product`, `order`
- **删除复数形式**：`users`, `products`, `orders`
- **理由**：单数表名是数据库设计的经典标准，更符合面向对象的概念

### 2. 字段名标准化
- **采用 snake_case 命名**：`clerk_id`, `paypal_order_id`, `created_at`, `user_id`, `product_id`
- **使用 SQLite 原生类型**：
  - `text` 替代 `varchar`
  - `real` 替代 `decimal`
  - `integer` 时间戳替代 `datetime`

### 3. 数据类型优化
```sql
-- 用户表
CREATE TABLE "user" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "clerk_id" text NOT NULL UNIQUE,
  "name" text,
  "age" integer
);

-- 商品表
CREATE TABLE "product" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "image" text NOT NULL,
  "category" text NOT NULL,
  "price" real NOT NULL
);

-- 订单表
CREATE TABLE "order" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "status" text DEFAULT 'pending' NOT NULL,
  "amount" real NOT NULL,
  "currency" text DEFAULT 'USD' NOT NULL,
  "paypal_order_id" text,
  "created_at" integer DEFAULT (strftime('%s', 'now')) NOT NULL,
  "user_id" integer,
  "product_id" integer,
  FOREIGN KEY ("user_id") REFERENCES "user"("id"),
  FOREIGN KEY ("product_id") REFERENCES "product"("id")
);
```

## 迁移过程

### 1. 更新 Drizzle Schema
- 修改 `src/db/schema.ts` 使用正确的 SQLite 数据类型
- 采用单数表名和 snake_case 字段名
- 保持外键关系完整性

### 2. 数据迁移
- 创建临时清理脚本自动迁移数据
- 从旧表（复数形式）迁移数据到新表（单数形式）
- 安全删除旧表

### 3. 代码更新
更新了所有相关文件：
- `src/app/actions.ts` - 服务器操作
- `src/app/api/payments/paypal/*.ts` - PayPal API 路由
- `src/app/user/page.tsx` - 用户页面
- `src/app/payment/[orderId]/page.tsx` - 支付页面
- `src/app/products/page.tsx` - 商品列表页面
- `src/app/products/[productId]/page.tsx` - 商品详情页面
- `src/hooks/usePurchaseFlow.ts` - 购买流程 Hook
- `src/db/seed.ts` - 数据播种脚本

### 4. Next.js 15 兼容性修复
- 修复 API 路由参数类型（使用 `Promise<{ param: string }>`）
- 修复页面组件参数类型
- 更新组件接口定义

## 最终结果

### ✅ 成功完成
- [x] 数据库表结构统一为单数形式
- [x] 字段名采用 snake_case 标准命名
- [x] 数据类型使用 SQLite 原生支持的类型
- [x] 所有数据成功迁移，无数据丢失
- [x] 代码完全兼容新的数据库结构
- [x] 项目构建成功，无错误和警告（除了一个 img 标签的性能建议）
- [x] Next.js 15 完全兼容

### 📊 数据统计
- **用户表**: 2 条记录
- **商品表**: 7 条记录  
- **订单表**: 96 条记录

### 🏗️ 技术栈
- **数据库**: SQLite
- **ORM**: Drizzle ORM
- **框架**: Next.js 15
- **认证**: Clerk
- **支付**: PayPal

## 最佳实践应用

1. **数据库设计**：遵循单数表名的经典标准
2. **字段命名**：使用 snake_case 提高可读性
3. **数据类型**：使用数据库原生类型确保兼容性
4. **迁移策略**：先迁移数据，再删除旧结构，确保数据安全
5. **代码一致性**：统一更新所有相关代码文件

这次迁移采用了稳健保守的方案，确保了数据完整性和系统稳定性，符合生产环境的最佳实践标准。 