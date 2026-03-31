ALTER TABLE `users` ADD `login_attempt` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lock_until` integer DEFAULT 0 NOT NULL;