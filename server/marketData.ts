import axios from "axios";
import { ENV } from "./_core/env";

const FMP_BASE = "https://financialmodelingprep.com/api";

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

// ---------------------------------------------------------------------------
// FMP — primary data source
// ---------------------------------------------------------------------------

async function fmpGet<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
  const key = ENV.fmpApiKey;
  if (!key) return null;
  try {
    const response = await axios.get(`${FMP_BASE}${path}`, {
      params: { ...params, apikey: key },
      timeout: 6000,
    });
    return response.data as T;
  } catch (err) {
    console.error(`[FMP] ${path} failed:`, (err as any)?.message);
    return null;
  }
}

async function fmpQuote(symbol: string): Promise<StockQuote | null> {
  const data = await fmpGet<any[]>(`/v3/quote/${symbol}`);
  const q = data?.[0];
  if (!q) return null;
  return {
    symbol,
    price: q.price ?? 0,
    bid: q.price ?? 0,
    ask: q.price ?? 0,
    volume: q.volume ?? 0,
    marketCap: q.marketCap ? `$${(q.marketCap / 1e9).toFixed(1)}B` : "N/A",
    pe: q.pe ?? 0,
    dividend: 0,
    lastUpdate: new Date(),
  };
}

async function fmpOptionsChain(symbol: string, expirationDate?: string): Promise<OptionChain | null> {
  const params: Record<string, string> = {};
  if (expirationDate) params.expiration = expirationDate;

  const data = await fmpGet<any[]>(`/v4/options/${symbol}`, params);
  if (!data || data.length === 0) return null;

  const calls: OptionContract[] = [];
  const puts: OptionContract[] = [];

  for (const contract of data) {
    const mapped: OptionContract = {
      strike: contract.strike ?? 0,
      bid: contract.bid ?? 0,
      ask: contract.ask ?? 0,
      last: contract.last ?? contract.lastPrice ?? 0,
      volume: contract.volume ?? 0,
      openInterest: contract.openInterest ?? 0,
      impliedVolatility: contract.impliedVolatility ?? 0,
      delta: contract.delta ?? 0,
      gamma: contract.gamma ?? 0,
      theta: contract.theta ?? 0,
      vega: contract.vega ?? 0,
      rho: contract.rho ?? 0,
      expirationDate: contract.date ?? contract.expiration ?? "",
      daysToExpiration: contract.daysToExpiration ?? 0,
    };
    if (contract.type === "call" || contract.optionType === "call") {
      calls.push(mapped);
    } else {
      puts.push(mapped);
    }
  }

  return { symbol, calls, puts, lastUpdate: new Date() };
}

// ---------------------------------------------------------------------------
// Yahoo Finance — fallback when FMP is unavailable or key missing
// ---------------------------------------------------------------------------

