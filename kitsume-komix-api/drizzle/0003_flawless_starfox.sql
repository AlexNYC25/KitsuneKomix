PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_comic_book_thumbnails` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comic_book_id` integer NOT NULL,
	`comic_book_cover_id` integer,
	`file_path` text NOT NULL,
	`thumbnail_type` text DEFAULT 'generated' NOT NULL,
	`name` text,
	`description` text,
	`uploaded_by` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`comic_book_id`) REFERENCES `comic_books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`comic_book_cover_id`) REFERENCES `comic_book_covers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_comic_book_thumbnails`("id", "comic_book_id", "comic_book_cover_id", "file_path", "thumbnail_type", "created_at", "updated_at") 
SELECT 
    t."id", 
    p."comic_book_id",
    t."comic_book_cover_id", 
    t."file_path", 
    'generated' as "thumbnail_type",
    t."created_at", 
    t."updated_at" 
FROM `comic_book_thumbnails` t
JOIN `comic_book_covers` c ON t.comic_book_cover_id = c.id
JOIN `comic_pages` p ON c.comic_page_id = p.id;--> statement-breakpoint
DROP TABLE `comic_book_thumbnails`;--> statement-breakpoint
ALTER TABLE `__new_comic_book_thumbnails` RENAME TO `comic_book_thumbnails`;--> statement-breakpoint
PRAGMA foreign_keys=ON;