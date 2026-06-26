import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Briefcase, Wallet, TrendingUp, CalendarDays, Repeat, CheckCircle2,
  ChevronDown, ChevronRight, ArrowRight, Check,
} from "lucide-react";
import {
  COIN_META, expectedReturn, formatMoney, paymentKey,
  type CryptoWallet, type Plan,
} from "@/lib/invest";

export const Route = createFileRoute("/_authenticated/invest/new")({
  component: NewInvestment,
});

const TEAL = "#0D9488";

function NewInvestment() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [planId, setPlanId] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [planOpen, setPlanOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: pl }, { data: wl }] = await Promise.all([
        supabase.from("plans").select("*").eq("active", true).order("sort_order"),
        supabase.from("crypto_wallets").select("*").eq("is_active", true).order("sort_order"),
      ]);
      setPlans((pl as Plan[]) || []);
      setWallets((wl as CryptoWallet[]) || []);
    })();
  }, []);

  const plan = useMemo(() => plans.find((p) => p.id === planId), [plans, planId]);
  const wallet = useMemo(() => wallets.find((w) => paymentKey(w) === paymentId), [wallets, paymentId]);
  const amt = parseFloat(amount) || 0;

  // Auto-populate min on plan change
  useEffect(() => {
    if (plan && !amount) setAmount(String(plan.min_amount));
  }, [plan]); // eslint-disable-line react-hooks/exhaustive-deps

  const inRange = plan ? amt >= Number(plan.min_amount) && (plan.max_amount == null || amt <= Number(plan.max_amount)) : false;
  const earn = plan && inRange ? expectedReturn(amt, Number(plan.roi_percent)) : 0;

  const canSubmit = !!plan && !!wallet && inRange && !submitting;

  const submit = async () => {
    if (!plan || !wallet) return;
    setSubmitting(true);
    const { data, error } = await supabase.rpc("create_pending_investment", {
      _plan_id: plan.id,
      _amount: amt,
      _payment_method: paymentKey(wallet),
      _wallet_address: wallet.wallet_address || undefined,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Investment created — complete your payment");
    navigate({ to: "/invest/deposit/$id", params: { id: String(data) } });
  };

  return (
    <SiteLayout>
      <div className="min-h-screen bg-[#F4F6F8]">
        <section className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10 space-y-5">
          <header className="space-y-1">
            <div className="text-[10px] font-semibold tracking-[0.22em] uppercase" style={{ color: TEAL }}>Step 1 of 3</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">New Investment Plan</h1>
            <p className="text-sm text-slate-500">Choose a plan, crypto, and amount. Your funds remain pending until payment is confirmed.</p>
          </header>

          {/* Plan selection */}
          <Card className="bg-white border-slate-200/70 shadow-sm rounded-2xl">
            <CardContent className="p-5 space-y-3">
              <Label className="text-[10px] uppercase tracking-widest text-slate-400">Select Plan</Label>

              <button
                type="button"
                onClick={() => setPlanOpen((v) => !v)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-between hover:border-slate-300 transition"
              >
                {plan ? (
                  <span className="flex items-center gap-3 min-w-0 text-left">
                    <span className="h-9 w-9 shrink-0 rounded-lg grid place-items-center" style={{ background: `${TEAL}15`, color: TEAL }}>
                      <Briefcase className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-slate-900 truncate">{plan.name}</span>
                      <span className="block text-xs text-slate-500 truncate">${formatMoney(Number(plan.min_amount))} — ${plan.max_amount ? formatMoney(Number(plan.max_amount)) : "∞"} · {plan.roi_percent}% ROI · {plan.duration_days}d</span>
                    </span>
                  </span>
                ) : (
                  <span className="text-slate-500 text-sm">Choose an investment plan…</span>
                )}
                <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${planOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {planOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-2 pt-1">
                      {plans.map((p) => {
                        const selected = p.id === planId;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => { setPlanId(p.id); setPlanOpen(false); setAmount(String(p.min_amount)); }}
                            className={`text-left rounded-xl border p-3 transition ${selected ? "border-[color:var(--ring-teal)] bg-[color:var(--bg-teal)]" : "border-slate-200 bg-white hover:border-slate-300"}`}
                            style={selected ? { borderColor: TEAL, background: `${TEAL}0a` } : undefined}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                                <div className="text-xs font-medium truncate" style={{ color: TEAL }}>
                                  ${formatMoney(Number(p.min_amount))} — {p.max_amount ? `$${formatMoney(Number(p.max_amount))}` : "Unlimited"}
                                </div>
                              </div>
                              <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {p.roi_percent}% ROI
                              </span>
                            </div>
                            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                              <span>{p.duration_days} day plan</span>
                              {selected && <span className="inline-flex items-center gap-1 font-semibold" style={{ color: TEAL }}><Check className="h-3 w-3" />Selected</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Plan summary */}
          {plan && (
            <Card className="bg-white border-slate-200/70 shadow-sm rounded-2xl overflow-hidden">
              <div className="border-l-4" style={{ borderColor: TEAL }}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-widest text-slate-400">Selected plan</div>
                      <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                      <div className="text-sm text-slate-500 mt-1">
                        ${formatMoney(Number(plan.min_amount))} — {plan.max_amount ? `$${formatMoney(Number(plan.max_amount))}` : "Unlimited"} · {plan.roi_percent}% ROI · {plan.duration_days} days
                      </div>
                    </div>
                    <button onClick={() => setPlanOpen(true)} className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2 shrink-0">Change Plan</button>
                  </div>
                </CardContent>
              </div>
            </Card>
          )}

          {/* Payment method */}
          <Card className="bg-white border-slate-200/70 shadow-sm rounded-2xl">
            <CardContent className="p-5 space-y-3">
              <Label className="text-[10px] uppercase tracking-widest text-slate-400">Select Payment Method</Label>
              {wallets.length === 0 ? (
                <div className="text-sm text-slate-500 py-6 text-center">No payment methods configured yet.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {wallets.map((w) => {
                    const m = COIN_META[w.symbol] ?? COIN_META.BTC;
                    const key = paymentKey(w);
                    const selected = key === paymentId;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPaymentId(key)}
                        className={`relative rounded-xl border p-3 flex flex-col items-center gap-1.5 transition ${selected ? "shadow-sm" : "hover:border-slate-300"}`}
                        style={{
                          borderColor: selected ? TEAL : "rgb(226 232 240)",
                          background: selected ? `${TEAL}0a` : "white",
                        }}
                      >
                        {selected && (
                          <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full grid place-items-center text-white" style={{ background: TEAL }}>
                            <Check className="h-2.5 w-2.5" strokeWidth={3} />
                          </span>
                        )}
                        <span className="h-9 w-9 rounded-full grid place-items-center font-bold text-base" style={{ background: m.bgSoft, color: m.color }}>{m.sym}</span>
                        <span className="text-sm font-semibold text-slate-900 leading-tight">{w.symbol}</span>
                        <span className="text-[10px] text-slate-500 leading-none">{w.network}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deposit amount */}
          <Card className="bg-white border-slate-200/70 shadow-sm rounded-2xl">
            <CardContent className="p-5 space-y-3">
              <Label className="text-[10px] uppercase tracking-widest text-slate-400">Deposit Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-8 pr-20 h-12 text-base"
                  style={{
                    borderColor: plan && amount && !inRange ? "#EF4444" : "rgb(226 232 240)",
                  }}
                />
                {wallet && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold rounded-full px-2.5 py-1" style={{ background: COIN_META[wallet.symbol]?.bgSoft, color: COIN_META[wallet.symbol]?.color }}>
                    {wallet.symbol}
                  </span>
                )}
              </div>
              {plan && (
                <div className="text-xs text-slate-500">
                  Min: <span className="font-semibold text-slate-700">${formatMoney(Number(plan.min_amount))}</span>
                  {plan.max_amount && <> — Max: <span className="font-semibold text-slate-700">${formatMoney(Number(plan.max_amount))}</span></>}
                </div>
              )}
              {plan && amount && !inRange && (
                <div className="text-xs text-red-500">Amount must be between ${formatMoney(Number(plan.min_amount))}{plan.max_amount ? ` and $${formatMoney(Number(plan.max_amount))}` : ""}.</div>
              )}
            </CardContent>
          </Card>

          {/* Order summary */}
          {plan && wallet && inRange && (
            <Card className="bg-white border-slate-200/70 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-3">Order Summary</div>
                <ul className="divide-y divide-slate-100">
                  <SummaryRow icon={Briefcase} label="Plan" value={plan.name} />
                  <SummaryRow icon={Wallet} label="Deposit Amount" value={`$${formatMoney(amt)}`} />
                  <SummaryRow icon={TrendingUp} label="Expected ROI" value={`${plan.roi_percent}%`} />
                  <SummaryRow icon={CalendarDays} label="Duration" value={`${plan.duration_days} days`} />
                  <SummaryRow icon={Repeat} label="Payment via" value={`${wallet.coin_name} (${wallet.symbol} · ${wallet.network})`} />
                  <SummaryRow icon={CheckCircle2} label="You will receive" value={`$${formatMoney(earn)}`} accent />
                </ul>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={submit}
            disabled={!canSubmit}
            className="w-full h-13 py-3.5 rounded-full text-base font-bold text-white shadow-md disabled:opacity-50"
            style={{ background: canSubmit ? `linear-gradient(135deg, ${TEAL} 0%, #0FB5A1 100%)` : "#94A3B8" }}
          >
            {submitting ? "Creating…" : (<>Proceed to Deposit <ArrowRight className="ml-2 h-4 w-4 inline" /></>)}
          </Button>
        </section>
      </div>
    </SiteLayout>
  );
}

function SummaryRow({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <li className="flex items-center justify-between py-2.5 gap-3">
      <span className="flex items-center gap-2 min-w-0 text-sm text-slate-600">
        <Icon className="h-4 w-4 shrink-0" style={{ color: TEAL }} />
        <span className="truncate">{label}</span>
      </span>
      <span className={`text-sm font-semibold text-right shrink-0 ${accent ? "" : "text-slate-900"}`} style={accent ? { color: TEAL } : undefined}>{value}</span>
    </li>
  );
}
