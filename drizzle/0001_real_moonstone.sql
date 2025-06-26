CREATE TABLE `order` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`paypal_order_id` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`user_id` integer,
	`product_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`image` text NOT NULL,
	`category` text NOT NULL,
	`price` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clerk_id` text NOT NULL,
	`name` text,
	`age` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_clerk_id_unique` ON `user` (`clerk_id`);--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
DROP TABLE `users`;