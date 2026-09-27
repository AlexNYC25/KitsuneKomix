CREATE TABLE `oauth_clients` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`client_id` text NOT NULL UNIQUE,
	`client_secret_hash` text,
	`client_name` text NOT NULL,
	`client_type` text DEFAULT 'public' NOT NULL,
	`description` text,
	`allowed_grant_types` text DEFAULT 'password,refresh_token' NOT NULL,
	`redirect_uris` text,
	`scopes` text DEFAULT 'read' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`session_id` text NOT NULL UNIQUE,
	`user_id` integer NOT NULL,
	`client_id` integer NOT NULL,
	`device_name` text,
	`user_agent` text,
	`ip_address` text,
	`status` text DEFAULT 'active' NOT NULL,
	`last_activity_at` text,
	`expires_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_sessions_client_id_oauth_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `oauth_clients`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` integer NOT NULL,
	`client_id` integer,
	`name` text NOT NULL,
	`token_hash` text NOT NULL UNIQUE,
	`scopes` text DEFAULT 'read' NOT NULL,
	`expires_at` text,
	`last_used_at` text,
	`revoked_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_api_keys_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_api_keys_client_id_oauth_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `oauth_clients`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN `firstName` TO `first_name`;--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN `lastName` TO `last_name`;--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN `passwordHash` TO `password_hash`;--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN `admin` TO `is_admin`;--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN `createdAt` TO `created_at`;--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN `updatedAt` TO `updated_at`;--> statement-breakpoint
ALTER TABLE `users` ADD `display_name` text;--> statement-breakpoint
ALTER TABLE `users` ADD `avatar_url` text;--> statement-breakpoint
ALTER TABLE `users` ADD `password_changed_at` text;--> statement-breakpoint
ALTER TABLE `users` ADD `status` text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `failed_login_attempts` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `locked_until` text;--> statement-breakpoint
ALTER TABLE `users` ADD `last_login_at` text;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD `session_id` integer NOT NULL REFERENCES sessions(id) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD `user_id` integer NOT NULL REFERENCES users(id) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD `client_id` integer NOT NULL REFERENCES oauth_clients(id) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD `token_hash` text NOT NULL;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD `family_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD `replaced_by_token_id` text;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD `expires_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD `revoked_at` text;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD `last_used_at` text;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_refresh_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`session_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`client_id` integer NOT NULL,
	`token_hash` text NOT NULL UNIQUE,
	`family_id` text NOT NULL,
	`replaced_by_token_id` text,
	`expires_at` text NOT NULL,
	`revoked_at` text,
	`last_used_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_refresh_tokens_session_id_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_refresh_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_refresh_tokens_client_id_oauth_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `oauth_clients`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_refresh_tokens`(`id`) SELECT `id` FROM `refresh_tokens`;--> statement-breakpoint
DROP TABLE `refresh_tokens`;--> statement-breakpoint
ALTER TABLE `__new_refresh_tokens` RENAME TO `refresh_tokens`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `refresh_tokens_user_id_idx` ON `refresh_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `refresh_tokens_session_id_idx` ON `refresh_tokens` (`session_id`);--> statement-breakpoint
CREATE INDEX `refresh_tokens_expires_at_idx` ON `refresh_tokens` (`expires_at`);--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_client_id_idx` ON `sessions` (`client_id`);--> statement-breakpoint
CREATE INDEX `api_keys_user_id_idx` ON `api_keys` (`user_id`);