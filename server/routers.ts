import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as engine from "./portfolioEngine";
import * as marketData from "./marketData";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Portfolio and Goals Management
  portfolio: router({
    // Get or create investor goals
    getGoals: protectedProcedure.query(async ({ ctx }) => {
      const goals = await db.getInvestorGoals(ctx.user.id);
      return goals || null;
    }),

    // Set investor goals
    setGoals: protectedProcedure
      .input(
        z.object({
          monthlyIncomeGoal: z.number().positive(),
          riskTolerance: z.enum(["conservative", "balanced", "aggressive"]),
          preferredStrategies: z.string(),
          maxCapitalExposure: z.number().positive(),
          timeHorizon: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.upsertInvestorGoals(ctx.user.id, input);
        return { success: true };
      }),

    // Get portfolio holdings
    getHoldings: protectedProcedure.query(async ({ ctx }) => {
      return await db.getPortfolioHoldings(ctx.user.id);
    }),

    // Upload portfolio holdings from CSV
    uploadHoldings: protectedProcedure
      .input(
        z.object({
          holdings: z.array(
            z.object({
              ticker: z.string(),
              shares: z.number(),
              averageCost: z.number(),
              currentPrice: z.number(),
              purchaseDate: z.string().optional(),
              sector: z.string().optional(),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        for (const holding of input.holdings) {
          await db.upsertPortfolioHolding(ctx.user.id, {
            ticker: holding.ticker,
            shares: holding.shares,
            averageCost: Math.round(holding.averageCost * 100), // Convert to cents
            currentPrice: Math.round(holding.currentPrice * 100),
            purchaseDate: holding.purchaseDate ? new Date(holding.purchaseDate) : null,
            sector: holding.sector || null,
          });
        }
        return { success: true, count: input.holdings.length };
      }),

    // Get portfolio capital
    getCapital: protectedProcedure.query(async ({ ctx }) => {
      const capital = await db.getPortfolioCapital(ctx.user.id);
      return capital || null;
    }),

    // Update portfolio capital
    updateCapital: protectedProcedure
      .input(
        z.object({
          availableCash: z.number(),
          totalCapital: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.upsertPortfolioCapital(ctx.user.id, {
          availableCash: Math.round(input.availableCash * 100),
          totalCapital: Math.round(input.totalCapital * 100),
        });
        return { success: true };
      }),
  }),

  // Analysis and Scanning
  analysis: router({
    // Analyze portfolio
    analyzePortfolio: protectedProcedure.query(async ({ ctx }) => {
      const holdings = await db.getPortfolioHoldings(ctx.user.id);
      const analysis = engine.analyzePortfolio(holdings);
      return {
        ...analysis,
        totalValue: analysis.totalValue / 100,
        totalCost: analysis.totalCost / 100,
        unrealizedGains: analysis.unrealizedGains / 100,
      };
    }),

    // Scan for tax harvesting opportunities
    scanTaxHarvest: protectedProcedure.query(async ({ ctx }) => {
      const holdings = await db.getPortfolioHoldings(ctx.user.id);
      const opportunities = engine.identifyTaxHarvestOpportunities(holdings);

      // Save to database
      for (const opp of opportunities) {
        await db.upsertTaxHarvestOpportunity(ctx.user.id, {
          ticker: opp.ticker,
          unrealizedLoss: Math.round(opp.unrealizedLoss),
          estimatedTaxSavings: Math.round(opp.estimatedTaxSavings),
          washSaleRisk: opp.washSaleRisk,
          lastPurchaseDate: new Date(),
        });
      }

      return opportunities.map((opp) => ({
        ...opp,
        unrealizedLoss: opp.unrealizedLoss / 100,
        estimatedTaxSavings: opp.estimatedTaxSavings / 100,
        currentPrice: opp.currentPrice / 100,
        averageCost: opp.averageCost / 100,
      }));
    }),

    // Get tax harvest opportunities
    getTaxHarvest: protectedProcedure.query(async ({ ctx }) => {
      const opportunities = await db.getTaxHarvestOpportunities(ctx.user.id);
      return opportunities.map((opp) => ({
        ...opp,
        unrealizedLoss: opp.unrealizedLoss / 100,
        estimatedTaxSavings: opp.estimatedTaxSavings / 100,
      }));
    }),

    // Get portfolio Greeks
    getGreeks: protectedProcedure.query(async ({ ctx }) => {
      return await db.getPortfolioGreeks(ctx.user.id);
    }),

    // Calculate Greeks
    calculateGreeks: protectedProcedure.query(async ({ ctx }) => {
      const holdings = await db.getPortfolioHoldings(ctx.user.id);
      const greeks = engine.calculatePortfolioGreeks(holdings);

      // Save to database
      await db.insertPortfolioGreeks(ctx.user.id, {
        date: new Date(),
        delta: greeks.delta.toString(),
        gamma: greeks.gamma.toString(),
        theta: greeks.theta.toString(),
        vega: greeks.vega.toString(),
        rho: greeks.rho.toString(),
      });

      return greeks;
    }),
  }),

  // Trade Suggestions and Decisions
  trades: router({
    // Get trade suggestions
    getSuggestions: protectedProcedure.query(async ({ ctx }) => {
      const suggestions = await db.getTradeSuggestions(ctx.user.id);
      return suggestions.map((s) => ({
        ...s,
        strikePrice: s.strikePrice / 100,
        premium: s.premium / 100,
        potentialMonthlyIncome: s.potentialMonthlyIncome / 100,
      }));
    }),

    // Create trade suggestion
    createSuggestion: protectedProcedure
      .input(
        z.object({
          ticker: z.string(),
          strategy: z.enum(["covered_call", "cash_secured_put", "bull_call_spread", "bull_put_spread"]),
          strikePrice: z.number(),
          premium: z.number(),
          daysToExpiration: z.number(),
          delta: z.string(),
          annualizedYield: z.string(),
          probabilityOfProfit: z.string(),
          potentialMonthlyIncome: z.number(),
          expirationDate: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.insertTradeSuggestion(ctx.user.id, {
          ticker: input.ticker,
          strategy: input.strategy,
          strikePrice: Math.round(input.strikePrice * 100),
          premium: Math.round(input.premium * 100),
          daysToExpiration: input.daysToExpiration,
          delta: input.delta,
          annualizedYield: input.annualizedYield,
          probabilityOfProfit: input.probabilityOfProfit,
          potentialMonthlyIncome: Math.round(input.potentialMonthlyIncome * 100),
          expirationDate: input.expirationDate ? new Date(input.expirationDate) : null,
        });
        return { success: true };
      }),

    // Get trade decisions
    getDecisions: protectedProcedure.query(async ({ ctx }) => {
      const decisions = await db.getTradeDecisions(ctx.user.id);
      return decisions.map((d) => ({
        ...d,
        executionPrice: d.executionPrice ? d.executionPrice / 100 : undefined,
        actualPremium: d.actualPremium ? d.actualPremium / 100 : undefined,
        profitLoss: d.profitLoss ? d.profitLoss / 100 : undefined,
      }));
    }),

    // Update trade decision
    updateDecision: protectedProcedure
      .input(
        z.object({
          ticker: z.string(),
          strategy: z.string(),
          status: z.enum(["accepted", "rejected", "under_consideration", "executed"]),
          executionPrice: z.number().optional(),
          executionDate: z.string().optional(),
          actualPremium: z.number().optional(),
          outcome: z.enum(["profit", "loss", "breakeven", "pending"]).optional(),
          profitLoss: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.upsertTradeDecision(ctx.user.id, {
          ticker: input.ticker,
          strategy: input.strategy,
          status: input.status,
          tradeSuggestionId: null,
          executionPrice: input.executionPrice ? Math.round(input.executionPrice * 100) : null,
          executionDate: input.executionDate ? new Date(input.executionDate) : null,
          actualPremium: input.actualPremium ? Math.round(input.actualPremium * 100) : null,
          outcome: input.outcome || null,
          profitLoss: input.profitLoss ? Math.round(input.profitLoss * 100) : null,
          notes: input.notes || null,
        });
        return { success: true };
      }),
  }),

  // Market Data & Live Pricing
  market: router({
    // Get live stock quote
    getQuote: publicProcedure
      .input(z.object({ symbol: z.string() }))
      .query(async ({ input }) => {
        const quote = await marketData.getStockQuote(input.symbol);
        return quote || null;
      }),

    // Get multiple stock quotes
    getQuotes: publicProcedure
      .input(z.object({ symbols: z.array(z.string()) }))
      .query(async ({ input }) => {
        return await marketData.getMultipleQuotes(input.symbols);
      }),

    // Get options chain for a symbol
    getOptionsChain: publicProcedure
      .input(z.object({ symbol: z.string(), expirationDate: z.string().optional() }))
      .query(async ({ input }) => {
        const chain = await marketData.getOptionsChain(input.symbol, input.expirationDate);
        return chain || null;
      }),

    // Get implied volatility
    getImpliedVolatility: publicProcedure
      .input(z.object({ symbol: z.string() }))
      .query(async ({ input }) => {
        const iv = await marketData.getImpliedVolatility(input.symbol);
        return iv || 0;
      }),
  }),

  // Broker Connections
  broker: router({
    // Get connected brokers for user
    getConnected: protectedProcedure.query(async ({ ctx }) => {
      // TODO: Implement broker connection retrieval from database
      return [];
    }),

    // Connect a broker account
    connect: protectedProcedure
      .input(
        z.object({
          brokerType: z.enum(["alpaca", "td-ameritrade", "interactive-brokers", "fidelity"]),
          authCode: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement OAuth flow for broker connection
        return { success: true, message: "Broker connection initiated" };
      }),

    // Disconnect a broker account
    disconnect: protectedProcedure
      .input(z.object({ brokerId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement broker disconnection
        return { success: true };
      }),

    // Sync portfolio from connected broker
    syncPortfolio: protectedProcedure
      .input(z.object({ brokerId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // TODO: Implement portfolio sync from broker
        return { success: true, holdingsUpdated: 0 };
      }),
  }),

  // Analytics and Reporting
  analytics: router({
    // Get daily analytics
    getDailyAnalytics: protectedProcedure
      .input(z.object({ days: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        const analytics = await db.getDailyAnalytics(ctx.user.id, input.days);
        return analytics.map((a) => ({
          ...a,
          totalPortfolioValue: a.totalPortfolioValue / 100,
          unrealizedGains: a.unrealizedGains / 100,
          realizedGains: a.realizedGains / 100,
          estimatedMonthlyIncome: a.estimatedMonthlyIncome / 100,
        }));
      }),

    // Record daily analytics
    recordDaily: protectedProcedure
      .input(
        z.object({
          totalPortfolioValue: z.number(),
          unrealizedGains: z.number(),
          realizedGains: z.number(),
          estimatedMonthlyIncome: z.number(),
          progressTowardGoal: z.string(),
          portfolioConcentrationRisk: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.insertDailyAnalytics(ctx.user.id, {
          date: new Date(),
          totalPortfolioValue: Math.round(input.totalPortfolioValue * 100),
          unrealizedGains: Math.round(input.unrealizedGains * 100),
          realizedGains: Math.round(input.realizedGains * 100),
          estimatedMonthlyIncome: Math.round(input.estimatedMonthlyIncome * 100),
          progressTowardGoal: input.progressTowardGoal,
          portfolioConcentrationRisk: input.portfolioConcentrationRisk || null,
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
