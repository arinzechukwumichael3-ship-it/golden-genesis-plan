import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PlanEntry = { invest: string; earn: string };
type Plan = {
  name: string;
  tagline: string;
  symbol: string;
  entries: PlanEntry[];
  highlight: string;
  description: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Basic Plan",
    symbol: "EUR",
    tagline: "Short-term USDT copy trading with guaranteed tier payouts.",
    highlight: "Double your capital within 72 hours.",
    description: "Perfect for new traders seeking fast, predictable returns on small capital.",
    entries: [
      { invest: "€500", earn: "€1,000" },
      { invest: "€600", earn: "€1,500" },
      { invest: "€700", earn: "€1,800" },
      { invest: "€800", earn: "€2,000" },
      { invest: "€900", earn: "€2,500" },
    ],
  },
  {
    name: "VIP Plan",
    symbol: "EUR",
    tagline: "Premium copy trading with higher tiers and elite return multipliers.",
    highlight: "Top-tier strategy designed for serious investors.",
    description: "Designed for high-net-worth clients looking for aggressive growth and rapid capital expansion.",
    featured: true,
    entries: [
      { invest: "€1,000", earn: "€5,000" },
      { invest: "€1,500", earn: "€7,000" },
      { invest: "€2,000", earn: "€10,000" },
      { invest: "€3,000", earn: "€15,000" },
      { invest: "€4,000", earn: "€20,000" },
      { invest: "€5,000", earn: "€50,000" },
      { invest: "€10,000", earn: "€100,000" },
    ],
  },
  {
    name: "Premium Plan",
    symbol: "BTC",
    tagline: "Advanced BTC copy trading for maximum market leverage.",
    highlight: "Triple your BTC position in just 72 hours.",
    description: "Premium BTC-only tier for experienced crypto investors seeking the highest upside.",
    entries: [
      { invest: "1 BTC", earn: "3 BTC" },
      { invest: "2 BTC", earn: "6 BTC" },
      { invest: "3 BTC", earn: "9 BTC" },
      { invest: "4 BTC", earn: "12 BTC" },
      { invest: "5 BTC", earn: "15 BTC" },
    ],
  },
];

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "BTC/USDT Copy Trading Plans — YieldEmpireCapital" },
      { name: "description", content: "Professional BTC and USDT copy trading plans with tiered returns and 72-hour payout windows." },
    ],
  }),
  component: Plans,
});

function Plans() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <div className="text-sm uppercase tracking-widest text-[var(--gold)] mb-3">BTC / USDT Copy Trading Plans</div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4">Advanced short-term crypto growth engineered for high performance.</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
          Choose from our professionally managed tiered plans. Returns are credited within 72 hours after payment, backed by our copy trading execution models.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard key={plan.name} plan={plan} />
        ))}
      </section>
    </SiteLayout>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Card className={`surface-card border-white/10 relative overflow-hidden ${plan.featured ? "glow-gold shadow-2xl shadow-[rgba(252,211,77,0.18)]" : ""}`}>
      {plan.featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 gold-gradient text-black text-xs font-bold px-3 py-1 rounded-full">
          VIP SELECTION
        </div>
      )}

      <CardContent className="p-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="text-sm text-muted-foreground leading-6">{plan.tagline}</p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Asset class</div>
            <div className="mt-2 text-lg font-semibold gold-text">{plan.symbol}</div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.02)] p-5 mb-6">
          <div className="text-sm text-muted-foreground mb-3">Return structure</div>
          <div className="space-y-3">
            {plan.entries.map((entry) => (
              <div key={`${entry.invest}-${entry.earn}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm">
                <span>{entry.invest}</span>
                <span className="font-semibold text-[var(--gold)]">{entry.earn}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 space-y-2">
          <p className="text-sm text-muted-foreground">{plan.description}</p>
          <p className="text-sm font-medium text-[var(--gold)]">{plan.highlight}</p>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Payout window: 72 hours after payment</p>
        </div>

        <Button className="w-full gold-gradient text-black hover:opacity-95" asChild>
          <Link to="/auth" search={{ mode: "register" }}>Start this plan</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
