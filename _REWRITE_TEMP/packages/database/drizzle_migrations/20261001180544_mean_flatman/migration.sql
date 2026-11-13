CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`display_name` text,
	`is_admin` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` integer NOT NULL,
	`token` text NOT NULL UNIQUE,
	`expires_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` integer NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_comic_libraries` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` integer NOT NULL,
	`library_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_user_comic_libraries_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_user_comic_libraries_library_id_comic_libraries_id_fk` FOREIGN KEY (`library_id`) REFERENCES `comic_libraries`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_user_comic_libraries`(`id`, `user_id`, `library_id`, `created_at`, `updated_at`) SELECT `id`, `user_id`, `library_id`, `created_at`, `updated_at` FROM `user_comic_libraries`;--> statement-breakpoint
DROP TABLE `user_comic_libraries`;--> statement-breakpoint
ALTER TABLE `__new_user_comic_libraries` RENAME TO `user_comic_libraries`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_comic_book_thumbnails` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comic_book_id` integer NOT NULL,
	`comic_book_cover_id` integer,
	`file_path` text NOT NULL,
	`thumbnail_type` text DEFAULT 'generated' NOT NULL,
	`name` text,
	`description` text,
	`uploaded_by` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_book_thumbnails_comic_book_id_comic_books_id_fk` FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comic_book_thumbnails_comic_book_cover_id_comic_book_covers_id_fk` FOREIGN KEY (`comic_book_cover_id`) REFERENCES `comic_book_covers`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comic_book_thumbnails_uploaded_by_user_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `user`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
INSERT INTO `__new_comic_book_thumbnails`(`id`, `comic_book_id`, `comic_book_cover_id`, `file_path`, `thumbnail_type`, `name`, `description`, `uploaded_by`, `created_at`, `updated_at`) SELECT `id`, `comic_book_id`, `comic_book_cover_id`, `file_path`, `thumbnail_type`, `name`, `description`, `uploaded_by`, `created_at`, `updated_at` FROM `comic_book_thumbnails`;--> statement-breakpoint
DROP TABLE `comic_book_thumbnails`;--> statement-breakpoint
ALTER TABLE `__new_comic_book_thumbnails` RENAME TO `comic_book_thumbnails`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_comic_book_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` integer NOT NULL,
	`comic_book_id` integer NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`last_read_page` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_book_history_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comic_book_history_comic_book_id_comic_books_id_fk` FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_comic_book_history`(`id`, `user_id`, `comic_book_id`, `read`, `last_read_page`, `created_at`, `updated_at`) SELECT `id`, `user_id`, `comic_book_id`, `read`, `last_read_page`, `created_at`, `updated_at` FROM `comic_book_history`;--> statement-breakpoint
DROP TABLE `comic_book_history`;--> statement-breakpoint
ALTER TABLE `__new_comic_book_history` RENAME TO `comic_book_history`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX IF EXISTS `sessions_user_id_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `sessions_client_id_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `refresh_tokens_user_id_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `refresh_tokens_session_id_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `refresh_tokens_expires_at_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `api_keys_user_id_idx`;--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
DROP TABLE `api_keys`;--> statement-breakpoint
DROP TABLE `refresh_tokens`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
DROP TABLE `oauth_clients`;--> statement-breakpoint
DROP TABLE `users`;