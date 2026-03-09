CREATE TABLE `dailyAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`totalPortfolioValue` int NOT NULL,
	`unrealizedGains` int NOT NULL,
	`realizedGains` int NOT NULL,
	`estimatedMonthlyIncome` int NOT NULL,
	`progressTowardGoal` varchar(10) NOT NULL,
	`portfolioConcentrationRisk` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dailyAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investorGoals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`monthlyIncomeGoal` int NOT NULL,
	`riskTolerance` enum('conservative','balanced','aggressive') NOT NULL,
	`preferredStrategies` varchar(255) NOT NULL,
	`maxCapitalExposure` int NOT NULL,
	`timeHorizon` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investorGoals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolioCapital` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`availableCash` int NOT NULL,
	`totalCapital` int NOT NULL,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portfolioCapital_id` PRIMARY KEY(`id`),
	CONSTRAINT `portfolioCapital_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `portfolioGreeks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`delta` varchar(10) NOT NULL,
	`gamma` varchar(10) NOT NULL,
	`theta` varchar(10) NOT NULL,
	`vega` varchar(10) NOT NULL,
	`rho` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portfolioGreeks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolioHoldings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ticker` varchar(10) NOT NULL,
	`shares` int NOT NULL,
	`averageCost` int NOT NULL,
	`currentPrice` int NOT NULL,
	`purchaseDate` timestamp,
	`sector` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portfolioHoldings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taxHarvestOpportunities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ticker` varchar(10) NOT NULL,
	`unrealizedLoss` int NOT NULL,
	`estimatedTaxSavings` int NOT NULL,
	`washSaleRisk` boolean DEFAULT false,
	`lastPurchaseDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `taxHarvestOpportunities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tradeDecisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tradeSuggestionId` int,
	`ticker` varchar(10) NOT NULL,
	`strategy` varchar(64) NOT NULL,
	`status` enum('accepted','rejected','under_consideration','executed') NOT NULL,
	`executionPrice` int,
	`executionDate` timestamp,
	`actualPremium` int,
	`outcome` enum('profit','loss','breakeven','pending') DEFAULT 'pending',
	`profitLoss` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tradeDecisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tradeSuggestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ticker` varchar(10) NOT NULL,
	`strategy` enum('covered_call','cash_secured_put','bull_call_spread','bull_put_spread') NOT NULL,
	`strikePrice` int NOT NULL,
	`premium` int NOT NULL,
	`daysToExpiration` int NOT NULL,
	`delta` varchar(10) NOT NULL,
	`annualizedYield` varchar(10) NOT NULL,
	`probabilityOfProfit` varchar(10) NOT NULL,
	`potentialMonthlyIncome` int NOT NULL,
	`expirationDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tradeSuggestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `dailyAnalytics` ADD CONSTRAINT `dailyAnalytics_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `investorGoals` ADD CONSTRAINT `investorGoals_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portfolioCapital` ADD CONSTRAINT `portfolioCapital_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portfolioGreeks` ADD CONSTRAINT `portfolioGreeks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portfolioHoldings` ADD CONSTRAINT `portfolioHoldings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `taxHarvestOpportunities` ADD CONSTRAINT `taxHarvestOpportunities_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tradeDecisions` ADD CONSTRAINT `tradeDecisions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tradeDecisions` ADD CONSTRAINT `tradeDecisions_tradeSuggestionId_tradeSuggestions_id_fk` FOREIGN KEY (`tradeSuggestionId`) REFERENCES `tradeSuggestions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tradeSuggestions` ADD CONSTRAINT `tradeSuggestions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;