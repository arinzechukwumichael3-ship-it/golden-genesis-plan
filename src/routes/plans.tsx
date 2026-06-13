import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Bitcoin, Clock, ShieldCheck, TrendingUp } from "lucide-react";
import { useCurrency } from "@/lib/currency";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "BTC/USDT Copy Trading Plans — YieldEmpireCapital" },
      {
        name: "description",
        content:
          "Professional BTC & USDT copy trading plans. Basic, VIP, and Premium tiers with fixed returns paid out within 72 hours.",
      },
    ],
  }),
  component: Plans,
});

type FiatTier = { investEUR: number; earnEUR: number };
type BtcTier = { invest: string; earn: string; multiplier: string };
type PlanDef = {
  slug: string;
  name: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  kind: "fiat" | "btc";
  fiatTiers?: FiatTier[];
  btcTiers?: BtcTier[];
  features: string[];
  featured?: boolean;
};

const PLANS: PlanDef[] = [
  {
    slug: "basic",
    name: "Basic Plan",
    tagline: "Entry tier copy trading for steady, fast returns.",
    icon: Zap,
    kind: "fiat",
    fiatTiers: [
      { investEUR: 500, earnEUR: 1000 },
      { investEUR: 600, earnEUR: 1500 },
      { investEUR: 700, earnEUR: 1800 },
      { investEUR: 800, earnEUR: 2000 },
      { investEUR: 900, earnEUR: 2500 },
    ],
    features: [
      "USDT / BTC deposits accepted",
      "Auto copy-trade signals",
      "Payouts within 72 hours",
      "Email + dashboard updates",
    ],
  },
  {
    slug: "vip",
    name: "VIP Plan",
    tagline: "Higher allocations, accelerated multipliers, priority desk.",
    icon: Crown,
    badge: "MOST POPULAR",
    kind: "fiat",
    featured: true,
    fiatTiers: [
      { investEUR: 1000, earnEUR: 5000 },
      { investEUR: 1500, earnEUR: 7000 },
      { investEUR: 2000, earnEUR: 10000 },
      { investEUR: 3000, earnEUR: 15000 },
      { investEUR: 4000, earnEUR: 20000 },
      { investEUR: 5000, earnEUR: 50000 },
      { investEUR: 10000, earnEUR: 100000 },
    ],
    features: [
      "Dedicated VIP trading desk",
      "Priority payout queue (72h)",
      "Advanced risk-managed strategies",
      "1-on-1 account manager",
    ],
  },
  {
    slug: "premium",
    name: "Premium Plan",
    tagline: "Native BTC allocations. Whale-tier copy trading.",
    icon: Bitcoin,
    kind: "btc",
    btcTiers: [
      { invest: "1 BTC", earn: "3 BTC", multiplier: "3×" },
      { invest: "2 BTC", earn: "6 BTC", multiplier: "3×" },
      { invest: "3 BTC", earn: "9 BTC", multiplier: "3×" },
      { invest: "4 BTC", earn: "12 BTC", multiplier: "3×" },
      { invest: "5 BTC", earn: "15 BTC", multiplier: "3×" },
    ],
    features: [
      "Native BTC settlement",
      "Institutional-grade execution",
      "Cold-storage custody option",
      "White-glove onboarding",
    ],
  },
];

function Plans() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--gold)] mb-4">
          <span className="h-px w-8 bg-[var(--gold)]/60" />
          BTC / USDT Copy Trading
          <span className="h-px w-8 bg-[var(--gold)]/60" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          Professional <span className="gold-text">Copy Trading</span> Plans
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Mirror our institutional desk in real time. Fixed-return tiers across BTC and USDT —
          settlement guaranteed within 72 hours of confirmed deposit.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs">
          <Badge icon={Clock}>72-hour payout</Badge>
          <Badge icon={ShieldCheck}>Risk-managed strategy</Badge>
          <Badge icon={TrendingUp}>Up to 10× multiplier</Badge>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 grid lg:grid-cols-3 gap-6">
        {PLANS.map((p) => <PlanCard key={p.slug} plan={p} />)}
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-24">
        <Card className="surface-card border-[var(--gold)]/20">
          <CardContent className="p-8 md:p-10 text-center">
            <Clock className="w-10 h-10 mx-auto text-[var(--gold)] mb-3" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Return on investment within <span className="gold-text">72 hours</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Once your deposit is confirmed on-chain, our desk activates your copy-trade
              allocation immediately. Profits land back in your wallet within 72 hours — every
              tier, every time. 🤝
            </p>
          </CardContent>
        </Card>
      </section>
    </SiteLayout>
  );
}

function Badge({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-muted-foreground">
      <Icon className="w-3.5 h-3.5 text-[var(--gold)]" />
      {children}
    </span>
  );
}

function PlanCard({ plan }: { plan: PlanDef }) {
  const Icon = plan.icon;
  const { info, fromEUR, format } = useCurrency();

  const rows: { invest: string; earn: string; multiplier: string }[] =
    plan.kind === "fiat"
      ? (plan.fiatTiers ?? []).map((t) => ({
          invest: format(fromEUR(t.investEUR)),
          earn: format(fromEUR(t.earnEUR)),
          multiplier: `${+(t.earnEUR / t.investEUR).toFixed(2)}×`,
        }))
      : (plan.btcTiers ?? []);

  const denom = plan.kind === "fiat" ? `${info.code} denominated` : "BTC denominated";

  return (
    <Card
      className={`surface-card border-white/5 relative overflow-hidden flex flex-col ${
        plan.featured ? "glow-gold border-[var(--gold)]/40 lg:scale-[1.03]" : ""
      }`}
    >
      {plan.featured && (
        <div className="absolute top-0 inset-x-0 h-1 gold-gradient" />
      )}
      {plan.badge && (
        <div className="absolute top-4 right-4 gold-gradient text-black text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full">
          {plan.badge}
        </div>
      )}

      <CardContent className="p-8 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[var(--gold)]" />
          </div>
          <div>
            <h3 className="text-2xl font-bold leading-none">{plan.name}</h3>
            <div className="text-xs text-muted-foreground mt-1">{denom}</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{plan.tagline}</p>

        <div className="rounded-lg border border-white/10 overflow-hidden mb-6">
          <div className="grid grid-cols-[1fr_auto_1fr] text-[10px] uppercase tracking-wider text-muted-foreground bg-white/[0.03] px-4 py-2">
            <span>Invest</span>
            <span className="text-center">→</span>
            <span className="text-right">Earn</span>
          </div>
          <div className="divide-y divide-white/5">
            {rows.map((t, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2.5 text-sm hover:bg-[var(--gold)]/[0.04] transition-colors"
              >
                <span className="font-semibold tabular-nums">{t.invest}</span>
                <span className="text-[10px] font-bold gold-text px-2">{t.multiplier}</span>
                <span className="text-right font-bold gold-text tabular-nums">{t.earn}</span>
              </div>
            ))}
          </div>
        </div>

        <ul className="space-y-2 mb-6 text-sm">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-[var(--gold)] mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-2">
          <Button asChild className="w-full gold-gradient text-black hover:opacity-90 h-11 font-semibold">
            <Link to="/auth">Start {plan.name}</Link>
          </Button>
          <p className="text-[11px] text-center text-muted-foreground mt-3">
            Payout within 72 hours of confirmed deposit
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
