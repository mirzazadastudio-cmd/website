CREATE TABLE `studio_actions` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `studio_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`checksum` text NOT NULL,
	`src` text NOT NULL,
	`original_key` text NOT NULL,
	`metadata` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `studio_assets_checksum_unique` ON `studio_assets` (`checksum`);--> statement-breakpoint
CREATE UNIQUE INDEX `studio_assets_src_unique` ON `studio_assets` (`src`);--> statement-breakpoint
CREATE TABLE `studio_inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text NOT NULL,
	`project_type` text NOT NULL,
	`deadline` text NOT NULL,
	`message` text NOT NULL,
	`attribution` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`notification` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `studio_revisions` (
	`revision` integer PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`created_at` text NOT NULL
);
