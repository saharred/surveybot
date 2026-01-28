CREATE TABLE `analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`surveyId` int NOT NULL,
	`statisticalData` json,
	`educationalInterpretation` json,
	`overallSummary` text,
	`strengths` json,
	`improvements` json,
	`recommendations` json,
	`presentationUrl` text,
	`presentationPdfUrl` text,
	`reportUrl` text,
	`reportPdfUrl` text,
	`presentationKey` text,
	`presentationPdfKey` text,
	`reportKey` text,
	`reportPdfKey` text,
	`status` enum('processing','completed','failed') NOT NULL DEFAULT 'processing',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `analyses_id` PRIMARY KEY(`id`),
	CONSTRAINT `analyses_surveyId_unique` UNIQUE(`surveyId`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`surveyId` int NOT NULL,
	`questionText` text NOT NULL,
	`questionType` enum('multiple_choice','likert_scale','text','rating') NOT NULL,
	`options` json,
	`isRequired` boolean NOT NULL DEFAULT true,
	`orderIndex` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`surveyId` int NOT NULL,
	`questionId` int NOT NULL,
	`respondentId` varchar(100),
	`answerText` text,
	`answerOption` varchar(255),
	`answerValue` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`schoolName` text NOT NULL,
	`principalName` text NOT NULL,
	`academicDeputyName` text NOT NULL,
	`administrativeDeputyName` text NOT NULL,
	`academicYear` varchar(20) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schools_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `surveys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schoolId` int NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`purpose` text,
	`targetAudience` varchar(100),
	`status` enum('draft','active','closed','analyzed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`closedAt` timestamp,
	CONSTRAINT `surveys_id` PRIMARY KEY(`id`)
);
