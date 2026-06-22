PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_comic_series` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`folder_path` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_comic_series`("id", "name", "description", "folder_path", "created_at", "updated_at") SELECT "id", "name", "description", "folder_path", "created_at", "updated_at" FROM `comic_series`;--> statement-breakpoint
DROP TABLE `comic_series`;--> statement-breakpoint
ALTER TABLE `__new_comic_series` RENAME TO `comic_series`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `comic_series_folder_path_unique` ON `comic_series` (`folder_path`);