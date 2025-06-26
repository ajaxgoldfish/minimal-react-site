/*
 Navicat Premium Dump SQL

 Source Server         : database
 Source Server Type    : SQLite
 Source Server Version : 3045000 (3.45.0)
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3045000 (3.45.0)
 File Encoding         : 65001

 Date: 26/06/2025 13:10:52
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for __drizzle_migrations
-- ----------------------------
DROP TABLE IF EXISTS "__drizzle_migrations";
CREATE TABLE "__drizzle_migrations" (
  "id" SERIAL,
  "hash" text NOT NULL,
  "created_at" numeric,
  PRIMARY KEY ("id")
);

-- ----------------------------
-- Table structure for order
-- ----------------------------
DROP TABLE IF EXISTS "order";
CREATE TABLE "order" (
  "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  "status" varchar(20) NOT NULL DEFAULT ('pending'),
  "amount" decimal NOT NULL,
  "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
  "userId" integer,
  "productId" integer,
  "currency" varchar(3) NOT NULL DEFAULT ('USD'),
  "paypalOrderId" varchar,
  CONSTRAINT "FK_88991860e839c6153a7ec878d39" FOREIGN KEY ("productId") REFERENCES "product" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS "orders";
CREATE TABLE "orders" (
  "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  "status" text NOT NULL DEFAULT 'pending',
  "amount" real NOT NULL,
  "currency" text(3) NOT NULL DEFAULT 'USD',
  "paypal_order_id" text,
  "created_at" integer NOT NULL DEFAULT (strftime('%s', 'now')),
  "user_id" integer,
  "product_id" integer,
  FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- ----------------------------
-- Table structure for product
-- ----------------------------
DROP TABLE IF EXISTS "product";
CREATE TABLE "product" (
  "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" varchar NOT NULL,
  "description" text NOT NULL,
  "image" varchar NOT NULL,
  "category" varchar NOT NULL,
  "price" decimal NOT NULL
);

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS "products";
CREATE TABLE "products" (
  "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "image" text NOT NULL,
  "category" text NOT NULL,
  "price" real NOT NULL
);

-- ----------------------------
-- Table structure for sqlite_sequence
-- ----------------------------
DROP TABLE IF EXISTS "sqlite_sequence";
CREATE TABLE "sqlite_sequence" (
  "name",
  "seq"
);

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS "user";
CREATE TABLE "user" (
  "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  "clerkId" varchar NOT NULL,
  "name" varchar,
  "age" integer,
  CONSTRAINT "UQ_59318cd1fa4b0f8fdea9232d041" UNIQUE ("clerkId" ASC)
);

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "users";
CREATE TABLE "users" (
  "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  "clerk_id" text NOT NULL,
  "name" text,
  "age" integer
);

-- ----------------------------
-- Auto increment value for order
-- ----------------------------
UPDATE "sqlite_sequence" SET seq = 97 WHERE name = 'order';

-- ----------------------------
-- Auto increment value for orders
-- ----------------------------
UPDATE "sqlite_sequence" SET seq = 1 WHERE name = 'orders';

-- ----------------------------
-- Auto increment value for product
-- ----------------------------
UPDATE "sqlite_sequence" SET seq = 7 WHERE name = 'product';

-- ----------------------------
-- Auto increment value for products
-- ----------------------------
UPDATE "sqlite_sequence" SET seq = 4 WHERE name = 'products';

-- ----------------------------
-- Auto increment value for user
-- ----------------------------
UPDATE "sqlite_sequence" SET seq = 2 WHERE name = 'user';

-- ----------------------------
-- Auto increment value for users
-- ----------------------------
UPDATE "sqlite_sequence" SET seq = 1 WHERE name = 'users';

-- ----------------------------
-- Indexes structure for table users
-- ----------------------------
CREATE UNIQUE INDEX "users_clerk_id_unique"
ON "users" (
  "clerk_id" ASC
);

PRAGMA foreign_keys = true;
