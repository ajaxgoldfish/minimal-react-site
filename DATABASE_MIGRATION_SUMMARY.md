# 数据库清理和标准化总结

## 问题描述

项目数据库中存在重复的表结构，既有单数形式的表名（`user`, `product`, `order`），也有复数形式的表名（`users`, `products`, `orders`），造成了数据混乱和代码不一致的问题。

运行时出现错误：`SqliteError: no such column: "clerk_id"`

## 根本原因

数据库schema定义与实际数据库表结构不匹配：
- Schema使用了snake_case命名（`clerk_id`, `user_id`, `product_id`）
- 实际数据库使用的是camelCase命名（`clerkId`, `userId`, `productId`）

## 解决方案

采用了**大众稳健经典的数据库设计方案**，同时保持与现有数据的兼容性：

### 1. 表名标准化
- **选择单数形式**：`user`, `product`, `order`
- **删除复数形式**：`users`, `products`, `orders`
- **理由**：单数表名是数据库设计的经典标准，更符合面向对象的概念

### 2. 列名兼容性处理
- **保持现有列名**：为了避免数据迁移的复杂性，保留了数据库中现有的camelCase列名
- **Schema匹配实际结构**：更新Drizzle schema以匹配实际数据库列名

### 3. 最终数据库结构
```sql
-- 用户表
CREATE TABLE "user" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "clerkId" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "age" INTEGER
);

-- 商品表  
CREATE TABLE "product" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "image" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "price" REAL NOT NULL
);

-- 订单表
CREATE TABLE "order" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "status" TEXT DEFAULT 'pending' NOT NULL,
  "amount" REAL NOT NULL,
  "currency" TEXT DEFAULT 'USD' NOT NULL,
  "paypalOrderId" TEXT,
  "createdAt" INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL,
  "userId" INTEGER,
  "productId" INTEGER,
  FOREIGN KEY ("userId") REFERENCES "user"("id"),
  FOREIGN KEY ("productId") REFERENCES "product"("id")
);
```

## 迁移过程

### 1. 诊断问题
- 发现schema与实际数据库结构不匹配
- 使用临时脚本检查数据库实际列名

### 2. 修复Schema
- 更新 `src/db/schema.ts` 使列名与实际数据库匹配
- 保持单数表名的经典标准
- 使用SQLite原生数据类型

### 3. 数据迁移
- 安全删除了重复的旧表（复数形式）
- 保留了现有数据结构和所有数据
- 无需复杂的数据迁移操作

### 4. 代码验证
- 创建测试脚本验证数据库连接
- 确认所有查询正常工作
- 验证关联查询功能

## 最终结果

### ✅ 成功完成
- [x] 数据库表结构统一为单数形式
- [x] Schema与实际数据库结构完全匹配
- [x] 删除了重复的复数表名
- [x] 所有数据完整保留，无数据丢失
- [x] 数据库连接和查询正常工作
- [x] 关联查询功能正常
- [x] 运行时错误已解决

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

## 关键经验教训

1. **Schema一致性至关重要**：ORM schema必须与实际数据库结构完全匹配
2. **诊断优于假设**：使用工具检查实际数据库结构，而不是猜测
3. **兼容性优于完美**：保持现有列名比强制标准化更实用
4. **测试验证必不可少**：每次修改后都要验证数据库连接和查询

## 稳健方案的优势

这次采用的方案具有以下优势：
- **最小风险**：避免了复杂的数据迁移
- **快速修复**：直接解决了运行时错误
- **向后兼容**：保持了所有现有数据
- **经典标准**：采用了单数表名的最佳实践

这种方法体现了"稳健保守"的工程原则：在解决问题的同时最小化风险和复杂性。 