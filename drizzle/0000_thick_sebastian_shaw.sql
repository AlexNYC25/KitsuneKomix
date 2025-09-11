CREATE TABLE `app_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`admin_only` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_settings_key_unique` ON `app_settings` (`key`);--> statement-breakpoint
CREATE TABLE `comic_book_characters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`comic_character_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_character_id`) REFERENCES `comic_characters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comic_book_colorists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`comic_colorist_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_colorist_id`) REFERENCES `comic_colorists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comic_book_cover_artists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`comic_cover_artist_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_cover_artist_id`) REFERENCES `comic_cover_artists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comic_book_covers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`file_path` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comic_book_editors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`comic_editor_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_editor_id`) REFERENCES `comic_editors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comic_book_genres` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`comic_genre_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_genre_id`) REFERENCES `comic_genres`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comic_book_imprints` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`comic_imprint_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_imprint_id`) REFERENCES `comic_imprints`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comic_book_inkers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`comic_inker_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_inker_id`) REFERENCES `comic_inkers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comic_book_letterers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`comic_letterer_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_letterer_id`) REFERENCES `comic_letterers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comic_book_locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`comic_location_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_location_id`) REFERENCES `comic_locations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comic_book_pencillers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`comic_penciller_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_penciller_id`) REFERENCES `comic_pencillers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comic_book_publishers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`comic_publisher_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_publisher_id`) REFERENCES `comic_publishers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comic_book_series_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`comic_series_group_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_series_group_id`) REFERENCES `comic_series_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comic_book_story_arcs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`comic_story_arc_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_story_arc_id`) REFERENCES `comic_story_arcs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comic_book_teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`comic_team_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_team_id`) REFERENCES `comic_teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comic_book_writers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`comic_writer_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_writer_id`) REFERENCES `comic_writers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comic_books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`library_id` integer NOT NULL,
	`file_path` text NOT NULL,
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
	`languge` text,
	`format` text,
	`black_and_white` integer,
	`manga` integer,
	`reading_direction` text,
	`review` text,
	`age_rating` text,
	`community_rating` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`library_id`) REFERENCES `comic_libraries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comic_characters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comic_characters_name_unique` ON `comic_characters` (`name`);--> statement-breakpoint
CREATE TABLE `comic_colorists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comic_colorists_name_unique` ON `comic_colorists` (`name`);--> statement-breakpoint
CREATE TABLE `comic_cover_artists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comic_cover_artists_name_unique` ON `comic_cover_artists` (`name`);--> statement-breakpoint
CREATE TABLE `comic_editors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comic_editors_name_unique` ON `comic_editors` (`name`);--> statement-breakpoint
CREATE TABLE `comic_genres` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comic_genres_name_unique` ON `comic_genres` (`name`);--> statement-breakpoint
CREATE TABLE `comic_imprints` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comic_imprints_name_unique` ON `comic_imprints` (`name`);--> statement-breakpoint
CREATE TABLE `comic_inkers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comic_inkers_name_unique` ON `comic_inkers` (`name`);--> statement-breakpoint
CREATE TABLE `comic_letterers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comic_letterers_name_unique` ON `comic_letterers` (`name`);--> statement-breakpoint
CREATE TABLE `comic_libraries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`path` text NOT NULL,
	`description` text,
	`enabled` integer DEFAULT 1 NOT NULL,
	`changed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comic_locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comic_locations_name_unique` ON `comic_locations` (`name`);--> statement-breakpoint
CREATE TABLE `comic_pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`file_path` text NOT NULL,
	`page_number` integer NOT NULL,
	`hash` text NOT NULL,
	`file_size` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `comic_pencillers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comic_pencillers_name_unique` ON `comic_pencillers` (`name`);--> statement-breakpoint
CREATE TABLE `comic_publishers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comic_publishers_name_unique` ON `comic_publishers` (`name`);--> statement-breakpoint
CREATE TABLE `comic_series_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comic_series_groups_name_unique` ON `comic_series_groups` (`name`);--> statement-breakpoint
CREATE TABLE `comic_series` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`folder_path` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comic_series_folder_path_unique` ON `comic_series` (`folder_path`);--> statement-breakpoint
CREATE TABLE `comic_story_arcs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comic_story_arcs_name_unique` ON `comic_story_arcs` (`name`);--> statement-breakpoint
CREATE TABLE `comic_teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comic_teams_name_unique` ON `comic_teams` (`name`);--> statement-breakpoint
CREATE TABLE `comic_web_links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`url` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comic_web_links_url_unique` ON `comic_web_links` (`url`);--> statement-breakpoint
CREATE TABLE `comic_writers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comic_writers_name_unique` ON `comic_writers` (`name`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`password_hash` text NOT NULL,
	`admin` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);