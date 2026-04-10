import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { ArrowRight, TrendingUp, PieChart, Zap, BarChart3, Shield, Lightbulb } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: TrendingUp,
      title: "Smart Income Generation",
      description: "Generate consistent monthly income through strategic options trading",
    },
    {
      icon: PieChart,
      title: "Portfolio Analysis",
      description: "Deep insights into your holdings, concentration risk, and sector exposure",
    },
    {
      icon: Zap,
      title: "Tax Optimization",
      description: "Identify tax-loss harvesting opportunities to maximize returns",
    },
    {
      icon: BarChart3,
      title: "Trade Suggestions",
      description: "AI-powered recommendations for covered calls, puts, and spreads",
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Monitor Greeks, allocation limits, and portfolio concentration",
    },
    {
      icon: Lightbulb,
      title: "Decision Tracking",
      description: "Log and analyze all trades to improve your strategy over time",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">OptionsProf</span>
          </div>
          {isAuthenticated ? (
            <Button
              onClick={() => setLocation("/dashboard")}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="gradient-text">Generate Consistent Income</span>
                <br />
                From Your Portfolio
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                OptionsProf is a sophisticated platform for managing options income strategies. Analyze your portfolio, identify opportunities, and track performance with elegant precision.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={() => setLocation("/dashboard")}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => setLocation("/setup")}
                    size="lg"
                    variant="outline"
                  >
                    Configure Goals
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => (window.location.href = getLoginUrl())}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                  >
                    Learn More
                  </Button>
                </>
              )}
            </div>

            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Built for income investors at any stage</p>
              <div className="flex gap-6 text-sm font-medium text-foreground">
                <div>
                  <p className="text-2xl font-bold text-primary">Start Small</p>
                  <p className="text-muted-foreground">Works with any portfolio size</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary">Learn Fast</p>
                  <p className="text-muted-foreground">AI-powered guidance included</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">Scale Up</p>
                  <p className="text-muted-foreground">Grow your income strategy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-3xl" />
            <div className="relative bg-gradient-to-br from-card to-muted border border-border rounded-2xl p-8 shadow-elegant">
              <div className="space-y-6">
                <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-24 w-24 text-primary/30" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Monthly Goal</span>
                    <span className="font-bold text-primary">$5,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Current Income</span>
                    <span className="font-bold text-accent">$3,850</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="font-bold text-secondary">77%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage a sophisticated options income strategy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="card-elegant group hover:shadow-md transition-all">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 blur-3xl" />
          <div className="relative space-y-6">
            <h2 className="text-4xl font-bold">Ready to Generate Consistent Income?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join sophisticated investors using Income Engine to optimize their options strategies
            </p>
            {!isAuthenticated && (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">Income Engine</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Income Engine. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
