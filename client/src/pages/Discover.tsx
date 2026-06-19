import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Compass,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  DollarSign,
  BarChart2,
  Loader2,
  BadgeDollarSign,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Strategy = "covered_call" | "cash_secured_put" | "iron_condor";

interface StockPick {
  ticker: string;
  name: string;
  sector: string;
  priceRange: string;
  strategy: Strategy;
  strategyLabel: string;
  reason: string;
  estimatedMonthlyYield: string;
  riskLevel: string;
  minCapital: number;
}

// ---------------------------------------------------------------------------
// Static curated data
// ---------------------------------------------------------------------------

const CURATED_PICKS: Array<StockPick & { category: string }> = [
  // Blue Chip Income
  {
    category: "Blue Chip Income",
    ticker: "AAPL",
    name: "Apple Inc",
    sector: "Technology",
    priceRange: "~$185",
    strategy: "covered_call",
    strategyLabel: "Covered Calls",
    reason:
      "100+ shares affordable for most investors. Premium-rich options with tight spreads. Excellent for monthly covered call income.",
    estimatedMonthlyYield: "1.5–3%",
    riskLevel: "Low",
    minCapital: 18500,
  },
  {
    category: "Blue Chip Income",
    ticker: "KO",
    name: "Coca-Cola",
    sector: "Consumer Staples",
    priceRange: "~$61",
    strategy: "covered_call",
    strategyLabel: "Covered Calls",
    reason:
      "Defensive dividend stock. Options premiums stack on top of dividend income. Extremely stable — ideal for conservative covered call writers.",
    estimatedMonthlyYield: "1–2%",
    riskLevel: "Low",
    minCapital: 6100,
  },
  {
    category: "Blue Chip Income",
    ticker: "JPM",
    name: "JPMorgan Chase",
    sector: "Financial",
    priceRange: "~$195",
    strategy: "covered_call",
    strategyLabel: "Covered Calls",
    reason:
      "Large-cap financials tend to have elevated IV around earnings. Solid dividend plus covered call income.",
    estimatedMonthlyYield: "2–3.5%",
    riskLevel: "Low-Medium",
    minCapital: 19500,
  },
  {
    category: "Blue Chip Income",
    ticker: "JNJ",
    name: "Johnson & Johnson",
    sector: "Healthcare",
    priceRange: "~$155",
    strategy: "covered_call",
    strategyLabel: "Covered Calls",
    reason:
      "Healthcare defensive. Covered calls work well on slow-moving stocks — you keep more premium without frequent assignment risk.",
    estimatedMonthlyYield: "1–2%",
    riskLevel: "Low",
    minCapital: 15500,
  },
  // Cash-Secured Put Candidates
  {
    category: "Cash-Secured Put Candidates",
    ticker: "AMZN",
    name: "Amazon",
    sector: "Technology",
    priceRange: "~$178",
    strategy: "cash_secured_put",
    strategyLabel: "Cash-Secured Puts",
    reason:
      "No dividend so covered calls are less compelling, but CSPs let you get paid while waiting to buy at a target price.",
    estimatedMonthlyYield: "2–4%",
    riskLevel: "Medium",
    minCapital: 1780,
  },
  {
    category: "Cash-Secured Put Candidates",
    ticker: "AMD",
    name: "Advanced Micro Devices",
    sector: "Technology",
    priceRange: "~$160",
    strategy: "cash_secured_put",
    strategyLabel: "Cash-Secured Puts",
    reason:
      "High IV from semiconductor volatility means fat premiums on puts. Great for collecting income while targeting an entry price.",
    estimatedMonthlyYield: "3–5%",
    riskLevel: "Medium",
    minCapital: 16000,
  },
  {
    category: "Cash-Secured Put Candidates",
    ticker: "GOOGL",
    name: "Alphabet",
    sector: "Technology",
    priceRange: "~$140",
    strategy: "cash_secured_put",
    strategyLabel: "Cash-Secured Puts",
    reason:
      "Lower-priced Google share class. High liquidity, decent IV, and you'd likely be happy owning it if assigned.",
    estimatedMonthlyYield: "2–3%",
    riskLevel: "Medium",
    minCapital: 14000,
  },
  // ETFs for Premium Income
  {
    category: "ETFs for Premium Income",
    ticker: "SPY",
    name: "SPDR S&P 500 ETF",
    sector: "ETF",
    priceRange: "~$500",
    strategy: "iron_condor",
    strategyLabel: "Iron Condors",
    reason:
      "Most liquid options market in the world. Perfect for iron condors — wide bid-ask spreads are tight here. Profit when the market stays calm.",
    estimatedMonthlyYield: "1–2%",
    riskLevel: "Medium",
    minCapital: 500,
  },
  {
    category: "ETFs for Premium Income",
    ticker: "QQQ",
    name: "Invesco Nasdaq ETF",
    sector: "ETF",
    priceRange: "~$430",
    strategy: "cash_secured_put",
    strategyLabel: "Cash-Secured Puts",
    reason:
      "Tech-heavy ETF with higher IV than SPY. CSPs let you collect premium and potentially buy a diversified tech position at a discount.",
    estimatedMonthlyYield: "2–3%",
    riskLevel: "Medium",
    minCapital: 430,
  },
  {
    category: "ETFs for Premium Income",
    ticker: "IWM",
    name: "iShares Russell 2000 ETF",
    sector: "ETF",
    priceRange: "~$200",
    strategy: "iron_condor",
    strategyLabel: "Iron Condors",
    reason:
      "Small-cap ETF with higher volatility than SPY. Excellent iron condor candidate for range-bound markets.",
    estimatedMonthlyYield: "1.5–2.5%",
    riskLevel: "Medium",
    minCapital: 200,
  },
];

