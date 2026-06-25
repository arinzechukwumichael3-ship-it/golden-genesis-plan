import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StatusBadge } from "./deposit";
import { Clock, Shield, ArrowUpFromLine, Wallet } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

type Coin = "BTC" | "ETH" | "USDT" | "BNB";
type W = { id: string; coin: Coin; amount: number; status: string; created_at: string; wallet_address: string };

const COIN_DOT: Record<Coin, string> = {
  BTC:  "#F7931A",
  ETH:  "#627EEA",
  USDT: "#26A17B",
  BNB:  "#F3BA2F",
};
const COIN_SYM: Record<Coin, string> = { BTC: "₿", ETH: "Ξ", USDT: "₮", BNB: "⬡" };

export const Route = createFileRoute("/_authenticated/withdraw")({
  component: Withdraw,
});

function BalanceCard({ balance, coin, amount }: { balance: number; coin: Coin; amount: number }) {
  const pct = balance > 0 ? Math.min(100, (amount / balance) * 100) : 0;

  return (
    <motion.div
      layout
      className="relative rounded-2xl overflow-hidden mb-6"
      style={{
        background: "linear-gradient(135deg, #0D1B3E 0%, #0a1428 55%, rgba(22,219,147,0.08) 100%)",
        border: "1px solid rgba(22,219,147,0.2)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(22,219,147,0.08)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 90% 10%, rgba(22,219,147,0.15) 0%, transparent 55%)" }} />

      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #16DB93 0%, transparent 70%)" }} />
      <div className="absolute -right-4 -bottom-6 h-24 w-24 rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(circle, #16DB93 0%, transparent 70%)" }} />

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#16DB93]/70 mb-1">Available balance</div>
            <div className="text-4xl font-bold text-white tracking-tight">${balance.toLocaleString()}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-[rgba(22,219,147,0.1)] border border-[rgba(22,219,147,0.2)] grid place-items-center">
            <Wallet className="h-5 w-5 text-[#16DB93]" />
          </div>
        </div>

        <div className="text-xs text-white/30 mb-4">YieldEmpire Wallet · {coin}</div>

        {amount > 0 ? (
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-white/40">Withdrawing</span>
              <span className="font-semibold" style={{ color: "#16DB93" }}>
                ${amount.toLocaleString()} <span className="text-white/30">({pct.toFixed(0)}%)</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full gold-gradient rounded-full"
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        ) : (
          <div className="h-1.5 rounded-full bg-white/5" />
        )}
      </div>
    </motion.div>
  );
}

