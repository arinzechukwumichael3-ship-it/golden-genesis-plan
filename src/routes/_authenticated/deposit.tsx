import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy } from "lucide-react";

type Coin = "BTC" | "ETH" | "USDT" | "BNB";
type Wallet = { coin: Coin; address: string };
type Dep = { id: string; coin: Coin; amount: number; status: string; created_at: string };

export const Route = createFileRoute("/_authenticated/deposit")({
  component: Deposit,
});

function Deposit() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [coin, setCoin] = useState<Coin>("BTC");
  const [amount, setAmount] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [deps, setDeps] = useState<Dep[]>([]);

  const loadDeps = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase.from("deposits").select("id,coin,amount,status,created_at").eq("user_id", u.user.id).order("created_at", { ascending: false }).limit(10);
    setDeps((data as Dep[]) || []);
  };

  useEffect(() => {
    supabase.from("wallets").select("coin,address").then(({ data }) => setWallets((data as Wallet[]) || []));
    loadDeps();
  }, []);

  const wallet = wallets.find(w => w.coin === coin);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setLoading(false); return; }
    let proofUrl: string | null = null;
    if (file) {
      const path = `${u.user.id}/${Date.now()}-${file.name}`;
      const { error: uperr } = await supabase.storage.from("payment-proofs").upload(path, file);
      if (uperr) { setLoading(false); return toast.error(uperr.message); }
      proofUrl = path;
    }
    const { error } = await supabase.from("deposits").insert({ user_id: u.user.id, coin, amount, proof_url: proofUrl });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Deposit submitted — awaiting admin approval");
    setAmount(0); setFile(null);
    loadDeps();
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-12 grid lg:grid-cols-2 gap-6">
        <Card className="surface-card border-white/5"><CardContent className="p-8">
          <h1 className="text-2xl font-bold mb-1">Make a deposit</h1>
          <p className="text-sm text-muted-foreground mb-6">Send crypto to the address below, then submit a screenshot as proof.</p>

          <div className="mb-4">
            <Label>Coin</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {(["BTC","ETH","USDT","BNB"] as Coin[]).map((c) => (
                <button key={c} onClick={() => setCoin(c)} className={`py-3 rounded-md border ${coin === c ? "gold-gradient text-black border-transparent font-semibold" : "border-white/10"}`}>{c}</button>
              ))}
            </div>
          </div>

          {wallet && (
            <div className="surface-card rounded-lg p-5 mb-4 text-center">
              <div className="bg-white p-3 rounded-md inline-block mb-3">
                <QRCodeSVG value={wallet.address} size={140} />
              </div>
              <div className="text-xs text-muted-foreground mb-1">Send {coin} to</div>
              <div className="flex items-center justify-center gap-2 text-xs break-all">
                <code className="bg-input/50 px-2 py-1 rounded">{wallet.address}</code>
                <button onClick={() => { navigator.clipboard.writeText(wallet.address); toast.success("Copied"); }}><Copy className="h-3 w-3" /></button>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div><Label>Amount (USD)</Label><Input type="number" value={amount || ""} onChange={(e) => setAmount(+e.target.value || 0)} required min={1} /></div>
            <div><Label>Payment proof (screenshot)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <Button disabled={loading} type="submit" className="w-full gold-gradient text-black hover:opacity-90">{loading ? "Submitting..." : "Submit deposit"}</Button>
          </form>
        </CardContent></Card>

        <Card className="surface-card border-white/5"><CardContent className="p-8">
          <h2 className="text-lg font-bold mb-4">Recent deposits</h2>
          {deps.length === 0 ? <div className="text-sm text-muted-foreground">No deposits yet.</div> : (
            <div className="space-y-3 text-sm">
              {deps.map((d) => (
                <div key={d.id} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                  <div><div className="font-semibold">${d.amount.toLocaleString()} {d.coin}</div><div className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString()}</div></div>
                  <StatusBadge s={d.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      </section>
    </SiteLayout>
  );
}

export function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = { pending: "bg-amber-500/15 text-amber-400", approved: "bg-emerald-500/15 text-emerald-400", rejected: "bg-red-500/15 text-red-400" };
  return <span className={`text-xs px-2 py-1 rounded ${map[s] || ""}`}>{s}</span>;
}
