import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Shield, Zap } from "lucide-react";

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
      { invest: "€500",  earn: "€1,000" },
      { invest: "€600",  earn: "€1,500" },
      { invest: "€700",  earn: "€1,800" },
      { invest: "€800",  earn: "€2,000" },
      { invest: "€900",  earn: "€2,500" },
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
      { invest: "€1,000",  earn: "€5,000"   },
      { invest: "€1,500",  earn: "€7,000"   },
      { invest: "€2,000",  earn: "€10,000"  },
      { invest: "€3,000",  earn: "€15,000"  },
      { invest: "€4,000",  earn: "€20,000"  },
      { invest: "€5,000",  earn: "€50,000"  },
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
      { invest: "1 BTC", earn: "3 BTC"  },
      { invest: "2 BTC", earn: "6 BTC"  },
      { invest: "3 BTC", earn: "9 BTC"  },
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

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

function Plans() {
  return (
    <SiteLayout>
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-6xl px-4 py-20 text-center"
      >
        <div className="text-sm uppercase tracking-widest text-[#16DB93] mb-3">BTC / USDT Copy Trading Plans</div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4">Advanced short-term crypto growth engineered for high performance.</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
          Choose from our professionally managed tiered plans. Returns are credited within 72 hours after payment, backed by our copy trading execution models.
        </p>

        {/* Feature checklist strip */}
        <div className="flex flex-wrap justify-center gap-5 text-sm text-muted-foreground">
          {[
            { icon: Clock,   label: "72-hour payout guarantee" },
            { icon: Shield,  label: "Bank-grade security" },
            { icon: Zap,     label: "Instant onboarding" },
            { icon: CheckCircle2, label: "Zero hidden fees" },
          ].map((f) => (
            <span key={f.label} className="inline-flex items-center gap-2">
              <f.icon className="h-4 w-4 text-[#16DB93]" />
              {f.label}
            </span>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="mx-auto max-w-7xl px-4 pb-24 grid gap-6 lg:grid-cols-3"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {PLANS.map((plan) => (
          <motion.div key={plan.name} variants={fadeUp}>
            <PlanCard plan={plan} />
          </motion.div>
        ))}
      </motion.section>
    </SiteLayout>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.22 }} className="h-full">
      <Card className={`surface-card border-[rgba(22,219,147,0.1)] relative overflow-hidden h-full transition-colors duration-300 ${plan.featured ? "animate-glow-pulse" : "hover:border-[rgba(22,219,147,0.28)]"}`}>
        {plan.featured && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 gold-gradient text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
            VIP SELECTION
          </div>
        )}

        <CardContent className="p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground leading-6">{plan.tagline}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Asset class</div>
              <div className="mt-2 text-lg font-semibold gold-text">{plan.symbol}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-[rgba(0,0,0,0.07)] bg-black/[0.02] p-5 mb-6">
            <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Return structure</div>
            <div className="space-y-2.5">
              {plan.entries.map((entry) => (
                <div
                  key={`${entry.invest}-${entry.earn}`}
                  className="flex items-center justify-between rounded-xl border border-[rgba(0,0,0,0.07)] bg-black/[0.03] px-4 py-2.5 text-sm"
                >
                  <span className="text-muted-foreground">{entry.invest}</span>
                  <span className="font-semibold text-[#16DB93]">{entry.earn}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <p className="text-sm text-muted-foreground">{plan.description}</p>
            <p className="text-sm font-medium text-[#16DB93]">{plan.highlight}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Payout window: 72 hours after payment</p>
          </div>

          <Button className="w-full gold-gradient text-white hover:opacity-95" asChild>
            <Link to="/auth" search={{ mode: "register" }}>Start this plan</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