function Withdraw() {
  const [coin, setCoin] = useState<Coin>("BTC");
  const [amount, setAmount] = useState<number>(0);
  const [addr, setAddr] = useState("");
  const [balance, setBalance] = useState(0);
  const [rows, setRows] = useState<W[]>([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const [{ data: p }, { data: w }] = await Promise.all([
      supabase.from("profiles").select("balance").eq("id", u.user.id).maybeSingle(),
      supabase.from("withdrawals").select("*").eq("user_id", u.user.id).order("created_at", { ascending: false }).limit(10),
    ]);
    setBalance(p?.balance ?? 0);
    setRows((w as W[]) || []);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addr.trim()) return toast.error("Enter wallet address");
    if (amount <= 0 || amount > balance) return toast.error("Invalid amount");
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setLoading(false); return; }
    const { error } = await supabase.from("withdrawals").insert({ user_id: u.user.id, coin, amount, wallet_address: addr.trim() });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Withdrawal submitted — pending approval");
    setAmount(0); setAddr("");
    load();
  };

  const isDark = theme === "dark";
  const cardCls = `rounded-2xl border p-4 sm:p-7 ${isDark ? "bg-[rgba(10,11,13,0.85)] border-[rgba(22,219,147,0.1)]" : "bg-white border-[rgba(22,219,147,0.12)] shadow-sm"}`;

  return (
    <SiteLayout>
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative rounded-3xl overflow-hidden mb-6 p-5 sm:p-8"

          style={{
            background: "linear-gradient(135deg, #0D1B3E 0%, #0A0B0D 55%, rgba(22,219,147,0.06) 100%)",
            border: "1px solid rgba(22,219,147,0.12)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 85% 50%, rgba(22,219,147,0.1) 0%, transparent 55%)" }} />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[#16DB93] mb-2 font-semibold">Payout Portal</div>
            <h1 className="text-3xl font-bold mb-2 text-white">Withdraw funds</h1>
            <p className="text-sm text-white/50 max-w-md">Request a withdrawal to your personal crypto wallet. Processed within 72 hours after approval.</p>
            <div className="flex flex-wrap gap-6 mt-5 text-xs text-white/50">
              {[
                { icon: Shield,          label: "Identity verified" },
                { icon: Clock,           label: "72-hour processing" },
                { icon: ArrowUpFromLine, label: "Direct to your wallet" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-[#16DB93]" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className={cardCls}>
              {/* Premium balance card */}
              <BalanceCard balance={balance} coin={coin} amount={amount} />

              <form onSubmit={submit} className="space-y-5">
                {/* Coin selector */}
                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 block">Coin</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["BTC", "ETH", "USDT", "BNB"] as Coin[]).map((c) => {
                      const active = c === coin;
                      return (
                        <motion.button
                          type="button"
                          key={c}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setCoin(c)}
                          className="relative rounded-xl border py-3 px-2 flex flex-col items-center gap-1.5 transition-all duration-200"
                          style={{
                            borderColor: active ? COIN_DOT[c] : "rgba(255,255,255,0.08)",
                            background: active ? `${COIN_DOT[c]}18` : "transparent",
                            boxShadow: active ? `0 0 14px ${COIN_DOT[c]}25` : "none",
                          }}
                        >
                          <span className="text-xl font-bold leading-none" style={{ color: COIN_DOT[c] }}>{COIN_SYM[c]}</span>
                          <span className="text-[11px] font-semibold" style={{ color: active ? "white" : "rgba(255,255,255,0.4)" }}>{c}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Amount (USD)</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={amount || ""}
                      onChange={(e) => setAmount(+e.target.value || 0)}
                      required min={1} max={balance}
                      placeholder="0.00"
                      className="pl-8 h-12 border-[rgba(22,219,147,0.12)] focus:border-[#16DB93] bg-transparent text-sm"
                    />
                  </div>
                  {amount > balance && (
                    <p className="text-xs text-red-400 mt-1.5">Amount exceeds available balance</p>
                  )}
                </div>

                {/* Quick % buttons */}
                <div className="flex gap-2 flex-wrap">
                  {[25, 50, 75, 100].map(pct => {
                    const val = Math.floor(balance * pct / 100);
                    return (
                      <button
                        type="button"
                        key={pct}
                        onClick={() => setAmount(val)}
                        className="text-xs px-3 py-1.5 rounded-full border border-[rgba(22,219,147,0.15)] text-muted-foreground hover:border-[rgba(22,219,147,0.45)] hover:text-[#16DB93] transition-all duration-200"
                      >
                        {pct}% · ${val.toLocaleString()}
                      </button>
                    );
                  })}
                </div>

                {/* Wallet address */}
                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Your {coin} wallet address</Label>
                  <Input
                    value={addr}
                    onChange={(e) => setAddr(e.target.value)}
                    required
                    placeholder={`Your ${coin} address`}
                    className="mt-1.5 h-12 border-[rgba(22,219,147,0.12)] focus:border-[#16DB93] bg-transparent font-mono text-sm"
                  />
                </div>

                <Button
                  disabled={loading || amount <= 0 || amount > balance}
                  type="submit"
                  className="w-full gold-gradient text-white hover:opacity-90 h-12 font-semibold"
                >
                  {loading ? "Submitting…" : "Request withdrawal"}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Right: history + timeline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="flex flex-col gap-5"
          >
            {/* Processing timeline */}
            <div className={cardCls}>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-5">Processing timeline</div>
              <div className="space-y-5">
                {[
                  { n: "01", title: "Submit request",      desc: "Fill in amount and wallet address below" },
                  { n: "02", title: "Admin review",        desc: "Verified within 24 hours" },
                  { n: "03", title: "Funds dispatched",    desc: "Sent directly to your wallet" },
                  { n: "04", title: "On-chain confirm",    desc: "Network confirmation in minutes" },
                ].map(({ n, title, desc }, i) => (
                  <motion.div
                    key={n}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-start gap-4"
                  >
                    <div className="shrink-0 h-8 w-8 rounded-full border border-[rgba(22,219,147,0.3)] bg-[rgba(22,219,147,0.06)] grid place-items-center">
                      <span className="text-[10px] font-bold text-[#16DB93]">{n}</span>
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="text-sm font-semibold">{title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Withdrawal history */}
            <div className={`${cardCls} flex-1`}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold">Withdrawal history</h2>
                {rows.length > 0 && <span className="text-xs text-muted-foreground">{rows.length} total</span>}
              </div>
              {rows.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="h-10 w-10 rounded-full bg-[rgba(22,219,147,0.06)] grid place-items-center mx-auto mb-3">
                    <ArrowUpFromLine className="h-4 w-4 text-muted-foreground/30" />
                  </div>
                  <div className="text-sm text-muted-foreground">No withdrawals yet</div>
                </div>
              ) : (
                <div className="space-y-1">
                  {rows.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="flex justify-between items-center py-3 border-b border-[rgba(22,219,147,0.05)] last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 rounded-xl grid place-items-center text-base font-bold border shrink-0"
                          style={{ background: `${COIN_DOT[r.coin]}18`, borderColor: `${COIN_DOT[r.coin]}30`, color: COIN_DOT[r.coin] }}
                        >
                          {COIN_SYM[r.coin]}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">${r.amount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground font-mono">{r.wallet_address.slice(0, 14)}…</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge s={r.status} />
                        <div className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
