CREATE TYPE "public"."outcome" AS ENUM('profit', 'loss', 'breakeven', 'pending');--> statement-breakpoint
CREATE TYPE "public"."riskTolerance" AS ENUM('conservative', 'balanced', 'aggressive');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('accepted', 'rejected', 'under_consideration', 'executed');--> statement-breakpoint
CREATE TYPE "public"."strategy" AS ENUM('covered_call', 'cash_secured_put', 'bull_call_spread', 'bull_put_spread');--> statement-breakpoint
CREATE TABLE "dailyAnalytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"date" timestamp NOT NULL,
	"totalPortfolioValue" integer NOT NULL,
	"unrealizedGains" integer NOT NULL,
	"realizedGains" integer NOT NULL,
	"estimatedMonthlyIncome" integer NOT NULL,
	"progressTowardGoal" varchar(10) NOT NULL,
	"portfolioConcentrationRisk" varchar(10),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investorGoals" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"monthlyIncomeGoal" integer NOT NULL,
	"riskTolerance" "riskTolerance" NOT NULL,
	"preferredStrategies" varchar(255) NOT NULL,
	"maxCapitalExposure" integer NOT NULL,
	"timeHorizon" varchar(64) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolioCapital" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"availableCash" integer NOT NULL,
	"totalCapital" integer NOT NULL,
	"lastUpdated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "portfolioCapital_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "portfolioGreeks" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"date" timestamp NOT NULL,
	"delta" varchar(10) NOT NULL,
	"gamma" varchar(10) NOT NULL,
	"theta" varchar(10) NOT NULL,
	"vega" varchar(10) NOT NULL,
	"rho" varchar(10) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolioHoldings" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"ticker" varchar(10) NOT NULL,
	"shares" integer NOT NULL,
	"averageCost" integer NOT NULL,
	"currentPrice" integer NOT NULL,
	"purchaseDate" timestamp,
	"sector" varchar(64),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taxHarvestOpportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"ticker" varchar(10) NOT NULL,
	"unrealizedLoss" integer NOT NULL,
	"estimatedTaxSavings" integer NOT NULL,
	"washSaleRisk" boolean DEFAULT false,
	"lastPurchaseDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tradeDecisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"tradeSuggestionId" integer,
	"ticker" varchar(10) NOT NULL,
	"strategy" varchar(64) NOT NULL,
	"status" "status" NOT NULL,
	"executionPrice" integer,
	"executionDate" timestamp,
	"actualPremium" integer,
	"outcome" "outcome" DEFAULT 'pending',
	"profitLoss" integer,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tradeSuggestions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"ticker" varchar(10) NOT NULL,
	"strategy" "strategy" NOT NULL,
	"strikePrice" integer NOT NULL,
	"premium" integer NOT NULL,
	"daysToExpiration" integer NOT NULL,
	"delta" varchar(10) NOT NULL,
	"annualizedYield" varchar(10) NOT NULL,
	"probabilityOfProfit" varchar(10) NOT NULL,
	"potentialMonthlyIncome" integer NOT NULL,
	"expirationDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
ALTER TABLE "dailyAnalytics" ADD CONSTRAINT "dailyAnalytics_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investorGoals" ADD CONSTRAINT "investorGoals_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolioCapital" ADD CONSTRAINT "portfolioCapital_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolioGreeks" ADD CONSTRAINT "portfolioGreeks_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolioHoldings" ADD CONSTRAINT "portfolioHoldings_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taxHarvestOpportunities" ADD CONSTRAINT "taxHarvestOpportunities_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tradeDecisions" ADD CONSTRAINT "tradeDecisions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tradeDecisions" ADD CONSTRAINT "tradeDecisions_tradeSuggestionId_tradeSuggestions_id_fk" FOREIGN KEY ("tradeSuggestionId") REFERENCES "public"."tradeSuggestions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tradeSuggestions" ADD CONSTRAINT "tradeSuggestions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;