async function yahooQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}`,
      { params: { modules: "price,summaryDetail" }, timeout: 5000 }
    );
    const result = response.data.quoteSummary?.result?.[0];
    if (!result) return null;
    const price = result.price;
    const summary = result.summaryDetail;
    return {
      symbol,
      price: price?.regularMarketPrice?.raw ?? 0,
      bid: price?.bid?.raw ?? 0,
      ask: price?.ask?.raw ?? 0,
      volume: price?.regularMarketVolume?.raw ?? 0,
      marketCap: summary?.marketCap?.longFmt ?? "N/A",
      pe: summary?.trailingPE?.raw ?? 0,
      dividend: summary?.trailingAnnualDividendYield?.raw ?? 0,
      lastUpdate: new Date(),
    };
  } catch {
    return null;
  }
}

async function yahooOptionsChain(symbol: string, expirationDate?: string): Promise<OptionChain | null> {
  try {
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v7/finance/options/${symbol}`,
      { params: { date: expirationDate }, timeout: 5000 }
    );
    const result = response.data.optionChain?.result?.[0];
    if (!result) return null;
    const options = result.options?.[0];
    if (!options) return null;

    const mapContract = (c: any): OptionContract => ({
      strike: c.strike,
      bid: c.bid ?? 0,
      ask: c.ask ?? 0,
      last: c.lastPrice ?? 0,
      volume: c.volume ?? 0,
      openInterest: c.openInterest ?? 0,
      impliedVolatility: c.impliedVolatility ?? 0,
      delta: c.greeks?.delta ?? 0,
      gamma: c.greeks?.gamma ?? 0,
      theta: c.greeks?.theta ?? 0,
      vega: c.greeks?.vega ?? 0,
      rho: c.greeks?.rho ?? 0,
      expirationDate: new Date(options.expirationDate * 1000).toISOString(),
      daysToExpiration: Math.floor((options.expirationDate * 1000 - Date.now()) / 86400000),
    });

    return {
      symbol,
      calls: (options.calls ?? []).map(mapContract),
      puts: (options.puts ?? []).map(mapContract),
      lastUpdate: new Date(),
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API — FMP first, Yahoo Finance fallback
// ---------------------------------------------------------------------------

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  return (await fmpQuote(symbol)) ?? (await yahooQuote(symbol));
}

export async function getOptionsChain(symbol: string, expirationDate?: string): Promise<OptionChain | null> {
  return (await fmpOptionsChain(symbol, expirationDate)) ?? (await yahooOptionsChain(symbol, expirationDate));
}

export async function getImpliedVolatility(symbol: string): Promise<number | null> {
  const chain = await getOptionsChain(symbol);
  if (!chain || chain.calls.length === 0) return null;
  const sum = chain.calls.reduce((acc, c) => acc + c.impliedVolatility, 0);
  return sum / chain.calls.length;
}

export async function getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
  // FMP supports comma-separated batch requests — much more efficient
  const key = ENV.fmpApiKey;
  if (key && symbols.length > 0) {
    const data = await fmpGet<any[]>(`/v3/quote/${symbols.join(",")}`);
    if (data && data.length > 0) {
      return data.map((q: any) => ({
        symbol: q.symbol,
        price: q.price ?? 0,
        bid: q.price ?? 0,
        ask: q.price ?? 0,
        volume: q.volume ?? 0,
        marketCap: q.marketCap ? `$${(q.marketCap / 1e9).toFixed(1)}B` : "N/A",
        pe: q.pe ?? 0,
        dividend: 0,
        lastUpdate: new Date(),
      }));
    }
  }
  // Fallback: individual Yahoo calls
  const quotes = await Promise.all(symbols.map((s) => yahooQuote(s)));
  return quotes.filter((q): q is StockQuote => q !== null);
}

/**
 * Get available options expiration dates for a symbol (FMP only).
 */
export async function getExpirationDates(symbol: string): Promise<string[]> {
  const data = await fmpGet<string[]>(`/v4/options/expirations/${symbol}`);
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Black-Scholes Greeks (local fallback if API doesn't return Greeks)
// ---------------------------------------------------------------------------

export function calculateGreeks(
  stockPrice: number,
  strikePrice: number,
  timeToExpiration: number,
  riskFreeRate: number,
  volatility: number,
  optionType: "call" | "put"
) {
  const d1 =
    (Math.log(stockPrice / strikePrice) +
      (riskFreeRate + (volatility * volatility) / 2) * timeToExpiration) /
    (volatility * Math.sqrt(timeToExpiration));
  const d2 = d1 - volatility * Math.sqrt(timeToExpiration);
  const Nd1 = normalCdf(d1);
  const Nd2 = normalCdf(d2);
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
      rho: -strikePrice * timeToExpiration * Math.exp(-riskFreeRate * timeToExpiration) * (1 - Nd2) * 0.01,
    };
  }
}

function erf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);
  return sign * y;
}

function normalCdf(x: number): number {
  return (1 + erf(x / Math.sqrt(2))) / 2;
}
