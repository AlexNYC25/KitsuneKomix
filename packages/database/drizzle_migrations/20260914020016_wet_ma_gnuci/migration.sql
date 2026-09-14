CREATE TABLE `comic_series_credits` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comic_series_id` integer NOT NULL,
	`comic_credit_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_series_credits_comic_series_id_comic_series_id_fk` FOREIGN KEY (`comic_series_id`) REFERENCES `comic_series`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comic_series_credits_comic_credit_id_comic_credits_id_fk` FOREIGN KEY (`comic_credit_id`) REFERENCES `comic_credits`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_series_content` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comic_series_id` integer NOT NULL,
	`comic_content_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_series_content_comic_series_id_comic_series_id_fk` FOREIGN KEY (`comic_series_id`) REFERENCES `comic_series`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comic_series_content_comic_content_id_comic_content_id_fk` FOREIGN KEY (`comic_content_id`) REFERENCES `comic_content`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comic_series_story_arcs` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comic_series_id` integer NOT NULL,
	`comic_story_arc_id` integer NOT NULL,
	`position` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_comic_series_story_arcs_comic_series_id_comic_series_id_fk` FOREIGN KEY (`comic_series_id`) REFERENCES `comic_series`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comic_series_story_arcs_comic_story_arc_id_comic_story_arcs_id_fk` FOREIGN KEY (`comic_story_arc_id`) REFERENCES `comic_story_arcs`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
ALTER TABLE `comic_books` RENAME COLUMN `volume` TO `volume_number`;--> statement-breakpoint
ALTER TABLE `comic_books` ADD `alternate_volume_number` text;