const CATEGORIES = ["Blue Chip Income", "Cash-Secured Put Candidates", "ETFs for Premium Income"];

// ---------------------------------------------------------------------------
// Strategy helpers
// ---------------------------------------------------------------------------

const STRATEGY_META: Record<Strategy, { label: string; color: string; icon: React.ElementType }> = {
  covered_call: {
    label: "Covered Call",
    color: "bg-accent/15 text-accent border border-accent/30",
    icon: TrendingUp,
  },
  cash_secured_put: {
    label: "Cash-Secured Put",
    color: "bg-primary/10 text-primary border border-primary/20",
    icon: DollarSign,
  },
  iron_condor: {
    label: "Iron Condor",
    color: "bg-purple-100 text-purple-700 border border-purple-200",
    icon: BarChart2,
  },
};

const FILTER_TABS: Array<{ label: string; value: Strategy | "all" }> = [
  { label: "All", value: "all" },
  { label: "Covered Calls", value: "covered_call" },
  { label: "Cash-Secured Puts", value: "cash_secured_put" },
  { label: "Iron Condors", value: "iron_condor" },
];

// ---------------------------------------------------------------------------
// StockCard component (shared by curated + AI picks)
// ---------------------------------------------------------------------------

function StockCard({ pick }: { pick: StockPick }) {
  const meta = STRATEGY_META[pick.strategy];
  const StratIcon = meta.icon;

  return (
    <Card className="card-elegant flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-primary">{pick.ticker}</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{pick.sector}</span>
          </div>
          <p className="text-sm text-foreground font-medium mt-0.5 truncate">{pick.name}</p>
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full shrink-0 ${meta.color}`}>
          <StratIcon className="h-3 w-3" />
          {meta.label}
        </span>
      </div>

      {/* Price & capital */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">Price:</span> {pick.priceRange}
        </span>
        <span>
          <span className="font-medium text-foreground">Min capital:</span>{" "}
          ${pick.minCapital.toLocaleString()}
        </span>
      </div>

      {/* Reason */}
      <p className="text-sm text-muted-foreground leading-relaxed">{pick.reason}</p>

      {/* Yield + risk */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-medium">
          {pick.estimatedMonthlyYield}/mo est.
        </span>
        <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
          {pick.riskLevel} risk
        </span>
      </div>

      {/* Action */}
      <Button
        variant="outline"
        size="sm"
        className="mt-auto w-full"
        onClick={() => toast.info("Coming soon", { description: "Watchlist feature is in development." })}
      >
        Add to Watchlist
      </Button>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Discover() {
  const [activeFilter, setActiveFilter] = useState<Strategy | "all">("all");
  const [aiPicks, setAiPicks] = useState<StockPick[] | null>(null);
  const [aiFetched, setAiFetched] = useState(false);

  const getAiPicksMutation = trpc.discover.getAiPicks.useMutation({
    onSuccess: (data) => {
      setAiPicks(data.picks ?? []);
      setAiFetched(true);
    },
    onError: (err) => {
      if (err.data?.code === "TOO_MANY_REQUESTS") {
        toast.error("Daily AI limit reached", {
          description: "You've used all 20 AI credits for today. Resets at midnight.",
        });
      } else {
        toast.error("Failed to get AI picks", { description: err.message });
      }
    },
  });

  // Filtered curated picks
  const filteredCurated =
    activeFilter === "all"
      ? CURATED_PICKS
      : CURATED_PICKS.filter((p) => p.strategy === activeFilter);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Compass className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Discover New Opportunities</h1>
            <p className="text-sm text-muted-foreground">
              Stocks worth researching for options income strategies — ideas to consider for your watchlist.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <Card className="card-elegant border-amber-300 bg-amber-50/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Educational ideas only — not financial advice.</span>{" "}
              Always research before investing. Options involve risk and are not suitable for all investors.
            </p>
          </div>
        </Card>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeFilter === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Curated picks — grouped by category */}
        {CATEGORIES.map((category) => {
          const picks = filteredCurated.filter((p) => p.category === category);
          if (picks.length === 0) return null;
          return (
            <div key={category}>
              <h2 className="text-base font-semibold mb-3">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {picks.map((pick) => (
                  <StockCard key={pick.ticker} pick={pick} />
                ))}
              </div>
            </div>
          );
        })}

        {/* AI Personalized Picks section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">AI-Personalized Picks</h2>
          </div>

          {!aiFetched ? (
            <Card className="card-elegant">
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <BadgeDollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="max-w-sm">
                  <p className="font-semibold text-foreground mb-1">Get your personalized stock ideas</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Get 6 AI-generated stock ideas tailored to your existing portfolio and income goal.
                    Uses 1 of your 20 daily AI credits.
                  </p>
                </div>
                <Button
                  onClick={() => getAiPicksMutation.mutate()}
                  disabled={getAiPicksMutation.isPending}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  {getAiPicksMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating picks…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get My AI Picks
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ) : aiPicks && aiPicks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiPicks.map((pick) => (
                <StockCard key={pick.ticker} pick={pick} />
              ))}
            </div>
          ) : (
            <Card className="card-elegant">
              <p className="text-sm text-muted-foreground text-center py-4">
                No picks were returned. Try again in a moment.
              </p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
