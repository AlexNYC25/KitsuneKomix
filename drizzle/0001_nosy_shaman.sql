CREATE TABLE `comic_book_thumbnails` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`file_path` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade
);
