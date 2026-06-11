import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StatusBadge } from "./deposit";

type Coin = "BTC" | "ETH" | "USDT" | "BNB";
type W = { id: string; coin: Coin; amount: number; status: string; created_at: string; wallet_address: string };

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
      <section className="mx-auto max-w-5xl px-4 py-12 grid lg:grid-cols-2 gap-6">
        <Card className="surface-card border-white/5"><CardContent className="p-8">
          <h1 className="text-2xl font-bold mb-1">Withdraw funds</h1>
          <p className="text-sm text-muted-foreground mb-6">Available: <span className="text-[var(--gold)] font-semibold">${balance.toLocaleString()}</span></p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Coin</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {(["BTC","ETH","USDT","BNB"] as Coin[]).map((c) => (
                  <button type="button" key={c} onClick={() => setCoin(c)} className={`py-3 rounded-md border ${coin === c ? "gold-gradient text-black border-transparent font-semibold" : "border-white/10"}`}>{c}</button>
                ))}
              </div>
            </div>
            <div><Label>Amount (USD)</Label><Input type="number" value={amount || ""} onChange={(e) => setAmount(+e.target.value || 0)} required min={1} max={balance} /></div>
            <div><Label>Your {coin} wallet address</Label><Input value={addr} onChange={(e) => setAddr(e.target.value)} required placeholder={`Your ${coin} address`} /></div>
            <Button disabled={loading} type="submit" className="w-full gold-gradient text-black hover:opacity-90">{loading ? "Submitting..." : "Request withdrawal"}</Button>
          </form>
        </CardContent></Card>

        <Card className="surface-card border-white/5"><CardContent className="p-8">
          <h2 className="text-lg font-bold mb-4">Withdrawal history</h2>
          {rows.length === 0 ? <div className="text-sm text-muted-foreground">No withdrawals yet.</div> : (
            <div className="space-y-3 text-sm">
              {rows.map((r) => (
                <div key={r.id} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                  <div><div className="font-semibold">${r.amount.toLocaleString()} {r.coin}</div><div className="text-xs text-muted-foreground break-all">{r.wallet_address.slice(0, 20)}...</div></div>
                  <StatusBadge s={r.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      </section>
    </SiteLayout>
  );
}
