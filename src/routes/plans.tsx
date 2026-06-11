import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Plan = { id: string; name: string; slug: string; min_amount: number; roi_percent: number; sort_order: number };
const DURATIONS = [30, 60, 90, 180, 365];

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "Investment Plans — YieldEmpireCapital" },
      { name: "description", content: "Basic, Pro, and VIP investment plans with monthly ROI from 8% to 25%. Choose your duration and see estimated returns." },
    ],
  }),
  component: Plans,
});

function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  useEffect(() => {
    supabase.from("plans").select("*").eq("active", true).order("sort_order").then(({ data }) => setPlans(data || []));
  }, []);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="text-sm uppercase tracking-widest text-[var(--gold)] mb-2">Investment plans</div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4">Choose the plan that fits you</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">Pick a plan, set an amount, choose a duration. We'll show your estimated return instantly.</p>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-24 grid md:grid-cols-3 gap-6">
        {plans.map((p, i) => <PlanCard key={p.id} plan={p} featured={i === 1} />)}
      </section>
    </SiteLayout>
  );
}

function PlanCard({ plan, featured }: { plan: Plan; featured: boolean }) {
  const [amount, setAmount] = useState(plan.min_amount);
  const [duration, setDuration] = useState(90);
  const estimated = +(amount * (plan.roi_percent / 100) * (duration / 30)).toFixed(2);

  return (
    <Card className={`surface-card border-white/5 relative ${featured ? "glow-gold" : ""}`}>
      {featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 gold-gradient text-black text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>}
      <CardContent className="p-8">
        <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
        <p className="text-sm text-muted-foreground mb-5">Min ${plan.min_amount.toLocaleString()}</p>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-5xl font-bold gold-text">{plan.roi_percent}%</span>
          <span className="text-muted-foreground">monthly ROI</span>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Amount (USD)</label>
            <input
              type="number"
              min={plan.min_amount}
              value={amount}
              onChange={(e) => setAmount(Math.max(plan.min_amount, +e.target.value || 0))}
              className="w-full mt-1 bg-input/50 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Duration (days)</label>
            <div className="grid grid-cols-5 gap-1 mt-1">
              {DURATIONS.map((d) => (
                <button key={d} onClick={() => setDuration(d)} className={`text-xs py-2 rounded-md border ${duration === d ? "gold-gradient text-black border-transparent font-semibold" : "border-white/10 hover:border-[var(--gold)]/50"}`}>{d}</button>
              ))}
            </div>
          </div>
          <div className="surface-card rounded-lg p-4">
            <div className="text-xs text-muted-foreground">Estimated return</div>
            <div className="text-2xl font-bold gold-text tabular-nums">+${estimated.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total payout: ${(amount + estimated).toLocaleString()}</div>
          </div>
          <Button className="w-full gold-gradient text-black hover:opacity-90" asChild>
            <Link to="/invest" search={{ plan: plan.slug, amount, duration }}>Invest now</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
