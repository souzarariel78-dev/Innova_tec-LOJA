CREATE TABLE `seller_product_overrides` (
	`id` varchar(160) NOT NULL,
	`ownerOpenId` varchar(64) NOT NULL,
	`productId` varchar(128) NOT NULL,
	`description` text,
	`imageUri` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seller_product_overrides_id` PRIMARY KEY(`id`),
	CONSTRAINT `seller_owner_product_unique` UNIQUE(`ownerOpenId`,`productId`)
);
