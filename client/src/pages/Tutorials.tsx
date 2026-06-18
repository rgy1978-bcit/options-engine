import DashboardLayout from "@/components/DashboardLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  Shield,
  BarChart2,
  BookOpen,
  Target,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const sections = [
  {
    id: "intro",
    icon: BookOpen,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "What Is Options Income Investing?",
    summary: "Understand the core idea before diving into specific strategies.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          An option is a contract that gives one party the <strong className="text-foreground">right — but not the obligation</strong> — to buy or sell 100 shares of a stock at a specific price (the <em>strike price</em>) before a specific date (the <em>expiration date</em>).
        </p>
        <p>
          Most investors think about options as speculative bets. As an income investor, you flip the table: <strong className="text-foreground">you're the one selling those rights</strong>, collecting the payment (called the <em>premium</em>) upfront. Your job is simply to let time pass while the contract expires worthless.
        </p>
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="font-semibold text-foreground">Three terms you'll use every day:</p>
          <ul className="space-y-1.5">
            <li>• <strong className="text-foreground">Premium</strong> — the cash you receive for selling an option. This is your income.</li>
            <li>• <strong className="text-foreground">Strike price</strong> — the price at which the stock can be bought or sold under the contract.</li>
            <li>• <strong className="text-foreground">Expiration date</strong> — when the contract ends. Most income sellers target 30–45 days out.</li>
          </ul>
        </div>
        <div className="rounded-lg bg-accent/10 border border-accent/20 p-4">
          <p className="font-semibold text-foreground mb-1">The simple mental model</p>
          <p>Think of it like selling insurance. The buyer pays you a premium to be protected against a bad event (stock moving the wrong way). Most of the time the "disaster" doesn't happen, and you keep the premium. When it does happen, you have a plan — which is what risk management is about.</p>
        </div>
      </div>
    ),
  },
  {
    id: "covered-calls",
    icon: TrendingUp,
    color: "text-accent",
    bg: "bg-accent/10",
    title: "Covered Calls",
    summary: "Collect monthly income from stocks you already own. The most beginner-friendly income strategy.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          A covered call means you <strong className="text-foreground">own 100 shares of a stock</strong> and sell someone the right to buy those shares from you at a set price. "Covered" means your shares back up the contract — you can't lose more than you already have.
        </p>

        <div className="rounded-lg bg-muted p-4 space-y-3">
          <p className="font-semibold text-foreground">Step-by-step example</p>
          <ol className="space-y-2 list-decimal list-inside">
            <li>You own 100 shares of Apple (AAPL) bought at $180/share.</li>
            <li>AAPL is currently trading at $185. You sell 1 call option with a $190 strike, expiring in 30 days, for $2.50/share → you receive <strong className="text-foreground">$250 cash today</strong>.</li>
            <li>Wait 30 days. Two things can happen:</li>
          </ol>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div className="rounded-md bg-accent/10 border border-accent/20 p-3">
              <p className="font-semibold text-accent mb-1">Outcome A — Stock stays below $190</p>
              <p>The option expires worthless. You keep your $250 premium and still own your shares. Sell another covered call next month. Repeat.</p>
            </div>
            <div className="rounded-md bg-primary/10 border border-primary/20 p-3">
              <p className="font-semibold text-primary mb-1">Outcome B — Stock rises above $190</p>
              <p>Your shares are "called away" at $190. You sell 100 shares at $190 + keep the $250 premium. Total proceeds: $19,250. You miss any gain above $190, but you still profit.</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="font-semibold text-foreground">Best conditions to sell covered calls</p>
          <ul className="space-y-1">
            <li>• You own at least 100 shares of the stock (one contract = 100 shares)</li>
            <li>• You're neutral to slightly bullish — you don't expect a massive move up</li>
            <li>• Implied volatility is elevated (you collect more premium)</li>
            <li>• You're comfortable selling at the strike price if called</li>
          </ul>
        </div>

        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-1">
          <p className="font-semibold text-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Common mistakes</p>
          <ul className="space-y-1 mt-1">
            <li>• Selling the call too close to the current price — high assignment risk, low premium rarely worth it</li>
            <li>• Choosing a volatile stock where you'd be upset missing a 20% move</li>
            <li>• Forgetting that you need exactly 100 shares per contract</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "csp",
    icon: DollarSign,
    color: "text-secondary",
    bg: "bg-secondary/10",
    title: "Cash-Secured Puts",
    summary: "Get paid to agree to buy a stock you want at a lower price.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          A cash-secured put means you <strong className="text-foreground">sell someone the right to sell shares to you</strong> at the strike price. You set aside the cash to actually buy those shares if it happens. This is an ideal strategy when there's a stock you'd love to own — at a slightly lower price.
        </p>

        <div className="rounded-lg bg-muted p-4 space-y-3">
          <p className="font-semibold text-foreground">Step-by-step example</p>
          <ol className="space-y-2 list-decimal list-inside">
            <li>Microsoft (MSFT) is at $400. You'd love to own it at $380.</li>
            <li>You sell 1 put with a $380 strike, 30 days out, collecting $3.50/share → <strong className="text-foreground">$350 cash today</strong>. You set aside $38,000 in your account to cover the purchase if needed.</li>
            <li>Wait 30 days:</li>
          </ol>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div className="rounded-md bg-accent/10 border border-accent/20 p-3">
              <p className="font-semibold text-accent mb-1">Outcome A — MSFT stays above $380</p>
              <p>The put expires worthless. You keep $350 and your cash. Sell another put. Your annualized return on the cash held = roughly 11%.</p>
            </div>
            <div className="rounded-md bg-primary/10 border border-primary/20 p-3">
              <p className="font-semibold text-primary mb-1">Outcome B — MSFT falls below $380</p>
              <p>You buy 100 shares at $380. But you already collected $350, so your effective cost is <strong>$376.50/share</strong>. Now you own MSFT at a discount and can sell covered calls on it.</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="font-semibold text-foreground">The "wheel" strategy</p>
          <p>Many income investors combine cash-secured puts and covered calls in a cycle called the Wheel: sell puts until assigned → sell covered calls on assigned shares until called away → repeat. Each step generates premium income.</p>
        </div>

        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-1">
          <p className="font-semibold text-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Common mistakes</p>
          <ul className="space-y-1 mt-1">
            <li>• Selling puts on stocks you wouldn't want to own — if you're assigned a bad stock, you're stuck</li>
            <li>• Not securing the cash — you must have the full purchase amount available</li>
            <li>• Ignoring earnings dates — IV spikes before earnings, the option can gap through your strike</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "iron-condors",
    icon: BarChart2,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Iron Condors",
    summary: "Profit when a stock stays in a range. Defined risk on both sides.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          An iron condor combines <strong className="text-foreground">selling a call spread and a put spread</strong> at the same time. You profit if the stock stays between two prices at expiration. It's the go-to strategy in calm, low-volatility markets.
        </p>

        <div className="rounded-lg bg-muted p-4 space-y-3">
          <p className="font-semibold text-foreground">The four legs (using SPY at $500)</p>
          <div className="space-y-2">
            <div className="flex gap-3 items-start">
              <span className="text-accent font-bold shrink-0">SELL</span>
              <p>$510 call — collect $3.00 premium (upper short strike)</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-destructive font-bold shrink-0">BUY</span>
              <p>$515 call — pay $1.50 premium (upper long strike — caps your loss)</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-accent font-bold shrink-0">SELL</span>
              <p>$490 put — collect $2.50 premium (lower short strike)</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-destructive font-bold shrink-0">BUY</span>
              <p>$485 put — pay $1.20 premium (lower long strike — caps your loss)</p>
            </div>
          </div>
          <div className="border-t border-border pt-3 space-y-1">
            <p><strong className="text-foreground">Net credit received:</strong> $3.00 + $2.50 − $1.50 − $1.20 = <strong className="text-accent">$2.80/share = $280 total</strong></p>
            <p><strong className="text-foreground">Profit zone:</strong> SPY between $490 and $510 at expiration</p>
            <p><strong className="text-foreground">Max loss:</strong> ($5 spread width − $2.80) × 100 = <strong className="text-destructive">$220 per side</strong></p>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="font-semibold text-foreground">When to use iron condors</p>
          <ul className="space-y-1">
            <li>• Low implied volatility environment (stock isn't moving much)</li>
            <li>• No major earnings or events before expiration</li>
            <li>• Broad market ETFs (SPY, QQQ, IWM) — more predictable ranges</li>
            <li>• When you have no strong directional view</li>
          </ul>
        </div>

        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-1">
          <p className="font-semibold text-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Managing iron condors</p>
          <ul className="space-y-1 mt-1">
            <li>• Close the trade at 50% of max profit — don't get greedy near expiration</li>
            <li>• If the stock moves toward one side, close that spread early for a small loss</li>
            <li>• Avoid holding through earnings — IV crush can work for or against you unpredictably</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "collars",
    icon: Shield,
    color: "text-accent",
    bg: "bg-accent/10",
    title: "Collars",
    summary: "Lock in your gains with downside protection while selling a call to cover the cost.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          A collar protects shares you already own: you <strong className="text-foreground">buy a put (downside insurance)</strong> and <strong className="text-foreground">sell a call (to pay for that insurance)</strong>. The result is a bounded range — you can't fall below the put strike, but you also can't gain above the call strike.
        </p>

        <div className="rounded-lg bg-muted p-4 space-y-3">
          <p className="font-semibold text-foreground">Example</p>
          <ol className="space-y-2 list-decimal list-inside">
            <li>You own 100 Tesla (TSLA) shares at $250. The stock has run up and you're nervous.</li>
            <li>Buy 1 $240 put (30 days) for $5.00/share = $500 cost.</li>
            <li>Sell 1 $265 call (30 days) for $4.50/share = $450 received.</li>
            <li>Net cost: $50 (almost free protection).</li>
          </ol>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-center">
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="font-semibold text-destructive text-xs mb-1">If TSLA drops to $200</p>
              <p className="text-xs">Your put lets you sell at $240. You're protected from everything below $240.</p>
            </div>
            <div className="rounded-md bg-muted/50 p-3">
              <p className="font-semibold text-foreground text-xs mb-1">If TSLA stays $240–$265</p>
              <p className="text-xs">Both options expire worthless. You keep your shares, paid only $50 for the protection.</p>
            </div>
            <div className="rounded-md bg-accent/10 p-3">
              <p className="font-semibold text-accent text-xs mb-1">If TSLA rises to $300</p>
              <p className="text-xs">Shares called at $265. You miss gains above $265 but still profit well from $250 → $265 + premium offset.</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <p className="font-semibold text-foreground mb-2">Best use cases for collars</p>
          <ul className="space-y-1">
            <li>• You have large gains and can't afford to lose them (approaching retirement, big position)</li>
            <li>• Volatile market conditions where you want to stay invested but protected</li>
            <li>• Replacing stop-loss orders — a put gives you a guaranteed floor, a stop-loss does not</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "greeks",
    icon: Target,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "The Greeks — Plain English",
    summary: "Delta, Theta, Vega, Gamma: what they mean and why income sellers care about each one.",
    content: (
      <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="font-bold text-foreground text-base mb-1">Δ Delta</p>
            <p className="text-xs text-muted-foreground mb-2">How much the option price moves per $1 move in the stock</p>
            <ul className="space-y-1 text-xs">
              <li>• A call with delta 0.30 gains $0.30 when the stock rises $1</li>
              <li>• Delta also approximates the probability the option finishes in-the-money</li>
              <li>• As an income seller, you want <strong className="text-foreground">low delta</strong> (0.20–0.35) — you're selling out-of-the-money options with a low chance of being assigned</li>
            </ul>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="font-bold text-foreground text-base mb-1">Θ Theta</p>
            <p className="text-xs text-muted-foreground mb-2">Daily time decay — how much value the option loses each day</p>
            <ul className="space-y-1 text-xs">
              <li>• A theta of −0.05 means the option loses $5/day in value</li>
              <li>• For option <em>buyers</em>, theta is the enemy. For option <em>sellers</em>, <strong className="text-foreground">theta is your income engine</strong></li>
              <li>• Theta accelerates dramatically in the final 30 days — which is why income sellers target that window</li>
            </ul>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="font-bold text-foreground text-base mb-1">V Vega</p>
            <p className="text-xs text-muted-foreground mb-2">Sensitivity to implied volatility (IV) changes</p>
            <ul className="space-y-1 text-xs">
              <li>• High IV = expensive options = more premium collected</li>
              <li>• As a seller, you benefit when IV drops after you sell (your option is now worth less — you buy it back cheaper)</li>
              <li>• <strong className="text-foreground">IV Rank (IVR)</strong>: where current IV sits vs. the past year. IVR &gt; 50 = great time to sell premium</li>
            </ul>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="font-bold text-foreground text-base mb-1">Γ Gamma</p>
            <p className="text-xs text-muted-foreground mb-2">How fast delta changes when the stock moves</p>
            <ul className="space-y-1 text-xs">
              <li>• High gamma = delta is unstable, option value can swing rapidly</li>
              <li>• Gamma spikes close to expiration — the last week is unpredictable</li>
              <li>• As an income seller, <strong className="text-foreground">close trades before gamma gets dangerous</strong> (at 50% profit or 7–14 days before expiration)</li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <p className="font-semibold text-foreground mb-2">The income seller's mantra</p>
          <p>Sell when IV is <strong className="text-foreground">high</strong> (Vega works for you). Choose strikes with low <strong className="text-foreground">Delta</strong> (low assignment risk). Let <strong className="text-foreground">Theta</strong> decay erode the option. Close before <strong className="text-foreground">Gamma</strong> gets dangerous.</p>
        </div>
      </div>
    ),
  },
  {
    id: "options-chain",
    icon: BarChart2,
    color: "text-secondary",
    bg: "bg-secondary/10",
    title: "Reading an Options Chain",
    summary: "Navigate the table of strike prices, bids, asks, and Greeks like a pro.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>An options chain is a table showing every available option for a stock organized by expiration date and strike price. Here's what each column means:</p>

        <div className="rounded-lg bg-muted p-4 space-y-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
            <div><span className="font-semibold text-foreground">Strike</span> — The price at which the option can be exercised</div>
            <div><span className="font-semibold text-foreground">Bid</span> — The highest price a buyer will pay right now</div>
            <div><span className="font-semibold text-foreground">Ask</span> — The lowest price a seller will accept right now</div>
            <div><span className="font-semibold text-foreground">Mid</span> — Midpoint of bid/ask — where you typically try to fill</div>
            <div><span className="font-semibold text-foreground">Volume</span> — Contracts traded today (liquidity indicator)</div>
            <div><span className="font-semibold text-foreground">Open Interest</span> — Total outstanding contracts (higher = more liquid)</div>
            <div><span className="font-semibold text-foreground">IV</span> — Implied volatility for that specific strike</div>
            <div><span className="font-semibold text-foreground">Delta / Theta</span> — The Greeks for that strike</div>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="font-semibold text-foreground">In-the-money vs out-of-the-money</p>
          <ul className="space-y-1">
            <li>• <strong className="text-foreground">In-the-money (ITM)</strong>: A call below the current stock price, or a put above it. Has intrinsic value.</li>
            <li>• <strong className="text-foreground">At-the-money (ATM)</strong>: Strike equals the current stock price. Has the highest theta decay rate.</li>
            <li>• <strong className="text-foreground">Out-of-the-money (OTM)</strong>: A call above the current price, or a put below it. All time value. Income sellers prefer OTM.</li>
          </ul>
        </div>

        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <p className="font-semibold text-foreground mb-2">What to look for when selling</p>
          <ul className="space-y-1">
            <li>• <strong className="text-foreground">Bid-ask spread</strong>: The tighter the better. Wide spreads cost you money on entry and exit.</li>
            <li>• <strong className="text-foreground">Open interest &gt; 100</strong>: Enough liquidity to get filled at a fair price.</li>
            <li>• <strong className="text-foreground">Delta 0.20–0.35</strong>: Sweet spot for income — meaningful premium, manageable assignment risk.</li>
            <li>• <strong className="text-foreground">30–45 DTE</strong>: Days to expiration — this is where theta decay is most efficient.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "risk",
    icon: Shield,
    color: "text-destructive",
    bg: "bg-destructive/10",
    title: "Risk Management",
    summary: "How to size positions, when to cut losses, and how to keep one bad trade from hurting your portfolio.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="font-semibold text-foreground">Position sizing</p>
          <ul className="space-y-1">
            <li>• Never risk more than <strong className="text-foreground">2–5% of your total portfolio</strong> on any single trade</li>
            <li>• With a $10,000 portfolio, that's $200–$500 max loss per trade</li>
            <li>• Use defined-risk strategies (spreads) when you're starting out — your max loss is always known</li>
          </ul>
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="font-semibold text-foreground">The 50% profit rule</p>
          <p>Close a winning trade when you've captured <strong className="text-foreground">50% of your maximum possible profit</strong>. If you sold a put for $2.00, close it when you can buy it back for $1.00. You've earned half the premium in a fraction of the time. This frees your capital for the next trade and eliminates the risk of a late reversal.</p>
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="font-semibold text-foreground">The 2× loss rule</p>
          <p>Close a losing trade when it's worth <strong className="text-foreground">2× what you sold it for</strong>. If you sold a put for $1.00 and it's now worth $2.00, close it for a $1.00 loss. Painful, but it prevents $1.00 losses from turning into $3.00 losses. This keeps your win rate meaningful.</p>
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="font-semibold text-foreground">Diversification for income sellers</p>
          <ul className="space-y-1">
            <li>• Spread across <strong className="text-foreground">at least 5–7 different underlyings</strong></li>
            <li>• Avoid having too many positions in the same sector (e.g., 3 tech stocks will all move together)</li>
            <li>• Mix strategies: some covered calls, some cash-secured puts, maybe one condor on an ETF</li>
            <li>• Keep some cash uninvested for adjustments and opportunities</li>
          </ul>
        </div>

        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <p className="font-semibold text-foreground mb-2">Earnings and events</p>
          <p>Implied volatility spikes before earnings announcements, making premiums attractive — but the stock can move 10–20% in either direction overnight. Unless you're specifically trading earnings, <strong className="text-foreground">avoid holding options through earnings</strong>. PremiaOpts flags earnings dates on all trade suggestions.</p>
        </div>
      </div>
    ),
  },
  {
    id: "tax",
    icon: Lightbulb,
    color: "text-secondary",
    bg: "bg-secondary/10",
    title: "Tax Considerations",
    summary: "Key tax rules every options income investor should know before their first trade.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="font-semibold text-foreground">Short-term vs long-term rates</p>
          <p>Options held less than a year are taxed as <strong className="text-foreground">short-term capital gains</strong> — the same rate as your ordinary income. Since most income trades last 30–60 days, most of your premium income will be taxed at your regular income tax bracket.</p>
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="font-semibold text-foreground">The 60/40 rule — index options</p>
          <p>Options on broad-market index ETFs like SPY and QQQ, and futures-based ETFs, may qualify for the <strong className="text-foreground">60/40 rule</strong>: 60% of gains taxed at the long-term rate, 40% at the short-term rate — regardless of how long you held. This is a meaningful tax advantage for active traders.</p>
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="font-semibold text-foreground">Wash sale rules</p>
          <ul className="space-y-1">
            <li>• If you sell a stock at a loss and buy the same stock within 30 days, you can't claim the loss</li>
            <li>• Options complicate this — selling puts on a stock you just sold at a loss may trigger wash sale</li>
            <li>• PremiaOpts flags wash sale risks in your tax harvest analysis</li>
            <li>• Always verify with a CPA — wash sale rules with options are complex</li>
          </ul>
        </div>

        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <p className="font-semibold text-foreground mb-1">Keep good records</p>
          <p>Track every trade: date opened, premium received, date closed, premium paid to close, net profit/loss. Your broker's 1099-B will have this, but having your own records helps catch errors and makes tax prep faster. PremiaOpts trade history is designed to serve this purpose.</p>
        </div>
      </div>
    ),
  },
  {
    id: "using-premiaopt",
    icon: CheckCircle,
    color: "text-accent",
    bg: "bg-accent/10",
    title: "Using PremiaOpts Effectively",
    summary: "Get the most out of every feature — from uploading your portfolio to acting on trade suggestions.",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <div className="space-y-3">
          {[
            {
              step: "1",
              title: "Upload your portfolio",
              body: "Go to Portfolio Upload and add your holdings via CSV or manual entry. The more accurate your holdings, the better the trade suggestions. Include your cost basis — it's used for tax analysis.",
            },
            {
              step: "2",
              title: "Set your income goal",
              body: "Go to Goal Setup. Enter a realistic monthly income target (a common starting point is 1–2% of your portfolio value monthly). Also set your risk tolerance — this filters suggestions to match your comfort level.",
            },
            {
              step: "3",
              title: "Review trade suggestions",
              body: "The Opportunities tab shows ranked trade suggestions based on your actual holdings. Each suggestion shows the strategy, ticker, strike, expiration, premium, annualized yield, and risk level. In Learning Mode you'll also see plain-English explanations for why each trade was recommended.",
            },
            {
              step: "4",
              title: "Execute in your own brokerage",
              body: "PremiaOpts is advisory-only. After reviewing a suggestion, place the trade in your own brokerage account (Schwab, Fidelity, TD Ameritrade, etc.). Then come back and log it in the Trade History so your performance tracking stays accurate.",
            },
            {
              step: "5",
              title: "Track and improve",
              body: "The dashboard shows your income progress, portfolio analytics, and decision history. Review your trades monthly — what worked, what didn't — and adjust your strategy. Over time, your win rate and income consistency will improve.",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-white">{item.step}</span>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-0.5">{item.title}</p>
                <p>{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-accent/10 border border-accent/20 p-4">
          <p className="font-semibold text-foreground mb-1">Switch to Pro Mode when ready</p>
          <p>Pro Mode shows raw Greeks, full options chain data, and the full analytical engine without the explanatory overlays. Switch using the toggle in the top bar — your data and settings carry over instantly. Most students spend 2–4 weeks in Learning Mode before switching over.</p>
        </div>
      </div>
    ),
  },
];

export default function Tutorials() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6 px-2">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Options Income Tutorials</h1>
              <p className="text-muted-foreground text-sm">Everything you need to start generating income from options — in plain English.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg px-4 py-2.5 mt-4">
            <ArrowRight className="h-4 w-4 text-primary shrink-0" />
            <span>Start from the top and work down — each section builds on the previous one.</span>
          </div>
        </div>

        <Accordion type="multiple" className="space-y-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border border-border rounded-xl overflow-hidden bg-card shadow-sm"
              >
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/40 transition-colors [&>svg]:shrink-0">
                  <div className="flex items-center gap-4 text-left">
                    <div className={`h-9 w-9 rounded-lg ${section.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-4.5 w-4.5 ${section.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground leading-snug">{section.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{section.summary}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-1">
                  {section.content}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </DashboardLayout>
  );
}
