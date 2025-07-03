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
  category: text('category').notNull(),
});

// 商品规格表
export const productVariant = sqliteTable('product_variant', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // 规格名称，如 "红色-L码", "128GB-银色"
  price: real('price').notNull(),
  imageData: text('image_data'), // base64编码的图片数据
  imageMimeType: text('image_mime_type'), // 图片MIME类型
  detailImages: text('detail_images'), // 详情图JSON数据
  isDefault: integer('is_default').default(0), // 是否为默认规格 (0=否, 1=是)
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
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
  productVariantId: integer('product_variant_id').references(() => productVariant.id), // 关联商品规格
  // 新增字段
  notes: text('notes'), // 订单动态信息
});

// 定义关系
export const userRelations = relations(user, ({ many }) => ({
  orders: many(order),
}));

export const productRelations = relations(product, ({ many }) => ({
  orders: many(order),
  variants: many(productVariant),
}));

export const productVariantRelations = relations(productVariant, ({ one, many }) => ({
  product: one(product, {
    fields: [productVariant.productId],
    references: [product.id],
  }),
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
  productVariant: one(productVariant, {
    fields: [order.productVariantId],
    references: [productVariant.id],
  }),
}));