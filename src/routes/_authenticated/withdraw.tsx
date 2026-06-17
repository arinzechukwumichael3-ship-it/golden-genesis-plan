import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StatusBadge } from "./deposit";
import { Clock, Shield, ArrowUpFromLine } from "lucide-react";

type Coin = "BTC" | "ETH" | "USDT" | "BNB";
type W = { id: string; coin: Coin; amount: number; status: string; created_at: string; wallet_address: string };

const COIN_DOT: Record<Coin, string> = {
  BTC:  "#F7931A",
  ETH:  "#627EEA",
  USDT: "#26A17B",
  BNB:  "#F3BA2F",
};

export const Route = createFileRoute("/_authenticated/withdraw")({
  component: Withdraw,
});

function Withdraw() {
  const [coin, setCoin] = useState<Coin>("BTC");
  const [amount, setAmount] = useState<number>(0);
  const [addr, setAddr] = useState("");
  const [balance, setBalance] = useState(0);
  const [rows, setRows] = useState<W[]>([]);
  const [loading, setLoading] = useState(false);

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

  const pct = balance > 0 ? Math.min(100, (amount / balance) * 100) : 0;

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

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-12">
        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <div className="text-xs uppercase tracking-widest text-[#16DB93] mb-2">Payout Portal</div>
          <h1 className="text-3xl font-bold mb-1">Withdraw funds</h1>
          <p className="text-sm text-muted-foreground">Withdrawals are processed within 72 hours after approval.</p>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap gap-5 mb-8 text-xs text-muted-foreground"
        >
          {[
            { icon: Shield,          label: "Verified identity required" },
            { icon: Clock,           label: "72-hour processing window"  },
            { icon: ArrowUpFromLine, label: "Direct to your wallet"      },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-[#16DB93]" />
              {label}
            </div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Withdraw form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <Card className="surface-card border-[rgba(22,219,147,0.1)] h-full">
              <CardContent className="p-8">
                {/* Available balance display */}
                <div className="rounded-xl border border-[rgba(22,219,147,0.15)] bg-[rgba(22,219,147,0.03)] p-5 mb-6">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Available balance</div>
                  <div className="text-3xl font-bold gold-text">${balance.toLocaleString()}</div>
                  {amount > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Withdrawing</span>
                        <span>${amount.toLocaleString()} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          className="h-full gold-gradient rounded-full"
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={submit} className="space-y-5">
                  {/* Coin selector */}
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Coin</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["BTC", "ETH", "USDT", "BNB"] as Coin[]).map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setCoin(c)}
                          className={`py-3 rounded-lg border text-sm font-medium transition-all duration-200 flex flex-col items-center gap-1 ${
                            coin === c
                              ? "border-[#16DB93] bg-[rgba(22,219,147,0.08)] text-white"
                              : "border-white/10 text-muted-foreground hover:border-[rgba(22,219,147,0.3)] hover:text-white"
                          }`}
                        >
                          <span className="h-2 w-2 rounded-full" style={{ background: COIN_DOT[c] }} />
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Amount (USD)</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        value={amount || ""}
                        onChange={(e) => setAmount(+e.target.value || 0)}
                        required
                        min={1}
                        max={balance}
                        className="pl-7 border-[rgba(22,219,147,0.12)] focus:border-[#16DB93] bg-input/50 transition-colors"
                      />
                    </div>
                    {amount > balance && (
                      <p className="text-xs text-red-400 mt-1">Amount exceeds available balance</p>
                    )}
                  </div>

                  {/* Quick amount buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {[25, 50, 75, 100].map(pctBtn => {
                      const val = Math.floor(balance * pctBtn / 100);
                      return (
                        <button
                          type="button"
                          key={pctBtn}
                          onClick={() => setAmount(val)}
                          className="text-xs px-3 py-1.5 rounded-full border border-[rgba(22,219,147,0.15)] text-muted-foreground hover:border-[rgba(22,219,147,0.4)] hover:text-[#16DB93] transition-colors"
                        >
                          {pctBtn}% (${val.toLocaleString()})
                        </button>
                      );
                    })}
                  </div>

                  {/* Wallet address */}
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Your {coin} wallet address</Label>
                    <Input
                      value={addr}
                      onChange={(e) => setAddr(e.target.value)}
                      required
                      placeholder={`Your ${coin} address`}
                      className="mt-1.5 border-[rgba(22,219,147,0.12)] focus:border-[#16DB93] bg-input/50 font-mono text-sm transition-colors"
                    />
                  </div>

                  <Button
                    disabled={loading || amount <= 0 || amount > balance}
                    type="submit"
                    className="w-full gold-gradient text-white hover:opacity-90 h-11 font-semibold"
                  >
                    {loading ? "Submitting…" : "Request withdrawal"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Withdrawal history */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="surface-card border-[rgba(22,219,147,0.08)] h-full">
              <CardContent className="p-8">
                <h2 className="text-lg font-bold mb-5">Withdrawal history</h2>
                {rows.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-12 text-center">
                    No withdrawals yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rows.map((r) => (
                      <div key={r.id} className="flex justify-between items-center py-3 border-b border-[rgba(22,219,147,0.05)] last:border-0">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-full border border-white/10 grid place-items-center"
                            style={{ background: `${COIN_DOT[r.coin]}18` }}
                          >
                            <span className="h-2 w-2 rounded-full" style={{ background: COIN_DOT[r.coin] }} />
                          </div>
                          <div>
                            <div className="font-semibold text-sm">${r.amount.toLocaleString()} <span className="text-muted-foreground font-normal">{r.coin}</span></div>
                            <div className="text-xs text-muted-foreground font-mono">{r.wallet_address.slice(0, 18)}…</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <StatusBadge s={r.status} />
                          <div className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Processing info */}
                <div className="mt-8 pt-6 border-t border-[rgba(22,219,147,0.06)]">
                  <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Processing timeline</h3>
                  <div className="space-y-3">
                    {[
                      { n: "01", text: "Request reviewed within 24h" },
                      { n: "02", text: "Funds sent to your wallet" },
                      { n: "03", text: "On-chain confirmation in minutes" },
                    ].map(({ n, text }) => (
                      <div key={n} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#16DB93] tabular-nums w-6">{n}</span>
                        <span className="text-sm text-muted-foreground">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
