import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    entries: ["€500 → €1,000", "€600 → €1,500", "€700 → €1,800", "€800 → €2,000", "€900 → €2,500"],
    note: "USDT copy trading — paid within 72 hours",
  },
  {
    name: "VIP",
    slug: "vip",
    entries: [
      "€1,000 → €5,000",
      "€1,500 → €7,000",
      "€2,000 → €10,000",
      "€3,000 → €15,000",
      "€4,000 → €20,000",
      "€5,000 → €50,000",
      "€10,000 → €100,000",
    ],
    note: "Elite USDT tiers — highest multipliers",
  },
  {
    name: "Premium",
    slug: "premium",
    entries: ["1 BTC → 3 BTC", "2 BTC → 6 BTC", "3 BTC → 9 BTC", "4 BTC → 12 BTC", "5 BTC → 15 BTC"],
    note: "BTC-only premium copy trading — 72-hour payouts",
  },
];

export const Route = createFileRoute("/_authenticated/invest")({
  validateSearch: search,
  component: Invest,
});

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
      const initial = sp.plan ? (data || []).find(p => p.slug === sp.plan) : data?.[0];
      if (initial) { setPlanId(initial.id); if (!sp.amount) setAmount(initial.min_amount); }
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        const { data: p } = await supabase.from("profiles").select("balance").eq("id", u.user.id).maybeSingle();
        setBalance(p?.balance ?? 0);
      }
    })();
  }, [sp.plan, sp.amount]);

  function parseInvestAmount(entry: string) {
    // entry examples: "€500 → €1,000" or "1 BTC → 3 BTC"
    const m = entry.match(/€?([0-9,.]+)\s*(BTC)?/i);
    if (!m) return undefined;
    const raw = m[1].replace(/,/g, "");
    return parseFloat(raw);
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
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">New investment</h1>
        <p className="text-sm text-muted-foreground mb-8">Available balance: <span className="text-[var(--gold)] font-semibold">${balance.toLocaleString()}</span></p>

        {/* Frontend tier quick-selects */}
        <div className="mb-8 grid sm:grid-cols-3 gap-4">
          {FRONTEND_PLANS.map((fp) => (
            <div key={fp.slug} className={`p-4 rounded-lg border ${selectedFrontendPlan === fp.slug ? "border-[var(--gold)] bg-[var(--gold)]/5" : "border-white/10"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold">{fp.name}</div>
                <div className="text-xs text-muted-foreground">{fp.note}</div>
              </div>
              <div className="text-sm mb-3 space-y-1">
                {fp.entries.slice(0, 3).map((e) => <div key={e} className="flex justify-between"><span>{e.split('→')[0].trim()}</span><span className="font-semibold text-[var(--gold)]">{e.split('→')[1].trim()}</span></div>)}
                {fp.entries.length > 3 && <div className="text-xs text-muted-foreground">+{fp.entries.length - 3} more tiers</div>}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  setSelectedFrontendPlan(fp.slug);
                  const amt = parseInvestAmount(fp.entries[0]);
                  if (amt) setAmount(amt);
                  setDuration(3);
                  // try to map to a server plan by slug or name
                  const matched = plans.find(pl => (pl.slug && pl.slug.toLowerCase() === fp.slug) || pl.name.toLowerCase() === fp.name.toLowerCase());
                  if (matched) {
                    setPlanId(matched.id);
                    if (amt && amt < matched.min_amount) setAmount(matched.min_amount);
                  }
                }} className="w-full gold-gradient text-black">Select tier</Button>
                <Button variant="outline" className="px-3" asChild><a href="#plans">Details</a></Button>
              </div>
            </div>
          ))}
        </div>

        <Card className="surface-card border-white/5"><CardContent className="p-8 space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Choose plan</label>
            <div className="grid sm:grid-cols-3 gap-2">
              {plans.map((p) => (
                <button key={p.id} onClick={() => { setPlanId(p.id); if (amount < p.min_amount) setAmount(p.min_amount); }}
                  className={`text-left p-4 rounded-lg border ${planId === p.id ? "border-[var(--gold)] bg-[var(--gold)]/5" : "border-white/10"}`}>
                  <div className="font-bold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">Min ${p.min_amount} · {p.roi_percent}%/mo</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Amount (USD)</label>
            <input type="number" value={amount} min={plan?.min_amount} onChange={(e) => setAmount(+e.target.value || 0)}
              className="w-full bg-input/50 border border-white/10 rounded-md px-3 py-3 text-lg" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Duration</label>
            <div className="grid grid-cols-5 gap-2">
              {DURATIONS.map((d) => (
                <button key={d} onClick={() => setDuration(d)}
                  className={`py-3 rounded-md border text-sm ${duration === d ? "gold-gradient text-black border-transparent font-semibold" : "border-white/10"}`}>{d}d</button>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-lg p-5 flex justify-between items-center">
            <div>
              <div className="text-xs text-muted-foreground">Estimated return</div>
              <div className="text-3xl font-bold gold-text">+${estimated.toLocaleString()}</div>
            </div>
            <div className="text-right text-sm">
              <div className="text-muted-foreground">Total payout</div>
              <div className="font-bold text-lg">${(amount + estimated).toLocaleString()}</div>
            </div>
          </div>

          <Button onClick={submit} disabled={loading || !plan} className="w-full gold-gradient text-black hover:opacity-90 h-12">{loading ? "Processing..." : "Confirm investment"}</Button>
        </CardContent></Card>
      </section>
    </SiteLayout>
  );
}
