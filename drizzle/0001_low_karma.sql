CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classPK` varchar(255) NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`section` varchar(100),
	`date` varchar(50),
	`summary` text,
	`fullText` text,
	`fetchedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_classPK_unique` UNIQUE(`classPK`)
);
