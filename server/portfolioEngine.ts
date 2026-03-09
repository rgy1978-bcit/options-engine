import { PortfolioHoldings, InvestorGoals } from "../drizzle/schema";

/**
 * Portfolio Analysis Engine
 * Handles calculations for portfolio metrics, tax optimization, yield filtering, and risk analysis
 */

export interface PortfolioAnalysis {
  totalValue: number;
  totalCost: number;
  unrealizedGains: number;
  unrealizedGainsPercent: number;
  concentrationRisk: Record<string, number>;
  sectorExposure: Record<string, number>;
}

export interface TaxHarvestOpportunity {
  ticker: string;
  shares: number;
  currentPrice: number;
  averageCost: number;
  unrealizedLoss: number;
  estimatedTaxSavings: number;
  washSaleRisk: boolean;
}

export interface TradeOpportunity {
  ticker: string;
  strategy: "covered_call" | "cash_secured_put" | "bull_call_spread" | "bull_put_spread";
  strikePrice: number;
  premium: number;
  daysToExpiration: number;
  delta: number;
  annualizedYield: number;
  probabilityOfProfit: number;
  potentialMonthlyIncome: number;
}

export interface PortfolioMetrics {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

/**
 * Analyze portfolio holdings and calculate key metrics
 */
export function analyzePortfolio(holdings: PortfolioHoldings[]): PortfolioAnalysis {
  let totalValue = 0;
  let totalCost = 0;
  const concentrationRisk: Record<string, number> = {};
  const sectorExposure: Record<string, number> = {};

  for (const holding of holdings) {
    const currentValue = holding.shares * holding.currentPrice;
    const costBasis = holding.shares * holding.averageCost;

    totalValue += currentValue;
    totalCost += costBasis;

    // Concentration risk (% of portfolio)
    concentrationRisk[holding.ticker] = currentValue;

    // Sector exposure
    if (holding.sector) {
      sectorExposure[holding.sector] = (sectorExposure[holding.sector] || 0) + currentValue;
    }
  }

  // Convert concentration risk to percentages
  const concentrationPercent: Record<string, number> = {};
  for (const ticker in concentrationRisk) {
    concentrationPercent[ticker] = totalValue > 0 ? (concentrationRisk[ticker] / totalValue) * 100 : 0;
  }

  // Convert sector exposure to percentages
  const sectorPercent: Record<string, number> = {};
  for (const sector in sectorExposure) {
    sectorPercent[sector] = totalValue > 0 ? (sectorExposure[sector] / totalValue) * 100 : 0;
  }

  const unrealizedGains = totalValue - totalCost;
  const unrealizedGainsPercent = totalCost > 0 ? (unrealizedGains / totalCost) * 100 : 0;

  return {
    totalValue,
    totalCost,
    unrealizedGains,
    unrealizedGainsPercent,
    concentrationRisk: concentrationPercent,
    sectorExposure: sectorPercent,
  };
}

/**
 * Identify tax loss harvesting opportunities
 * Looks for positions with losses >= 10% below average cost
 */
export function identifyTaxHarvestOpportunities(
  holdings: PortfolioHoldings[],
  recentPurchases: Set<string> = new Set()
): TaxHarvestOpportunity[] {
  const opportunities: TaxHarvestOpportunity[] = [];
  const TAX_RATE = 0.25; // Assume 25% tax bracket
  const LOSS_THRESHOLD = 0.9; // 10% loss threshold

  for (const holding of holdings) {
    if (holding.currentPrice <= holding.averageCost * LOSS_THRESHOLD) {
      const unrealizedLoss = (holding.averageCost - holding.currentPrice) * holding.shares;
      const estimatedTaxSavings = unrealizedLoss * TAX_RATE;

      opportunities.push({
        ticker: holding.ticker,
        shares: holding.shares,
        currentPrice: holding.currentPrice,
        averageCost: holding.averageCost,
        unrealizedLoss,
        estimatedTaxSavings,
        washSaleRisk: recentPurchases.has(holding.ticker),
      });
    }
  }

  return opportunities.sort((a, b) => b.estimatedTaxSavings - a.estimatedTaxSavings);
}

/**
 * Calculate annualized yield for an options trade
 * Formula: ((Premium / Strike) * (365 / DaysToExpiration)) * 100
 */
export function calculateAnnualizedYield(premium: number, strikePrice: number, daysToExpiration: number): number {
  if (strikePrice === 0 || daysToExpiration === 0) return 0;
  return ((premium / strikePrice) * (365 / daysToExpiration)) * 100;
}

/**
 * Estimate probability of profit using delta approximation
 * Delta roughly approximates the probability of finishing in-the-money
 * For puts: POP = delta (already accounts for direction)
 * For calls: POP = delta
 */
export function estimateProbabilityOfProfit(delta: number, strategy: string): number {
  // Delta ranges from 0 to 1 (or -1 to 0 for puts)
  // For covered calls and cash secured puts, use absolute delta
  const absDelta = Math.abs(delta);

  // Adjust based on strategy
  if (strategy === "covered_call" || strategy === "bull_call_spread") {
    // For calls, probability of profit is roughly (1 - delta)
    return Math.round((1 - absDelta) * 100);
  } else if (strategy === "cash_secured_put" || strategy === "bull_put_spread") {
    // For puts, probability of profit is roughly delta
    return Math.round(absDelta * 100);
  }

  return Math.round(absDelta * 100);
}

/**
 * Calculate potential monthly income from a trade
 */
export function calculatePotentialMonthlyIncome(
  premium: number,
  shares: number,
  strategy: string
): number {
  // For covered calls: premium per share * shares
  // For cash secured puts: premium per share * (strike price / 100)
  // Assuming premium is per share in cents

  if (strategy === "covered_call") {
    return premium * shares;
  } else if (strategy === "cash_secured_put") {
    // Approximate: premium * shares (simplified)
    return premium * shares;
  }

  return premium * shares;
}

/**
 * Filter trade opportunities by yield threshold
 */
export function filterByYield(
  opportunities: TradeOpportunity[],
  minimumYield: number
): TradeOpportunity[] {
  return opportunities.filter((opp) => opp.annualizedYield >= minimumYield);
}

/**
 * Calculate portfolio Greeks (simplified)
 * In a real implementation, this would use Black-Scholes or similar models
 */
export function calculatePortfolioGreeks(
  holdings: PortfolioHoldings[],
  openOptions: TradeOpportunity[] = []
): PortfolioMetrics {
  // Simplified Greeks calculation
  // In production, integrate with options pricing library

  let delta = 0;
  let gamma = 0;
  let theta = 0;
  let vega = 0;
  let rho = 0;

  // Stock holdings contribute to delta only
  for (const holding of holdings) {
    delta += holding.shares * 100; // Each share = 1 delta (100 shares per contract)
  }

  // Options contribute to all Greeks
  for (const option of openOptions) {
    const contracts = 1; // Assuming 1 contract per opportunity
    delta += option.delta * 100 * contracts;
    // Simplified: other Greeks would require more complex calculations
    gamma += 0.01 * contracts;
    theta += -0.5 * contracts; // Theta decay
    vega += 0.1 * contracts;
    rho += 0.05 * contracts;
  }

  return {
    delta: Math.round(delta * 100) / 100,
    gamma: Math.round(gamma * 10000) / 10000,
    theta: Math.round(theta * 100) / 100,
    vega: Math.round(vega * 100) / 100,
    rho: Math.round(rho * 100) / 100,
  };
}

/**
 * Check portfolio allocation limits
 */
export function checkAllocationLimits(
  holdings: PortfolioHoldings[],
  proposedTrades: TradeOpportunity[],
  maxExposurePerTicker: number = 0.1, // 10%
  maxCashAllocation: number = 0.4 // 40%
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  const analysis = analyzePortfolio(holdings);
  const totalValue = analysis.totalValue;

  // Check per-ticker exposure
  for (const trade of proposedTrades) {
    const tickerExposure = (analysis.concentrationRisk[trade.ticker] || 0) / 100;
    if (tickerExposure > maxExposurePerTicker) {
      violations.push(
        `${trade.ticker} exposure (${(tickerExposure * 100).toFixed(1)}%) exceeds max (${(maxExposurePerTicker * 100).toFixed(1)}%)`
      );
    }
  }

  // Check cash allocation for puts
  const putTrades = proposedTrades.filter((t) => t.strategy === "cash_secured_put");
  const totalCashRequired = putTrades.reduce((sum, trade) => sum + trade.strikePrice * 100, 0); // 100 shares per contract
  const maxCashAllowed = totalValue * maxCashAllocation;

  if (totalCashRequired > maxCashAllowed) {
    violations.push(
      `Cash allocation (${(totalCashRequired / 100).toFixed(0)}) exceeds max (${(maxCashAllowed / 100).toFixed(0)})`
    );
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Calculate income progress toward monthly goal
 */
export function calculateIncomeProgress(
  estimatedMonthlyIncome: number,
  monthlyGoal: number
): { progress: number; remaining: number; progressPercent: number } {
  const progressPercent = monthlyGoal > 0 ? (estimatedMonthlyIncome / monthlyGoal) * 100 : 0;
  const remaining = Math.max(0, monthlyGoal - estimatedMonthlyIncome);

  return {
    progress: estimatedMonthlyIncome,
    remaining,
    progressPercent: Math.min(100, progressPercent),
  };
}
