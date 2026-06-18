import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  BookOpen,
  TrendingUp,
  DollarSign,
  Target,
  ArrowRight,
  GraduationCap,
  BarChart2,
  Shield,
  Lightbulb,
  CheckCircle,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const learningPath = [
  { id: "intro", label: "What is options income?", page: "intro" },
  { id: "covered-calls", label: "Covered Calls", page: "covered-calls" },
  { id: "csp", label: "Cash-Secured Puts", page: "csp" },
  { id: "iron-condors", label: "Iron Condors", page: "iron-condors" },
  { id: "collars", label: "Collars", page: "collars" },
  { id: "greeks", label: "The Greeks", page: "greeks" },
  { id: "options-chain", label: "Reading Options Chains", page: "options-chain" },
  { id: "risk", label: "Risk Management", page: "risk" },
  { id: "tax", label: "Tax Considerations", page: "tax" },
  { id: "using-premiaopt", label: "Using PremiaOpts", page: "using-premiaopt" },
];

const quickCards = [
  {
    icon: BookOpen,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Tutorials",
    description: "Step-by-step guides for every strategy and feature",
    path: "/tutorials",
  },
  {
    icon: Upload,
    color: "text-secondary",
    bg: "bg-secondary/10",
    title: "Upload Portfolio",
    description: "Add your current holdings to get personalized suggestions",
    path: "/upload",
  },
  {
    icon: Target,
    color: "text-accent",
    bg: "bg-accent/10",
    title: "Set Your Goal",
    description: "Tell us how much income you want to generate each month",
    path: "/setup",
  },
  {
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Opportunities",
    description: "View AI-generated trade suggestions for your portfolio",
    path: "/opportunities",
  },
];

const strategyCards = [
  {
    icon: TrendingUp,
    color: "text-accent",
    title: "Covered Calls",
    risk: "Low risk",
    income: "2–4% monthly",
    plain: "Sell the right to buy your shares. Collect cash. Keep your stock if nothing happens.",
  },
  {
    icon: DollarSign,
    color: "text-secondary",
    title: "Cash-Secured Puts",
    risk: "Medium risk",
    income: "1–3% monthly",
    plain: "Get paid to agree to buy a stock at a lower price. Keep the cash if the stock doesn't fall.",
  },
  {
    icon: BarChart2,
    color: "text-primary",
    title: "Iron Condors",
    risk: "Medium risk",
    income: "1–2% monthly",
    plain: "Profit when a stock stays flat. You win as long as it doesn't move too far in either direction.",
  },
  {
    icon: Shield,
    color: "text-accent",
    title: "Collars",
    risk: "Very low risk",
    income: "0–1% monthly",
    plain: "Protect shares you own from big drops by also selling a call to cover the cost of protection.",
  },
];

export default function LearningDashboard() {
  const [, setLocation] = useLocation();
  const goalsQuery = trpc.portfolio.getGoals.useQuery();
  const holdingsQuery = trpc.portfolio.getHoldings.useQuery();
  const suggestionsQuery = trpc.trades.getSuggestions.useQuery();

  const goals = goalsQuery.data;
  const holdingCount = holdingsQuery.data?.length ?? 0;
  const suggestionCount = suggestionsQuery.data?.length ?? 0;
  const monthlyGoal = goals?.monthlyIncomeGoal ?? 0;

  // Simple setup progress based on what's configured
  const setupSteps = [
    { label: "Signed in", done: true },
    { label: "Portfolio uploaded", done: holdingCount > 0 },
    { label: "Income goal set", done: monthlyGoal > 0 },
    { label: "First tutorial read", done: false },
    { label: "First trade suggestion reviewed", done: suggestionCount > 0 },
  ];
  const setupProgress = (setupSteps.filter((s) => s.done).length / setupSteps.length) * 100;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">Welcome to Learning Mode</h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
              You're here to learn options income investing. This dashboard guides you through the fundamentals step-by-step. When you're ready for raw data and full analytics, switch to <strong>Pro Mode</strong> using the toggle in the top bar.
            </p>
          </div>
        </div>
      </div>

      {/* Setup Progress */}
      <Card className="card-elegant">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Getting Started</h2>
              <p className="text-sm text-muted-foreground">Complete these steps to get your first trade suggestion</p>
            </div>
            <span className="text-sm font-semibold text-primary">{Math.round(setupProgress)}%</span>
          </div>
          <Progress value={setupProgress} className="h-2" />
          <div className="space-y-2">
            {setupSteps.map((step) => (
              <div key={step.label} className="flex items-center gap-3 text-sm">
                <CheckCircle className={`h-4 w-4 shrink-0 ${step.done ? "text-accent" : "text-muted-foreground/30"}`} />
                <span className={step.done ? "text-foreground" : "text-muted-foreground"}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.path}
                className="card-elegant cursor-pointer hover:shadow-md transition-all group"
                onClick={() => setLocation(card.path)}
              >
                <div className="space-y-3">
                  <div className={`h-10 w-10 rounded-lg ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{card.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Strategy Overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">The Four Core Strategies</h2>
          <Button variant="outline" size="sm" onClick={() => setLocation("/tutorials")}>
            Full Tutorials <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategyCards.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.title} className="card-elegant">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-semibold">{s.title}</p>
                      <div className="flex gap-2">
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{s.risk}</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s.income}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{s.plain}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Learning Path */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Your Learning Path</h2>
          <Button size="sm" onClick={() => setLocation("/tutorials")} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            Start Learning <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
        <Card className="card-elegant">
          <div className="space-y-1">
            {learningPath.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                onClick={() => setLocation("/tutorials")}
              >
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-medium text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {idx + 1}
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground ml-auto transition-all" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tip of the day */}
      <Card className="card-elegant border-l-4 border-l-primary">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm mb-1">Key concept: Theta is your income engine</p>
            <p className="text-sm text-muted-foreground">Options lose value every day simply due to time passing — this is called theta decay. As an option <em>seller</em>, you collect this decay as income. The closer an option gets to expiration, the faster it decays. That's why income sellers target the 30–45 day window before expiration.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
