import axios from "axios";

/**
 * Market data integration for live options pricing
 * Supports Alpaca, Yahoo Finance, and YFinance APIs
 */

export interface OptionChain {
  symbol: string;
  calls: OptionContract[];
  puts: OptionContract[];
  lastUpdate: Date;
}

export interface OptionContract {
  strike: number;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  expirationDate: string;
  daysToExpiration: number;
}

export interface StockQuote {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume: number;
  marketCap: string;
  pe: number;
  dividend: number;
  lastUpdate: Date;
}

/**
 * Get live stock quote from Yahoo Finance
 */
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}`,
      {
        params: {
          modules: "price,summaryDetail",
        },
        timeout: 5000,
      }
    );

    const result = response.data.quoteSummary?.result?.[0];
    if (!result) return null;

    const price = result.price;
    const summary = result.summaryDetail;

    return {
      symbol,
      price: price?.regularMarketPrice?.raw || 0,
      bid: price?.bid?.raw || 0,
      ask: price?.ask?.raw || 0,
      volume: price?.regularMarketVolume?.raw || 0,
      marketCap: summary?.marketCap?.longFmt || "N/A",
      pe: summary?.trailingPE?.raw || 0,
      dividend: summary?.trailingAnnualDividendYield?.raw || 0,
      lastUpdate: new Date(),
    };
  } catch (error) {
    console.error(`Error fetching stock quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get options chain from YFinance
 * Note: YFinance has limited options data; this is a simplified implementation
 */
export async function getOptionsChain(
  symbol: string,
  expirationDate?: string
): Promise<OptionChain | null> {
  try {
    // YFinance endpoint for options data
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v7/finance/options/${symbol}`,
      {
        params: {
          date: expirationDate,
        },
        timeout: 5000,
      }
    );

    const result = response.data.optionChain?.result?.[0];
    if (!result) return null;

    const options = result.options?.[0];
    if (!options) return null;

    const calls = (options.calls || []).map((call: any) => ({
      strike: call.strike,
      bid: call.bid || 0,
      ask: call.ask || 0,
      last: call.lastPrice || 0,
      volume: call.volume || 0,
      openInterest: call.openInterest || 0,
      impliedVolatility: call.impliedVolatility || 0,
      delta: call.greeks?.delta || 0,
      gamma: call.greeks?.gamma || 0,
      theta: call.greeks?.theta || 0,
      vega: call.greeks?.vega || 0,
      rho: call.greeks?.rho || 0,
      expirationDate: new Date(options.expirationDate * 1000).toISOString(),
      daysToExpiration: Math.floor(
        (options.expirationDate * 1000 - Date.now()) / (1000 * 60 * 60 * 24)
      ),
    }));

    const puts = (options.puts || []).map((put: any) => ({
      strike: put.strike,
      bid: put.bid || 0,
      ask: put.ask || 0,
      last: put.lastPrice || 0,
      volume: put.volume || 0,
      openInterest: put.openInterest || 0,
      impliedVolatility: put.impliedVolatility || 0,
      delta: put.greeks?.delta || 0,
      gamma: put.greeks?.gamma || 0,
      theta: put.greeks?.theta || 0,
      vega: put.greeks?.vega || 0,
      rho: put.greeks?.rho || 0,
      expirationDate: new Date(options.expirationDate * 1000).toISOString(),
      daysToExpiration: Math.floor(
        (options.expirationDate * 1000 - Date.now()) / (1000 * 60 * 60 * 24)
      ),
    }));

    return {
      symbol,
      calls,
      puts,
      lastUpdate: new Date(),
    };
  } catch (error) {
    console.error(`Error fetching options chain for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get implied volatility for a symbol
 */
export async function getImpliedVolatility(symbol: string): Promise<number | null> {
  try {
    const chain = await getOptionsChain(symbol);
    if (!chain || chain.calls.length === 0) return null;

    // Calculate average IV from calls
    const avgIV =
      chain.calls.reduce((sum, call) => sum + call.impliedVolatility, 0) /
      chain.calls.length;

    return avgIV;
  } catch (error) {
    console.error(`Error fetching IV for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get multiple stock quotes
 */
export async function getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
  const quotes = await Promise.all(symbols.map((s) => getStockQuote(s)));
  return quotes.filter((q) => q !== null) as StockQuote[];
}

/**
 * Calculate Greeks for an option (simplified Black-Scholes)
 */
export function calculateGreeks(
  stockPrice: number,
  strikePrice: number,
  timeToExpiration: number, // in years
  riskFreeRate: number,
  volatility: number,
  optionType: "call" | "put"
) {
  const d1 =
    (Math.log(stockPrice / strikePrice) +
      (riskFreeRate + (volatility * volatility) / 2) * timeToExpiration) /
    (volatility * Math.sqrt(timeToExpiration));

  const d2 = d1 - volatility * Math.sqrt(timeToExpiration);

  const Nd1 = normalDistribution(d1);
  const Nd2 = normalDistribution(d2);
  const nd1 = Math.exp((-d1 * d1) / 2) / Math.sqrt(2 * Math.PI);

  if (optionType === "call") {
    return {
      delta: Nd1,
      gamma: nd1 / (stockPrice * volatility * Math.sqrt(timeToExpiration)),
      theta:
        (-stockPrice * nd1 * volatility) / (2 * Math.sqrt(timeToExpiration)) -
        riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiration) * Nd2,
      vega: stockPrice * nd1 * Math.sqrt(timeToExpiration) * 0.01,
      rho: strikePrice * timeToExpiration * Math.exp(-riskFreeRate * timeToExpiration) * Nd2 * 0.01,
    };
  } else {
    return {
      delta: Nd1 - 1,
      gamma: nd1 / (stockPrice * volatility * Math.sqrt(timeToExpiration)),
      theta:
        (-stockPrice * nd1 * volatility) / (2 * Math.sqrt(timeToExpiration)) +
        riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiration) * (1 - Nd2),
      vega: stockPrice * nd1 * Math.sqrt(timeToExpiration) * 0.01,
      rho:
        -strikePrice * timeToExpiration * Math.exp(-riskFreeRate * timeToExpiration) * (1 - Nd2) * 0.01,
    };
  }
}

/**
 * Error function approximation
 */
function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);

  return sign * y;
}

/**
 * Normal distribution CDF
 */
function normalDistribution(x: number): number {
  return (1 + erf(x / Math.sqrt(2))) / 2;
}
