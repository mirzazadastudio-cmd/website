CREATE TABLE `studio_account` (
	`id` integer PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`salt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `studio_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`reset_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `studio_content` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `studio_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);
