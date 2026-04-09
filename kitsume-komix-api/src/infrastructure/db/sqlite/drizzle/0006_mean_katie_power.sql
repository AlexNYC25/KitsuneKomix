CREATE TABLE `comic_libraries_series` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`library_id` integer NOT NULL,
	`comic_series_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`library_id`) REFERENCES `comic_libraries`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_series_id`) REFERENCES `comic_series`(`id`) ON UPDATE no action ON DELETE cascade
);
