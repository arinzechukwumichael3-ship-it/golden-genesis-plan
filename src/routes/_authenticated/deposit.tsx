import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Shield, Clock, Zap, Upload } from "lucide-react";

type Coin = "BTC" | "ETH" | "USDT" | "BNB";
type Wallet = { coin: Coin; address: string };
type Dep = { id: string; coin: Coin; amount: number; status: string; created_at: string };

const COIN_META: Record<Coin, { color: string; dot: string }> = {
  BTC:  { color: "amber",  dot: "#F7931A" },
  ETH:  { color: "blue",   dot: "#627EEA" },
  USDT: { color: "green",  dot: "#26A17B" },
  BNB:  { color: "yellow", dot: "#F3BA2F" },
};

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
    const { data } = await supabase
      .from("deposits")
      .select("id,coin,amount,status,created_at")
      .eq("user_id", u.user.id)
      .order("created_at", { ascending: false })
      .limit(10);
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
      <section className="mx-auto max-w-5xl px-4 py-12">
        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <div className="text-xs uppercase tracking-widest text-[#16DB93] mb-2">Fund Your Account</div>
          <h1 className="text-3xl font-bold mb-1">Make a deposit</h1>
          <p className="text-sm text-muted-foreground">Send crypto to the address below, then submit your payment screenshot.</p>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap gap-5 mb-8 text-xs text-muted-foreground"
        >
          {[
            { icon: Shield, label: "Secured by multi-sig wallets" },
            { icon: Clock,  label: "Approved within 24 hours" },
            { icon: Zap,    label: "Instant portfolio credit" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-[#16DB93]" />
              {label}
            </div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Deposit form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <Card className="surface-card border-[rgba(22,219,147,0.1)] h-full">
              <CardContent className="p-8">
                {/* Coin selector */}
                <div className="mb-6">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Select coin</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["BTC", "ETH", "USDT", "BNB"] as Coin[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCoin(c)}
                        className={`py-3 rounded-lg border text-sm font-medium transition-all duration-200 flex flex-col items-center gap-1 ${
                          coin === c
                            ? "border-[#16DB93] bg-[rgba(22,219,147,0.08)] text-white"
                            : "border-white/10 text-muted-foreground hover:border-[rgba(22,219,147,0.3)] hover:text-white"
                        }`}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: COIN_META[c].dot }}
                        />
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* QR + address */}
                {wallet ? (
                  <div className="rounded-xl border border-[rgba(22,219,147,0.12)] bg-[rgba(22,219,147,0.02)] p-5 mb-6 text-center">
                    <div className="bg-white p-3 rounded-lg inline-block mb-4 shadow-lg">
                      <QRCodeSVG value={wallet.address} size={140} />
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Send <span className="text-[#16DB93] font-medium">{coin}</span> only to this address
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <code className="bg-black/50 border border-white/10 text-white/80 px-3 py-1.5 rounded-lg text-xs break-all font-mono max-w-[200px] truncate">
                        {wallet.address}
                      </code>
                      <button
                        onClick={() => { navigator.clipboard.writeText(wallet.address); toast.success("Copied"); }}
                        className="h-7 w-7 rounded-md border border-[rgba(22,219,147,0.2)] bg-[rgba(22,219,147,0.05)] grid place-items-center hover:border-[#16DB93] hover:bg-[rgba(22,219,147,0.1)] transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5 text-[#16DB93]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 mb-6 text-center">
                    <div className="text-sm text-muted-foreground">No wallet address configured for {coin}.</div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={submit} className="space-y-4">
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
                        className="pl-7 border-[rgba(22,219,147,0.12)] focus:border-[#16DB93] bg-input/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Payment proof (screenshot)</Label>
                    <label className="mt-1.5 flex flex-col items-center justify-center border border-dashed border-[rgba(22,219,147,0.2)] rounded-lg p-4 cursor-pointer hover:border-[rgba(22,219,147,0.4)] hover:bg-[rgba(22,219,147,0.02)] transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">{file ? file.name : "Click to upload screenshot"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                  <Button
                    disabled={loading}
                    type="submit"
                    className="w-full gold-gradient text-white hover:opacity-90 h-11 font-semibold animate-glow-pulse"
                  >
                    {loading ? "Submitting…" : "Submit deposit"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent deposits */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="surface-card border-[rgba(22,219,147,0.08)] h-full">
              <CardContent className="p-8">
                <h2 className="text-lg font-bold mb-5">Recent deposits</h2>
                {deps.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-12 text-center">
                    No deposits yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deps.map((d) => (
                      <div key={d.id} className="flex justify-between items-center py-3 border-b border-[rgba(22,219,147,0.05)] last:border-0">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-full border border-white/10 grid place-items-center"
                            style={{ background: `${COIN_META[d.coin]?.dot}18` }}
                          >
                            <span className="h-2 w-2 rounded-full" style={{ background: COIN_META[d.coin]?.dot }} />
                          </div>
                          <div>
                            <div className="font-semibold text-sm">${d.amount.toLocaleString()} <span className="text-muted-foreground font-normal">{d.coin}</span></div>
                            <div className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString()}</div>
                          </div>
                        </div>
                        <StatusBadge s={d.status} />
                      </div>
                    ))}
                  </div>
                )}

                {/* How it works guide */}
                <div className="mt-8 pt-6 border-t border-[rgba(22,219,147,0.06)]">
                  <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">How deposits work</h3>
                  <div className="space-y-3">
                    {[
                      { n: "01", text: "Send crypto to the address above" },
                      { n: "02", text: "Upload your payment screenshot" },
                      { n: "03", text: "Admin approves within 24 hours" },
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

export function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    pending:  "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    approved: "bg-[rgba(22,219,147,0.12)] text-[#16DB93] border border-[rgba(22,219,147,0.25)]",
    rejected: "bg-red-500/15 text-red-400 border border-red-500/20",
  };
  return <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${map[s] || "bg-white/5 text-muted-foreground"}`}>{s}</span>;
}
