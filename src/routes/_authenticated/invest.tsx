import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, animate, useInView } from "framer-motion";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, TrendingUp, Clock, Zap, Shield } from "lucide-react";

const DURATIONS = [30, 60, 90, 180, 365];
const search = z.object({
  plan: z.string().optional(),
  amount: z.coerce.number().optional(),
  duration: z.coerce.number().optional(),
});

type Plan = { id: string; name: string; slug: string; min_amount: number; roi_percent: number };

const FRONTEND_PLANS = [
  {
    name: "Basic",
    slug: "basic",
    color: "rgba(22,219,147,0.7)",
    accent: "#16DB93",
    features: ["USDT copy trading", "72-hour payouts", "5 return tiers", "Email support"],
    entries: ["€500 → €1,000", "€600 → €1,500", "€700 → €1,800", "€800 → €2,000", "€900 → €2,500"],
    note: "Paid within 72 hours",
    barHeights: [28, 36, 44, 52, 64],
  },
  {
    name: "VIP",
    slug: "vip",
    color: "#16DB93",
    accent: "#16DB93",
    features: ["Elite USDT tiers", "Priority payouts", "7 return tiers", "Dedicated support"],
    entries: [
      "€1,000 → €5,000",
      "€1,500 → €7,000",
      "€2,000 → €10,000",
      "€3,000 → €15,000",
      "€4,000 → €20,000",
      "€5,000 → €50,000",
      "€10,000 → €100,000",
    ],
    note: "Highest multipliers",
    barHeights: [30, 42, 55, 68, 78, 88, 100],
  },
  {
    name: "Premium",
    slug: "premium",
    color: "rgba(22,219,147,0.85)",
    accent: "#16DB93",
    features: ["BTC-only trading", "72-hour payouts", "5 BTC tiers", "VIP account manager"],
    entries: ["1 BTC → 3 BTC", "2 BTC → 6 BTC", "3 BTC → 9 BTC", "4 BTC → 12 BTC", "5 BTC → 15 BTC"],
    note: "BTC 3× multiplier",
    barHeights: [40, 55, 68, 80, 100],
  },
];

export const Route = createFileRoute("/_authenticated/invest")({
  validateSearch: search,
  component: Invest,
});

function PlanBarChart({ heights, color, active }: { heights: number[]; color: string; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="flex items-end gap-1 h-16">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t-sm"
          initial={{ height: 0 }}
          animate={inView ? { height: h * 0.64 } : { height: 0 }}
          transition={{ delay: 0.15 + i * 0.07, duration: 0.5, ease: "easeOut" }}
          style={{ background: active ? color : `rgba(22,219,147,${0.12 + i * 0.06})` }}
        />
      ))}
    </div>
  );
}

function FeaturePill({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between rounded-full border border-[rgba(22,219,147,0.14)] bg-white/[0.025] px-4 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="h-5 w-5 rounded-full bg-[#16DB93] grid place-items-center shrink-0 ml-3">
        <Check className="h-3 w-3 text-black" strokeWidth={3} />
      </span>
    </div>
  );
}

function AnimatedReturn({ value, prefix = "$" }: { value: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const c = animate(prev.current, value, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.floor(v * 100) / 100),
    });
    prev.current = value;
    return c.stop;
  }, [value]);
  return <span ref={ref}>{prefix}{display.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
}

