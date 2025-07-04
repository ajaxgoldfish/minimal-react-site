import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  real,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// 用户表 - 使用经典的单数表名，但保持现有的列名
export const user = sqliteTable('user', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clerkId: text('clerkId').notNull().unique(),
  name: text('name'),
  age: integer('age'),
  role: text('role').default('customer').notNull(),
  email: text('email'), // 用户邮箱
});

// 商品表 - 使用经典的单数表名
export const product = sqliteTable('product', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: real('price').notNull(),
  image: text('image'), // JSON格式存储图片数据: {"main":"base64...", "details":["base64..."]}
  category: text('category').notNull(),
});

// 订单表 - 使用经典的单数表名，但保持现有的列名
export const order = sqliteTable('order', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  status: text('status').default('pending').notNull(),
  amount: real('amount').notNull(),
  currency: text('currency').default('USD').notNull(),
  paypalOrderId: text('paypalOrderId'),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
  userId: integer('userId').references(() => user.id),
  productId: integer('productId').references(() => product.id),
  // 新增字段
  notes: text('notes'), // 订单动态信息
});

// 定义关系
export const userRelations = relations(user, ({ many }) => ({
  orders: many(order),
}));

export const productRelations = relations(product, ({ many }) => ({
  orders: many(order),
}));

export const orderRelations = relations(order, ({ one }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  product: one(product, {
    fields: [order.productId],
    references: [product.id],
  }),
}));