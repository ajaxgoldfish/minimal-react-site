import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  real,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// 用户表 - 使用经典的单数表名
export const user = sqliteTable('user', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clerkId: text('clerk_id').notNull().unique(),
  name: text('name'),
  age: integer('age'),
});

// 商品表 - 使用经典的单数表名
export const product = sqliteTable('product', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  image: text('image').notNull(),
  category: text('category').notNull(),
  price: real('price').notNull(),
});

// 订单表 - 使用经典的单数表名
export const order = sqliteTable('order', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  status: text('status').default('pending').notNull(),
  amount: real('amount').notNull(),
  currency: text('currency').default('USD').notNull(),
  paypalOrderId: text('paypal_order_id'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
  userId: integer('user_id').references(() => user.id),
  productId: integer('product_id').references(() => product.id),
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