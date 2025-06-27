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
  image: text('image'), // 保留原有的URL字段，用于向后兼容
  imageData: text('imageData'), // 新增：存储base64编码的图片数据
  imageMimeType: text('imageMimeType'), // 新增：存储图片MIME类型 (image/jpeg, image/png等)
  detailImages: text('detailImages'), // 新增：存储商品详情图的JSON数据，格式为 [{imageData: string, imageMimeType: string}]
  category: text('category').notNull(),
  price: real('price').notNull(),
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
  shippingStatus: text('shippingStatus').default('not_shipped').notNull(), // 发货状态：not_shipped, shipped
  shippingInfo: text('shippingInfo'), // 发货信息
  refundStatus: text('refundStatus').default('normal').notNull(), // 退款状态：normal, pending, approved, rejected
  refundRequestInfo: text('refundRequestInfo'), // 申请退货信息
  notes: text('notes'), // 备注信息
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