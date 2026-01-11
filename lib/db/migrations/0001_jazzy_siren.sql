CREATE TABLE `user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ulid` varchar(26) NOT NULL,
	`name` varchar(100),
	`login_id` varchar(255) NOT NULL,
	`password_hash` text NOT NULL,
	`role` varchar(20) NOT NULL DEFAULT 'member',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_login_id_unique` UNIQUE(`login_id`),
	CONSTRAINT `ux_user_ulid` UNIQUE(`ulid`),
	CONSTRAINT `ux_user_login_id` UNIQUE(`login_id`)
);
