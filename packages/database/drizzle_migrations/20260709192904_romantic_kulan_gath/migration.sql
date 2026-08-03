CREATE TABLE `app_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`key` text NOT NULL UNIQUE,
	`value` text NOT NULL,
	`admin_only` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`username` text NOT NULL UNIQUE,
	`email` text NOT NULL UNIQUE,
	`firstName` text,
	`lastName` text,
	`passwordHash` text NOT NULL,
	`admin` integer DEFAULT false NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`userId` integer NOT NULL,
	`tokenId` text NOT NULL UNIQUE,
	`expiresAt` text NOT NULL,
	`revoked` integer DEFAULT 0 NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_refresh_tokens_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_libraries` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`path` text NOT NULL UNIQUE,
	`description` text,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_comic_libraries` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` integer NOT NULL,
	`library_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_user_comic_libraries_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_user_comic_libraries_library_id_comic_libraries_id_fk` FOREIGN KEY (`library_id`) REFERENCES `comic_libraries`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_series` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`description` text,
	`folderPath` text NOT NULL UNIQUE,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comic_libraries_series` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`library_id` integer NOT NULL,
	`comic_series_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_libraries_series_library_id_comic_libraries_id_fk` FOREIGN KEY (`library_id`) REFERENCES `comic_libraries`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comic_libraries_series_comic_series_id_comic_series_id_fk` FOREIGN KEY (`comic_series_id`) REFERENCES `comic_series`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_books` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`library_id` integer NOT NULL,
	`file_path` text NOT NULL UNIQUE,
	`hash` text NOT NULL,
	`title` text,
	`series` text,
	`issue_number` text,
	`count` integer,
	`volume` text,
	`alternate_series` text,
	`alternate_issue_number` text,
	`alternate_count` integer,
	`page_count` integer,
	`file_size` integer,
	`summary` text,
	`notes` text,
	`year` integer,
	`month` integer,
	`day` integer,
	`publisher` text,
	`publication_date` text,
	`scan_info` text,
	`language` text,
	`format` text,
	`black_and_white` integer DEFAULT true NOT NULL,
	`manga` integer DEFAULT true NOT NULL,
	`reading_direction` text,
	`review` text,
	`age_rating` text,
	`community_rating` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_books_library_id_comic_libraries_id_fk` FOREIGN KEY (`library_id`) REFERENCES `comic_libraries`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_series_books` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comic_series_id` integer NOT NULL,
	`comic_book_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_series_books_comic_series_id_comic_series_id_fk` FOREIGN KEY (`comic_series_id`) REFERENCES `comic_series`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comic_series_books_comic_book_id_comic_books_id_fk` FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comicBookId` integer NOT NULL,
	`filePath` text NOT NULL,
	`pageNumber` integer NOT NULL,
	`type` text NOT NULL,
	`doublePage` integer DEFAULT 0 NOT NULL,
	`length` integer,
	`width` integer,
	`hash` text NOT NULL,
	`fileSize` integer NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_pages_comicBookId_comic_books_id_fk` FOREIGN KEY (`comicBookId`) REFERENCES `comic_books`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_book_covers` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comic_page_id` integer NOT NULL,
	`file_path` text NOT NULL UNIQUE,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_book_covers_comic_page_id_comic_pages_id_fk` FOREIGN KEY (`comic_page_id`) REFERENCES `comic_pages`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_book_thumbnails` (
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
	CONSTRAINT `fk_comic_book_thumbnails_uploaded_by_users_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `comic_book_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` integer NOT NULL,
	`comic_book_id` integer NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`last_read_page` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_book_history_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comic_book_history_comic_book_id_comic_books_id_fk` FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_content` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL UNIQUE,
	`description` text,
	`type` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comic_credits` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL UNIQUE,
	`description` text,
	`role` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comic_book_content` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comic_book_id` integer NOT NULL,
	`comic_content_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_book_content_comic_book_id_comic_books_id_fk` FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comic_book_content_comic_content_id_comic_content_id_fk` FOREIGN KEY (`comic_content_id`) REFERENCES `comic_content`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_book_credits` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comic_book_id` integer NOT NULL,
	`comic_credit_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_book_credits_comic_book_id_comic_books_id_fk` FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comic_book_credits_comic_credit_id_comic_credits_id_fk` FOREIGN KEY (`comic_credit_id`) REFERENCES `comic_credits`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_genres` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL UNIQUE,
	`description` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comic_publishers` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL UNIQUE,
	`description` text,
	`imprint` integer DEFAULT false NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comic_series_genres` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comic_series_id` integer NOT NULL,
	`comic_genre_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_series_genres_comic_series_id_comic_series_id_fk` FOREIGN KEY (`comic_series_id`) REFERENCES `comic_series`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comic_series_genres_comic_genre_id_comic_genres_id_fk` FOREIGN KEY (`comic_genre_id`) REFERENCES `comic_genres`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_series_publishers` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comic_series_id` integer NOT NULL,
	`comic_publisher_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_series_publishers_comic_series_id_comic_series_id_fk` FOREIGN KEY (`comic_series_id`) REFERENCES `comic_series`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comic_series_publishers_comic_publisher_id_comic_publishers_id_fk` FOREIGN KEY (`comic_publisher_id`) REFERENCES `comic_publishers`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_book_genres` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comic_book_id` integer NOT NULL,
	`comic_genre_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_book_genres_comic_book_id_comic_books_id_fk` FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comic_book_genres_comic_genre_id_comic_genres_id_fk` FOREIGN KEY (`comic_genre_id`) REFERENCES `comic_genres`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_book_publishers` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comic_book_id` integer NOT NULL,
	`comic_publisher_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_book_publishers_comic_book_id_comic_books_id_fk` FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comic_book_publishers_comic_publisher_id_comic_publishers_id_fk` FOREIGN KEY (`comic_publisher_id`) REFERENCES `comic_publishers`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_series_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL UNIQUE,
	`description` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comic_story_arcs` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL UNIQUE,
	`description` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comic_book_series_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comic_book_id` integer NOT NULL,
	`comic_series_group_id` integer NOT NULL,
	`position` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_book_series_groups_comic_book_id_comic_books_id_fk` FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comic_book_series_groups_comic_series_group_id_comic_series_groups_id_fk` FOREIGN KEY (`comic_series_group_id`) REFERENCES `comic_series_groups`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_book_story_arcs` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comic_book_id` integer NOT NULL,
	`comic_story_arc_id` integer NOT NULL,
	`position` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_book_story_arcs_comic_book_id_comic_books_id_fk` FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comic_book_story_arcs_comic_story_arc_id_comic_story_arcs_id_fk` FOREIGN KEY (`comic_story_arc_id`) REFERENCES `comic_story_arcs`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_series_series_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comic_series_id` integer NOT NULL,
	`comic_series_group_id` integer NOT NULL,
	`position` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_series_series_groups_comic_series_id_comic_series_id_fk` FOREIGN KEY (`comic_series_id`) REFERENCES `comic_series`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comic_series_series_groups_comic_series_group_id_comic_series_groups_id_fk` FOREIGN KEY (`comic_series_group_id`) REFERENCES `comic_series_groups`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_web_links` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comicBookId` integer NOT NULL,
	`url` text NOT NULL UNIQUE,
	`description` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_web_links_comicBookId_comic_books_id_fk` FOREIGN KEY (`comicBookId`) REFERENCES `comic_books`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_book_ingestion` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comic_book_id` integer NOT NULL,
	`metadata` text,
	`state` text,
	`error_message` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_book_ingestion_comic_book_id_comic_books_id_fk` FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_metadata_candidates` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comicBookId` integer NOT NULL,
	`type` text NOT NULL,
	`value` text NOT NULL,
	`normalizedValue` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`resolvedId` integer,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_metadata_candidates_comicBookId_comic_books_id_fk` FOREIGN KEY (`comicBookId`) REFERENCES `comic_books`(`id`) ON DELETE CASCADE
);