function Invest() {
  const navigate = useNavigate();
  const sp = Route.useSearch();
  const [selectedFrontendPlan, setSelectedFrontendPlan] = useState<string>("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState<string>("");
  const [amount, setAmount] = useState<number>(sp.amount ?? 100);
  const [duration, setDuration] = useState<number>(sp.duration ?? 90);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("plans").select("*").eq("active", true).order("sort_order");
      setPlans(data || []);
      const initial = sp.plan ? (data || []).find((p: Plan) => p.slug === sp.plan) : data?.[0];
      if (initial) { setPlanId(initial.id); if (!sp.amount) setAmount(initial.min_amount); }
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        const { data: p } = await supabase.from("profiles").select("balance").eq("id", u.user.id).maybeSingle();
        setBalance(p?.balance ?? 0);
      }
    })();
  }, [sp.plan, sp.amount]);

  function parseInvestAmount(entry: string) {
    const m = entry.match(/€?([0-9,.]+)\s*(BTC)?/i);
    if (!m) return undefined;
    return parseFloat(m[1].replace(/,/g, ""));
  }

  const plan = plans.find(p => p.id === planId);
  const estimated = plan ? +(amount * (plan.roi_percent / 100) * (duration / 30)).toFixed(2) : 0;

  const submit = async () => {
    if (!plan) return;
    if (amount < plan.min_amount) return toast.error(`Minimum for ${plan.name} is $${plan.min_amount}`);
    if (amount > balance) return toast.error("Insufficient balance — deposit first");
    setLoading(true);
    const { error } = await supabase.rpc("create_investment", { _plan_id: plan.id, _amount: amount, _duration_days: duration });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Investment started");
    navigate({ to: "/dashboard" });
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-12">
        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <div className="text-xs uppercase tracking-widest text-[#16DB93] mb-2">Investment Portal</div>
          <h1 className="text-3xl font-bold mb-1">New investment</h1>
          <p className="text-sm text-muted-foreground">
            Available balance: <span className="text-[#16DB93] font-semibold">${balance.toLocaleString()}</span>
          </p>
        </motion.div>

        {/* Plan visual cards */}
        <motion.div
          className="grid sm:grid-cols-3 gap-4 mb-10"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {FRONTEND_PLANS.map((fp) => {
            const isActive = selectedFrontendPlan === fp.slug;
            return (
              <motion.div
                key={fp.slug}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    setSelectedFrontendPlan(fp.slug);
                    const amt = parseInvestAmount(fp.entries[0]);
                    if (amt) setAmount(amt);
                    setDuration(90);
                    const matched = plans.find(pl => (pl.slug && pl.slug.toLowerCase() === fp.slug) || pl.name.toLowerCase() === fp.name.toLowerCase());
                    if (matched) {
                      setPlanId(matched.id);
                      if (amt && amt < matched.min_amount) setAmount(matched.min_amount);
                    }
                  }}
                  className={`cursor-pointer rounded-xl border p-5 transition-colors duration-200 ${isActive ? "border-[#16DB93] bg-[rgba(22,219,147,0.05)]" : "border-[rgba(22,219,147,0.1)] hover:border-[rgba(22,219,147,0.3)]"}`}
                >
                  {fp.name === "VIP" && (
                    <div className="text-[10px] uppercase tracking-widest bg-[#16DB93] text-black px-2 py-0.5 rounded-full w-fit mb-3 font-bold">
                      Most Popular
                    </div>
                  )}
                  <div className="font-bold text-lg mb-1">{fp.name}</div>
                  <div className="text-xs text-muted-foreground mb-4">{fp.note}</div>

                  <PlanBarChart heights={fp.barHeights} color={fp.color} active={isActive} />

                  <div className="mt-4 space-y-1.5">
                    {fp.features.slice(0, 3).map(f => (
                      <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-4 w-4 rounded-full bg-[rgba(22,219,147,0.15)] grid place-items-center shrink-0">
                          <Check className="h-2.5 w-2.5 text-[#16DB93]" strokeWidth={3} />
                        </span>
                        {f}
                      </div>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    className={`w-full mt-4 ${isActive ? "gold-gradient text-white" : "border border-[rgba(22,219,147,0.2)] hover:border-[rgba(22,219,147,0.5)] hover:text-[#16DB93]"} transition-colors`}
                    variant={isActive ? "default" : "outline"}
                  >
                    {isActive ? "Selected" : "Select plan"}
                  </Button>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Investment form */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
          <Card className="surface-card border-[rgba(22,219,147,0.1)]">
            <CardContent className="p-8 space-y-7">
              {/* Plan selector */}
              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground uppercase tracking-wider text-xs">Choose plan</label>
                <div className="grid sm:grid-cols-3 gap-2">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setPlanId(p.id); if (amount < p.min_amount) setAmount(p.min_amount); }}
                      className={`text-left p-4 rounded-lg border transition-colors duration-200 ${planId === p.id ? "border-[#16DB93] bg-[rgba(22,219,147,0.05)]" : "border-white/10 hover:border-[rgba(22,219,147,0.3)]"}`}
                    >
                      <div className="font-bold">{p.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Min ${p.min_amount} · {p.roi_percent}%/mo</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground uppercase tracking-wider text-xs">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
                  <input
                    type="number"
                    value={amount}
                    min={plan?.min_amount}
                    onChange={(e) => setAmount(+e.target.value || 0)}
                    className="w-full bg-input/50 border border-[rgba(22,219,147,0.12)] focus:border-[#16DB93] rounded-md pl-8 pr-4 py-3 text-lg outline-none transition-colors"
                  />
                </div>
                {plan && amount < plan.min_amount && (
                  <p className="text-xs text-amber-400 mt-1">Minimum for {plan.name} is ${plan.min_amount}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground uppercase tracking-wider text-xs">Duration</label>
                <div className="grid grid-cols-5 gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`py-3 rounded-md border text-sm transition-colors duration-200 ${duration === d ? "gold-gradient text-white border-transparent font-semibold" : "border-[rgba(0,0,0,0.12)] text-muted-foreground hover:border-[rgba(22,219,147,0.3)] hover:text-[#16DB93]"}`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust badges row */}
              <div className="flex flex-wrap gap-4 py-2 border-y border-[rgba(22,219,147,0.06)]">
                {[
                  { icon: Clock,   label: "72-hr payout" },
                  { icon: Shield,  label: "Secured funds" },
                  { icon: Zap,     label: "Instant start" },
                  { icon: TrendingUp, label: "High returns" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 text-[#16DB93]" />
                    {label}
                  </div>
                ))}
              </div>

              {/* Return estimate */}
              <div className="rounded-xl border border-[rgba(22,219,147,0.15)] bg-[rgba(22,219,147,0.03)] p-6 flex justify-between items-center">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Estimated return</div>
                  <div className="text-4xl font-bold gold-text">
                    +<AnimatedReturn value={estimated} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total payout</div>
                  <div className="font-bold text-xl">${(amount + estimated).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">in {duration} days</div>
                </div>
              </div>

              <Button
                onClick={submit}
                disabled={loading || !plan}
                className="w-full gold-gradient text-white hover:opacity-90 h-12 text-base font-semibold animate-glow-pulse"
              >
                {loading ? "Processing…" : "Confirm investment"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          className="mt-8 grid sm:grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {["Returns paid within 72 hours", "Copy trading from institutional desks", "Fully non-custodial — you keep keys", "24/7 live support team"].map(f => (
            <FeaturePill key={f} label={f} />
          ))}
        </motion.div>
      </section>
    </SiteLayout>
  );
}
