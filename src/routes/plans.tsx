import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleCheck as CheckCircle2, Clock, Shield, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/invest";

type DbPlan = {
  id: string;
  name: string;
  slug: string;
  min_amount: number;
  max_amount: number | null;
  roi_percent: number;
  duration_days: number;
  active: boolean;
  sort_order: number;
};

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
  const [plans, setPlans] = useState<DbPlan[]>([]);

  useEffect(() => {
    supabase.from("plans").select("*").eq("active", true).order("sort_order").then(({ data }) => {
      setPlans((data as DbPlan[]) || []);
    });
  }, []);

  // Determine which plan to feature (2nd one typically VIP)
  const featuredIndex = Math.min(1, plans.length - 1);

  return (
    <SiteLayout>
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-6xl px-4 py-12 sm:py-20 text-center"
      >
        <div className="text-xs sm:text-sm uppercase tracking-widest text-[#16DB93] mb-3">Investment Plans</div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">Advanced short-term crypto growth engineered for high performance.</h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
          Choose from our professionally managed tiered plans. Returns are credited within {plans[0]?.duration_days || 30} days after investment, backed by our copy trading execution models.
        </p>

        {/* Feature checklist strip */}
        <div className="flex flex-wrap justify-center gap-5 text-sm text-muted-foreground">
          {[
            { icon: Clock,   label: `${plans[0]?.duration_days || 30}-day investment cycles` },
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
        {plans.map((plan, idx) => (
          <motion.div key={plan.id} variants={fadeUp}>
            <PlanCard plan={plan} featured={idx === featuredIndex} />
          </motion.div>
        ))}
      </motion.section>
    </SiteLayout>
  );
}

function PlanCard({ plan, featured }: { plan: DbPlan; featured: boolean }) {
  const expectedReturn = (amount: number) => Math.round(amount * (1 + plan.roi_percent / 100) * 100) / 100;

  // Generate tier examples
  const tiers: { invest: number; earn: number }[] = [];
  const min = plan.min_amount;
  const max = plan.max_amount || min * 10;
  const step = (max - min) / 4;
  for (let i = 0; i < 5; i++) {
    const invest = Math.round(min + step * i);
    tiers.push({ invest, earn: expectedReturn(invest) });
  }

  return (
    <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.22 }} className="h-full">
      <Card className={`surface-card border-[rgba(22,219,147,0.1)] relative overflow-hidden h-full transition-colors duration-300 ${featured ? "animate-glow-pulse" : "hover:border-[rgba(22,219,147,0.28)]"}`}>
        {featured && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 gold-gradient text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
            POPULAR
          </div>
        )}

        <CardContent className="p-5 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground leading-6">{plan.roi_percent}% ROI over {plan.duration_days} days</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Returns</div>
              <div className="mt-2 text-lg font-semibold gold-text">+{plan.roi_percent}%</div>
            </div>
          </div>

          <div className="rounded-2xl border border-[rgba(0,0,0,0.07)] bg-black/[0.02] p-5 mb-6">
            <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Return structure</div>
            <div className="space-y-2.5">
              {tiers.map((tier) => (
                <div
                  key={tier.invest}
                  className="flex items-center justify-between rounded-xl border border-[rgba(0,0,0,0.07)] bg-black/[0.03] px-4 py-2.5 text-sm"
                >
                  <span className="text-muted-foreground">${formatMoney(tier.invest)}</span>
                  <span className="font-semibold text-[#16DB93]">${formatMoney(tier.earn)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <p className="text-sm text-muted-foreground">
              {plan.max_amount
                ? `Invest $${formatMoney(plan.min_amount)} to $${formatMoney(plan.max_amount)}`
                : `Starting from $${formatMoney(plan.min_amount)}`}
            </p>
            <p className="text-sm font-medium text-[#16DB93]">Earn {plan.roi_percent}% return on your investment</p>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Duration: {plan.duration_days} days</p>
          </div>

          <Button className="w-full gold-gradient text-white hover:opacity-95" asChild>
            <Link to="/auth" search={{ mode: "register" }}>Start this plan</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
