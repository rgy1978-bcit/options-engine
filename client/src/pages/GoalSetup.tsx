import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronRight, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

type Step = "income" | "risk" | "strategies" | "capital" | "horizon" | "review";

interface GoalFormData {
  monthlyIncomeGoal: number;
  riskTolerance: "conservative" | "balanced" | "aggressive";
  preferredStrategies: string[];
  maxCapitalExposure: number;
  timeHorizon: string;
}

export default function GoalSetup() {
  const [step, setStep] = useState<Step>("income");
  const [formData, setFormData] = useState<GoalFormData>({
    monthlyIncomeGoal: 1000,
    riskTolerance: "balanced",
    preferredStrategies: ["covered_calls"],
    maxCapitalExposure: 50000,
    timeHorizon: "medium_term",
  });

  const setGoalsMutation = trpc.portfolio.setGoals.useMutation();

  const steps: Step[] = ["income", "risk", "strategies", "capital", "horizon", "review"];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1]);
    }
  };

  const [, setLocation] = useLocation();

  const handleSubmit = async () => {
    try {
      await setGoalsMutation.mutateAsync({
        monthlyIncomeGoal: formData.monthlyIncomeGoal,
        riskTolerance: formData.riskTolerance,
        preferredStrategies: JSON.stringify(formData.preferredStrategies),
        maxCapitalExposure: formData.maxCapitalExposure,
        timeHorizon: formData.timeHorizon,
      });
      toast.success("Goals saved successfully!");
      // Navigate to dashboard after successful setup
      setLocation("/dashboard");
    } catch (error) {
      toast.error("Failed to save goals");
    }
  };

  const toggleStrategy = (strategy: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredStrategies: prev.preferredStrategies.includes(strategy)
        ? prev.preferredStrategies.filter((s) => s !== strategy)
        : [...prev.preferredStrategies, strategy],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Income Engine Setup</h1>
          <p className="text-muted-foreground">Configure your investment goals and preferences</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Step {currentStepIndex + 1} of {steps.length}</span>
            <span className="text-sm font-medium text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card Container */}
        <Card className="card-elegant mb-8">
          {/* Income Goal Step */}
          {step === "income" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Monthly Income Goal</h2>
                <p className="text-muted-foreground">How much monthly income do you want to generate from options?</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="income" className="text-base">
                  Target Monthly Income
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-primary">$</span>
                  <Input
                    id="income"
                    type="number"
                    value={formData.monthlyIncomeGoal}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        monthlyIncomeGoal: Number(e.target.value),
                      }))
                    }
                    className="text-2xl font-semibold"
                    min="100"
                    step="100"
                  />
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Tip:</span> Start with a realistic goal based on your portfolio size. A typical target is 1-3% monthly return.
                </p>
              </div>
            </div>
          )}

          {/* Risk Tolerance Step */}
          {step === "risk" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Risk Tolerance</h2>
                <p className="text-muted-foreground">How comfortable are you with portfolio volatility?</p>
              </div>
              <RadioGroup value={formData.riskTolerance} onValueChange={(value: any) => setFormData((prev) => ({ ...prev, riskTolerance: value }))}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="conservative" id="conservative" />
                    <Label htmlFor="conservative" className="flex-1 cursor-pointer">
                      <span className="font-semibold">Conservative</span>
                      <p className="text-sm text-muted-foreground">Lower risk, stable income. Prefer covered calls and protective strategies.</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="balanced" id="balanced" />
                    <Label htmlFor="balanced" className="flex-1 cursor-pointer">
                      <span className="font-semibold">Balanced</span>
                      <p className="text-sm text-muted-foreground">Moderate risk, mix of strategies. Blend of calls and puts.</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="aggressive" id="aggressive" />
                    <Label htmlFor="aggressive" className="flex-1 cursor-pointer">
                      <span className="font-semibold">Aggressive</span>
                      <p className="text-sm text-muted-foreground">Higher risk, higher returns. Spreads and leveraged strategies.</p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Strategies Step */}
          {step === "strategies" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Preferred Strategies</h2>
                <p className="text-muted-foreground">Which options strategies interest you most?</p>
              </div>
              <div className="space-y-3">
                {[
                  { id: "covered_calls", label: "Covered Calls", desc: "Sell calls against shares you own" },
                  { id: "cash_secured_puts", label: "Cash Secured Puts", desc: "Sell puts backed by cash reserves" },
                  { id: "wheel", label: "Wheel Strategy", desc: "Combine puts and calls for continuous income" },
                ].map((strategy) => (
                  <div key={strategy.id} className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <Checkbox
                      id={strategy.id}
                      checked={formData.preferredStrategies.includes(strategy.id)}
                      onCheckedChange={() => toggleStrategy(strategy.id)}
                    />
                    <Label htmlFor={strategy.id} className="flex-1 cursor-pointer">
                      <span className="font-semibold">{strategy.label}</span>
                      <p className="text-sm text-muted-foreground">{strategy.desc}</p>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Capital Exposure Step */}
          {step === "capital" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Maximum Capital Exposure</h2>
                <p className="text-muted-foreground">What's the maximum capital you want to expose to options?</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capital" className="text-base">
                  Maximum Capital
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-primary">$</span>
                  <Input
                    id="capital"
                    type="number"
                    value={formData.maxCapitalExposure}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxCapitalExposure: Number(e.target.value),
                      }))
                    }
                    className="text-2xl font-semibold"
                    min="1000"
                    step="1000"
                  />
                </div>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Tip:</span> This limits the total capital tied up in options positions at any time.
                </p>
              </div>
            </div>
          )}

          {/* Time Horizon Step */}
          {step === "horizon" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Time Horizon</h2>
                <p className="text-muted-foreground">How long do you plan to run this income strategy?</p>
              </div>
              <RadioGroup value={formData.timeHorizon} onValueChange={(value: any) => setFormData((prev) => ({ ...prev, timeHorizon: value }))}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="short_term" id="short_term" />
                    <Label htmlFor="short_term" className="flex-1 cursor-pointer">
                      <span className="font-semibold">Short Term (0-1 year)</span>
                      <p className="text-sm text-muted-foreground">Quick income generation with frequent adjustments</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="medium_term" id="medium_term" />
                    <Label htmlFor="medium_term" className="flex-1 cursor-pointer">
                      <span className="font-semibold">Medium Term (1-3 years)</span>
                      <p className="text-sm text-muted-foreground">Balanced approach with steady income</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="long_term" id="long_term" />
                    <Label htmlFor="long_term" className="flex-1 cursor-pointer">
                      <span className="font-semibold">Long Term (3+ years)</span>
                      <p className="text-sm text-muted-foreground">Build wealth over time with consistent strategy</p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Review Step */}
          {step === "review" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Review Your Settings</h2>
                <p className="text-muted-foreground">Please confirm your investment preferences</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Monthly Income Goal</p>
                    <p className="text-2xl font-bold text-primary">${formData.monthlyIncomeGoal.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Risk Tolerance</p>
                    <p className="text-lg font-semibold capitalize">{formData.riskTolerance}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Max Capital Exposure</p>
                    <p className="text-2xl font-bold text-secondary">${formData.maxCapitalExposure.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Time Horizon</p>
                    <p className="text-lg font-semibold capitalize">{formData.timeHorizon.replace(/_/g, " ")}</p>
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Preferred Strategies</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferredStrategies.map((strategy) => (
                      <span key={strategy} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                        {strategy.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            onClick={handlePrev}
            variant="outline"
            disabled={currentStepIndex === 0}
            className="px-6"
          >
            Previous
          </Button>
          {step === "review" ? (
            <Button
              onClick={handleSubmit}
              disabled={setGoalsMutation.isPending}
              className="px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              {setGoalsMutation.isPending ? "Saving..." : "Complete Setup"}
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
