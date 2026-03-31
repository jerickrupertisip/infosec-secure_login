ALTER TABLE `users` ADD `reset_token_hash` text;--> statement-breakpoint
ALTER TABLE `users` ADD `reset_token_expires` integer DEFAULT 0 NOT NULL;