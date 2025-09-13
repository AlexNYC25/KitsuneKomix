CREATE TABLE `comic_series_books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_series_id` integer NOT NULL,
	`comic_book_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_series_id`) REFERENCES `comic_series`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade
);
