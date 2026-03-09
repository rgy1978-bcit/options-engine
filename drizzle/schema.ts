import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Investor goals and preferences
 */
export const investorGoals = mysqlTable("investorGoals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  monthlyIncomeGoal: int("monthlyIncomeGoal").notNull(),
  riskTolerance: mysqlEnum("riskTolerance", ["conservative", "balanced", "aggressive"]).notNull(),
  preferredStrategies: varchar("preferredStrategies", { length: 255 }).notNull(),
  maxCapitalExposure: int("maxCapitalExposure").notNull(),
  timeHorizon: varchar("timeHorizon", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InvestorGoals = typeof investorGoals.$inferSelect;
export type InsertInvestorGoals = typeof investorGoals.$inferInsert;

/**
 * Portfolio holdings from CSV upload
 */
export const portfolioHoldings = mysqlTable("portfolioHoldings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  ticker: varchar("ticker", { length: 10 }).notNull(),
  shares: int("shares").notNull(),
  averageCost: int("averageCost").notNull(),
  currentPrice: int("currentPrice").notNull(),
  purchaseDate: timestamp("purchaseDate"),
  sector: varchar("sector", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PortfolioHoldings = typeof portfolioHoldings.$inferSelect;
export type InsertPortfolioHoldings = typeof portfolioHoldings.$inferInsert;

/**
 * Portfolio cash and available capital
 */
export const portfolioCapital = mysqlTable("portfolioCapital", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  availableCash: int("availableCash").notNull(),
  totalCapital: int("totalCapital").notNull(),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
});

export type PortfolioCapital = typeof portfolioCapital.$inferSelect;
export type InsertPortfolioCapital = typeof portfolioCapital.$inferInsert;

/**
 * Tax loss harvesting opportunities
 */
export const taxHarvestOpportunities = mysqlTable("taxHarvestOpportunities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  ticker: varchar("ticker", { length: 10 }).notNull(),
  unrealizedLoss: int("unrealizedLoss").notNull(),
  estimatedTaxSavings: int("estimatedTaxSavings").notNull(),
  washSaleRisk: boolean("washSaleRisk").default(false),
  lastPurchaseDate: timestamp("lastPurchaseDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TaxHarvestOpportunities = typeof taxHarvestOpportunities.$inferSelect;
export type InsertTaxHarvestOpportunities = typeof taxHarvestOpportunities.$inferInsert;

/**
 * Trade suggestions and opportunities
 */
export const tradeSuggestions = mysqlTable("tradeSuggestions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  ticker: varchar("ticker", { length: 10 }).notNull(),
  strategy: mysqlEnum("strategy", ["covered_call", "cash_secured_put", "bull_call_spread", "bull_put_spread"]).notNull(),
  strikePrice: int("strikePrice").notNull(),
  premium: int("premium").notNull(),
  daysToExpiration: int("daysToExpiration").notNull(),
  delta: varchar("delta", { length: 10 }).notNull(),
  annualizedYield: varchar("annualizedYield", { length: 10 }).notNull(),
  probabilityOfProfit: varchar("probabilityOfProfit", { length: 10 }).notNull(),
  potentialMonthlyIncome: int("potentialMonthlyIncome").notNull(),
  expirationDate: timestamp("expirationDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TradeSuggestions = typeof tradeSuggestions.$inferSelect;
export type InsertTradeSuggestions = typeof tradeSuggestions.$inferInsert;

/**
 * Trade decisions - user acceptance/rejection tracking
 */
export const tradeDecisions = mysqlTable("tradeDecisions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  tradeSuggestionId: int("tradeSuggestionId").references(() => tradeSuggestions.id),
  ticker: varchar("ticker", { length: 10 }).notNull(),
  strategy: varchar("strategy", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["accepted", "rejected", "under_consideration", "executed"]).notNull(),
  executionPrice: int("executionPrice"),
  executionDate: timestamp("executionDate"),
  actualPremium: int("actualPremium"),
  outcome: mysqlEnum("outcome", ["profit", "loss", "breakeven", "pending"]).default("pending"),
  profitLoss: int("profitLoss"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TradeDecisions = typeof tradeDecisions.$inferSelect;
export type InsertTradeDecisions = typeof tradeDecisions.$inferInsert;

/**
 * Daily analytics and performance tracking
 */
export const dailyAnalytics = mysqlTable("dailyAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  totalPortfolioValue: int("totalPortfolioValue").notNull(),
  unrealizedGains: int("unrealizedGains").notNull(),
  realizedGains: int("realizedGains").notNull(),
  estimatedMonthlyIncome: int("estimatedMonthlyIncome").notNull(),
  progressTowardGoal: varchar("progressTowardGoal", { length: 10 }).notNull(),
  portfolioConcentrationRisk: varchar("portfolioConcentrationRisk", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyAnalytics = typeof dailyAnalytics.$inferSelect;
export type InsertDailyAnalytics = typeof dailyAnalytics.$inferInsert;

/**
 * Portfolio Greeks and risk metrics
 */
export const portfolioGreeks = mysqlTable("portfolioGreeks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  delta: varchar("delta", { length: 10 }).notNull(),
  gamma: varchar("gamma", { length: 10 }).notNull(),
  theta: varchar("theta", { length: 10 }).notNull(),
  vega: varchar("vega", { length: 10 }).notNull(),
  rho: varchar("rho", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PortfolioGreeks = typeof portfolioGreeks.$inferSelect;
export type InsertPortfolioGreeks = typeof portfolioGreeks.$inferInsert;
