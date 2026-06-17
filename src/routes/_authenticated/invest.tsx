import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, animate, useInView } from "framer-motion";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, TrendingUp, Clock, Zap, Shield, ChevronRight } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

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
    tier: "Starter",
    featured: false,
    dotColor: "rgba(22,219,147,0.7)",
    glowColor: "rgba(22,219,147,0.2)",
    features: ["USDT copy trading", "72-hour payouts", "5 return tiers", "Email support"],
    entries: ["€500 → €1,000", "€600 → €1,500", "€700 → €1,800", "€800 → €2,000", "€900 → €2,500"],
    note: "Paid within 72 hours",
    barHeights: [28, 36, 44, 52, 64],
  },
  {
    name: "VIP",
    slug: "vip",
    tier: "Most Popular",
    featured: true,
    dotColor: "#16DB93",
    glowColor: "rgba(22,219,147,0.35)",
    features: ["Elite USDT tiers", "Priority payouts", "7 return tiers", "Dedicated support"],
    entries: [
      "€1,000 → €5,000", "€1,500 → €7,000", "€2,000 → €10,000",
      "€3,000 → €15,000", "€4,000 → €20,000", "€5,000 → €50,000", "€10,000 → €100,000",
    ],
    note: "Highest multipliers",
    barHeights: [30, 42, 55, 68, 78, 88, 100],
  },
  {
    name: "Premium",
    slug: "premium",
    tier: "BTC Only",
    featured: false,
    dotColor: "#F7931A",
    glowColor: "rgba(247,147,26,0.2)",
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

function PlanBarChart({ heights, dotColor, active }: { heights: number[]; dotColor: string; active: boolean }) {
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
          transition={{ delay: 0.12 + i * 0.07, duration: 0.5, ease: "easeOut" }}
          style={{
            background: active
              ? `linear-gradient(to top, ${dotColor}, ${dotColor}99)`
              : `rgba(22,219,147,${0.08 + i * 0.04})`,
          }}
        />
      ))}
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
  const { theme } = useTheme();

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

  const isDark = theme === "dark";
  const cardCls = `rounded-2xl border ${isDark ? "bg-[rgba(10,11,13,0.85)] border-[rgba(22,219,147,0.1)]" : "bg-white border-[rgba(22,219,147,0.12)] shadow-sm"}`;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-10">
        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative rounded-3xl overflow-hidden mb-8 p-8"
          style={{
            background: "linear-gradient(135deg, #0D1B3E 0%, #0A0B0D 55%, rgba(22,219,147,0.06) 100%)",
            border: "1px solid rgba(22,219,147,0.12)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 85% 50%, rgba(22,219,147,0.1) 0%, transparent 55%)" }} />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#16DB93] mb-2 font-semibold">Investment Portal</div>
              <h1 className="text-3xl font-bold mb-2 text-white">New investment</h1>
              <p className="text-sm text-white/50">Select a plan, set your amount, and start earning returns in 72 hours.</p>
            </div>
            <div className="shrink-0 text-right hidden sm:block">
              <div className="text-[10px] uppercase tracking-widest text-[#16DB93]/60 mb-1">Available</div>
              <div className="text-2xl font-bold gold-text">${balance.toLocaleString()}</div>
            </div>
          </div>
        </motion.div>

        {/* Plan cards */}
        <motion.div
          className="grid sm:grid-cols-3 gap-4 mb-8"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {FRONTEND_PLANS.map((fp) => {
            const isActive = selectedFrontendPlan === fp.slug;
            return (
              <motion.div
                key={fp.slug}
                variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
              >
                <motion.div
                  whileHover={{ y: -6, rotateX: 1 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.22 }}
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
                  className={`cursor-pointer rounded-2xl border p-5 relative overflow-hidden transition-all duration-300 ${
                    isActive
                      ? "border-[rgba(22,219,147,0.4)]"
                      : fp.featured
                        ? "border-[rgba(22,219,147,0.2)]"
                        : "border-[rgba(22,219,147,0.08)] hover:border-[rgba(22,219,147,0.2)]"
                  } ${isDark ? "bg-[rgba(10,11,13,0.85)]" : "bg-white shadow-sm"}`}
                  style={{
                    perspective: 800,
                    boxShadow: isActive
                      ? `0 0 0 1px ${fp.dotColor}40, 0 8px 32px ${fp.glowColor}`
                      : fp.featured && !isActive
                        ? "0 4px 24px rgba(22,219,147,0.1)"
                        : undefined,
                  }}
                >
                  {/* Featured glow background */}
                  {fp.featured && (
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: `radial-gradient(ellipse at 50% 0%, ${fp.glowColor} 0%, transparent 60%)` }} />
                  )}

                  {/* Active / top accent */}
                  {isActive && (
                    <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${fp.dotColor}, transparent)` }} />
                  )}

                  <div className="relative">
                    {/* Tier badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold border"
                        style={{
                          color: fp.dotColor,
                          borderColor: `${fp.dotColor}40`,
                          background: `${fp.dotColor}12`,
                        }}
                      >
                        {fp.tier}
                      </div>
                      {isActive && (
                        <div className="h-5 w-5 rounded-full grid place-items-center" style={{ background: fp.dotColor }}>
                          <Check className="h-3 w-3 text-black" strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <div className="font-bold text-xl mb-0.5">{fp.name}</div>
                    <div className="text-xs text-muted-foreground mb-4">{fp.note}</div>

                    <PlanBarChart heights={fp.barHeights} dotColor={fp.dotColor} active={isActive} />

                    <div className="mt-4 space-y-2">
                      {fp.features.slice(0, 3).map(f => (
                        <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="h-4 w-4 rounded-full grid place-items-center shrink-0" style={{ background: `${fp.dotColor}20` }}>
                            <Check className="h-2.5 w-2.5" style={{ color: fp.dotColor }} strokeWidth={3} />
                          </span>
                          {f}
                        </div>
                      ))}
                    </div>

                    <button
                      className="mt-4 w-full py-2 rounded-xl text-sm font-semibold transition-all duration-200 border"
                      style={isActive
                        ? { background: fp.dotColor, color: "#000", border: `1px solid ${fp.dotColor}` }
                        : { borderColor: `${fp.dotColor}30`, color: fp.dotColor }
                      }
                    >
                      {isActive ? "Selected" : "Select plan"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Investment form */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
          <div className={`${cardCls} p-7`}>
            <div className="space-y-6">
              {/* Plan selector */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 block">Choose plan</label>
                <div className="grid sm:grid-cols-3 gap-2">
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setPlanId(p.id); if (amount < p.min_amount) setAmount(p.min_amount); }}
                      className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                        planId === p.id
                          ? "border-[rgba(22,219,147,0.4)] bg-[rgba(22,219,147,0.05)]"
                          : "border-[rgba(22,219,147,0.08)] hover:border-[rgba(22,219,147,0.25)]"
                      }`}
                    >
                      <div className="font-bold text-sm">{p.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Min ${p.min_amount} · {p.roi_percent}%/mo</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 block">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={amount}
                    min={plan?.min_amount}
                    onChange={(e) => setAmount(+e.target.value || 0)}
                    className="w-full h-14 bg-transparent border border-[rgba(22,219,147,0.12)] focus:border-[#16DB93] rounded-xl pl-8 pr-4 text-lg font-semibold outline-none transition-colors"
                  />
                </div>
                {plan && amount < plan.min_amount && (
                  <p className="text-xs text-amber-400 mt-1.5">Minimum for {plan.name} is ${plan.min_amount}</p>
                )}
                {amount > balance && (
                  <p className="text-xs text-red-400 mt-1.5">Exceeds available balance (${balance.toLocaleString()})</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 block">Duration</label>
                <div className="grid grid-cols-5 gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                        duration === d
                          ? "gold-gradient text-white border-transparent font-semibold"
                          : "border-[rgba(22,219,147,0.1)] text-muted-foreground hover:border-[rgba(22,219,147,0.35)] hover:text-[#16DB93]"
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap gap-5 py-2 border-y border-[rgba(22,219,147,0.06)]">
                {[
                  { icon: Clock,      label: "72-hr payout" },
                  { icon: Shield,     label: "Secured funds" },
                  { icon: Zap,        label: "Instant start" },
                  { icon: TrendingUp, label: "High returns"  },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 text-[#16DB93]" />
                    {label}
                  </div>
                ))}
              </div>

              {/* Return estimate */}
              <motion.div
                layout
                className="relative rounded-2xl overflow-hidden p-6"
                style={{
                  background: "linear-gradient(135deg, rgba(22,219,147,0.06) 0%, rgba(22,219,147,0.02) 100%)",
                  border: "1px solid rgba(22,219,147,0.15)",
                }}
              >
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(22,219,147,0.1) 0%, transparent 55%)" }} />
                <div className="relative flex justify-between items-center gap-6">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Estimated return</div>
                    <div className="text-4xl font-bold gold-text tabular-nums">
                      +<AnimatedReturn value={estimated} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">in {duration} days</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[rgba(22,219,147,0.3)] shrink-0" />
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Total payout</div>
                    <div className="text-2xl font-bold">${(amount + estimated).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground mt-1">Principal + returns</div>
                  </div>
                </div>
              </motion.div>

              <Button
                onClick={submit}
                disabled={loading || !plan}
                className="w-full gold-gradient text-white hover:opacity-90 h-14 text-base font-bold animate-glow-pulse"
              >
                {loading ? "Processing…" : "Confirm investment"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          className="mt-6 grid sm:grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {[
            "Returns paid within 72 hours",
            "Copy trading from institutional desks",
            "Fully non-custodial — you keep keys",
            "24/7 live support team",
          ].map((f) => (
            <div key={f} className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${isDark ? "border-[rgba(22,219,147,0.08)] bg-[rgba(22,219,147,0.02)]" : "border-[rgba(22,219,147,0.1)] bg-[rgba(22,219,147,0.02)]"}`}>
              <span className="text-muted-foreground">{f}</span>
              <span className="h-5 w-5 rounded-full bg-[#16DB93] grid place-items-center shrink-0 ml-3">
                <Check className="h-3 w-3 text-black" strokeWidth={3} />
              </span>
            </div>
          ))}
        </motion.div>
      </section>
    </SiteLayout>
  );
}
