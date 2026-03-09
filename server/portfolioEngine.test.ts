import { describe, it, expect } from "vitest";
import {
  analyzePortfolio,
  identifyTaxHarvestOpportunities,
  calculateAnnualizedYield,
  estimateProbabilityOfProfit,
  calculatePotentialMonthlyIncome,
  filterByYield,
  calculatePortfolioGreeks,
  checkAllocationLimits,
  calculateIncomeProgress,
} from "./portfolioEngine";
import { PortfolioHoldings, TradeOpportunity } from "./portfolioEngine";

describe("Portfolio Engine", () => {
  describe("analyzePortfolio", () => {
    it("should calculate portfolio metrics correctly", () => {
      const holdings: PortfolioHoldings[] = [
        {
          id: 1,
          userId: 1,
          ticker: "AAPL",
          shares: 100,
          averageCost: 15000, // $150
          currentPrice: 18000, // $180
          purchaseDate: new Date(),
          sector: "Technology",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          ticker: "MSFT",
          shares: 50,
          averageCost: 30000, // $300
          currentPrice: 32000, // $320
          purchaseDate: new Date(),
          sector: "Technology",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const analysis = analyzePortfolio(holdings);

      expect(analysis.totalValue).toBe(3400000); // (100 * 180 + 50 * 320) * 100
      expect(analysis.totalCost).toBe(3000000); // (100 * 150 + 50 * 300) * 100
      expect(analysis.unrealizedGains).toBe(400000);
      expect(analysis.unrealizedGainsPercent).toBeCloseTo(13.33, 1);
      expect(analysis.concentrationRisk["AAPL"]).toBeCloseTo(52.94, 1);
      expect(analysis.concentrationRisk["MSFT"]).toBeCloseTo(47.06, 1);
      expect(analysis.sectorExposure["Technology"]).toBe(100);
    });

    it("should handle empty portfolio", () => {
      const analysis = analyzePortfolio([]);

      expect(analysis.totalValue).toBe(0);
      expect(analysis.totalCost).toBe(0);
      expect(analysis.unrealizedGains).toBe(0);
      expect(analysis.unrealizedGainsPercent).toBe(0);
    });
  });

  describe("identifyTaxHarvestOpportunities", () => {
    it("should identify positions with 10%+ losses", () => {
      const holdings: PortfolioHoldings[] = [
        {
          id: 1,
          userId: 1,
          ticker: "TSLA",
          shares: 100,
          averageCost: 30000, // $300
          currentPrice: 26000, // $260 (13% loss)
          purchaseDate: new Date(),
          sector: "Technology",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          ticker: "GOOGL",
          shares: 50,
          averageCost: 15000, // $150
          currentPrice: 15500, // $155 (3% gain - not included)
          purchaseDate: new Date(),
          sector: "Technology",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const opportunities = identifyTaxHarvestOpportunities(holdings);

      expect(opportunities).toHaveLength(1);
      expect(opportunities[0].ticker).toBe("TSLA");
      expect(opportunities[0].unrealizedLoss).toBe(400000); // (300-260) * 100
      expect(opportunities[0].estimatedTaxSavings).toBe(100000); // 400000 * 0.25
    });

    it("should flag wash sale risk for recent purchases", () => {
      const holdings: PortfolioHoldings[] = [
        {
          id: 1,
          userId: 1,
          ticker: "AAPL",
          shares: 100,
          averageCost: 20000,
          currentPrice: 17000,
          purchaseDate: new Date(),
          sector: "Technology",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const recentPurchases = new Set(["AAPL"]);
      const opportunities = identifyTaxHarvestOpportunities(holdings, recentPurchases);

      expect(opportunities[0].washSaleRisk).toBe(true);
    });
  });

  describe("calculateAnnualizedYield", () => {
    it("should calculate yield correctly", () => {
      const yield_ = calculateAnnualizedYield(50, 5000, 30); // $0.50 premium, $50 strike, 30 days
      expect(yield_).toBeCloseTo(12.17, 1); // (0.50/50) * (365/30) * 100
    });

    it("should handle zero strike price", () => {
      const yield_ = calculateAnnualizedYield(50, 0, 30);
      expect(yield_).toBe(0);
    });

    it("should handle zero days to expiration", () => {
      const yield_ = calculateAnnualizedYield(50, 5000, 0);
      expect(yield_).toBe(0);
    });
  });

  describe("estimateProbabilityOfProfit", () => {
    it("should calculate POP for covered calls", () => {
      const pop = estimateProbabilityOfProfit(0.30, "covered_call");
      expect(pop).toBe(70); // 1 - 0.30 = 0.70 = 70%
    });

    it("should calculate POP for cash secured puts", () => {
      const pop = estimateProbabilityOfProfit(0.30, "cash_secured_put");
      expect(pop).toBe(30); // delta = 30%
    });

    it("should handle negative delta", () => {
      const pop = estimateProbabilityOfProfit(-0.30, "cash_secured_put");
      expect(pop).toBe(30); // abs(-0.30) = 0.30 = 30%
    });
  });

  describe("calculatePotentialMonthlyIncome", () => {
    it("should calculate monthly income for covered calls", () => {
      const income = calculatePotentialMonthlyIncome(50, 100, "covered_call"); // $0.50 per share, 100 shares
      expect(income).toBe(5000); // 50 * 100
    });

    it("should calculate monthly income for cash secured puts", () => {
      const income = calculatePotentialMonthlyIncome(50, 100, "cash_secured_put");
      expect(income).toBe(5000);
    });
  });

  describe("filterByYield", () => {
    it("should filter opportunities by minimum yield", () => {
      const opportunities: TradeOpportunity[] = [
        {
          ticker: "AAPL",
          strategy: "covered_call",
          strikePrice: 5000,
          premium: 50,
          daysToExpiration: 30,
          delta: 0.30,
          annualizedYield: 12,
          probabilityOfProfit: 70,
          potentialMonthlyIncome: 5000,
        },
        {
          ticker: "MSFT",
          strategy: "covered_call",
          strikePrice: 3000,
          premium: 20,
          daysToExpiration: 30,
          delta: 0.30,
          annualizedYield: 8,
          probabilityOfProfit: 70,
          potentialMonthlyIncome: 2000,
        },
      ];

      const filtered = filterByYield(opportunities, 10);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].ticker).toBe("AAPL");
    });
  });

  describe("calculatePortfolioGreeks", () => {
    it("should calculate portfolio Greeks", () => {
      const holdings: PortfolioHoldings[] = [
        {
          id: 1,
          userId: 1,
          ticker: "AAPL",
          shares: 100,
          averageCost: 15000,
          currentPrice: 18000,
          purchaseDate: new Date(),
          sector: "Technology",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const greeks = calculatePortfolioGreeks(holdings);

      expect(greeks.delta).toBe(10000); // 100 shares * 100
      expect(greeks.gamma).toBeGreaterThanOrEqual(0);
      expect(greeks.theta).toBeLessThanOrEqual(0); // Theta decay
    });
  });

  describe("checkAllocationLimits", () => {
    it("should validate allocation limits", () => {
      const holdings: PortfolioHoldings[] = [
        {
          id: 1,
          userId: 1,
          ticker: "AAPL",
          shares: 100,
          averageCost: 15000,
          currentPrice: 18000,
          purchaseDate: new Date(),
          sector: "Technology",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const trades: TradeOpportunity[] = [
        {
          ticker: "MSFT",
          strategy: "covered_call",
          strikePrice: 5000,
          premium: 50,
          daysToExpiration: 30,
          delta: 0.30,
          annualizedYield: 12,
          probabilityOfProfit: 70,
          potentialMonthlyIncome: 5000,
        },
      ];

      const result = checkAllocationLimits(holdings, trades);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it("should flag violations for excessive exposure", () => {
      const holdings: PortfolioHoldings[] = [
        {
          id: 1,
          userId: 1,
          ticker: "AAPL",
          shares: 100,
          averageCost: 15000,
          currentPrice: 18000,
          purchaseDate: new Date(),
          sector: "Technology",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const trades: TradeOpportunity[] = [
        {
          ticker: "AAPL",
          strategy: "covered_call",
          strikePrice: 5000,
          premium: 50,
          daysToExpiration: 30,
          delta: 0.30,
          annualizedYield: 12,
          probabilityOfProfit: 70,
          potentialMonthlyIncome: 5000,
        },
      ];

      const result = checkAllocationLimits(holdings, trades, 0.05); // 5% max exposure
      expect(result.valid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });
  });

  describe("calculateIncomeProgress", () => {
    it("should calculate progress toward goal", () => {
      const progress = calculateIncomeProgress(3850, 5000);

      expect(progress.progress).toBe(3850);
      expect(progress.remaining).toBe(1150);
      expect(progress.progressPercent).toBeCloseTo(77, 0);
    });

    it("should handle zero goal", () => {
      const progress = calculateIncomeProgress(3850, 0);

      expect(progress.progressPercent).toBe(0);
    });

    it("should cap progress at 100%", () => {
      const progress = calculateIncomeProgress(6000, 5000);

      expect(progress.progressPercent).toBe(100);
      expect(progress.remaining).toBe(0);
    });
  });
});
