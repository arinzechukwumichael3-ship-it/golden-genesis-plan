import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, QrCode, Upload, Shield, Clock, Zap, Check, ChevronRight } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

type Coin = "BTC" | "ETH" | "USDT" | "BNB";
type Wallet = { coin: Coin; address: string };
type Dep = { id: string; coin: Coin; amount: number; status: string; created_at: string };

const COIN_META: Record<Coin, {
  name: string; symbol: string; dot: string; network: string;
  bg1: string; border: string;
}> = {
  BTC:  { name: "Bitcoin",   symbol: "₿", dot: "#F7931A", network: "Bitcoin Mainnet",  bg1: "rgba(247,147,26,0.12)",  border: "rgba(247,147,26,0.3)"  },
  ETH:  { name: "Ethereum",  symbol: "Ξ", dot: "#627EEA", network: "Ethereum Mainnet", bg1: "rgba(98,126,234,0.12)",  border: "rgba(98,126,234,0.3)"  },
  USDT: { name: "Tether",    symbol: "₮", dot: "#26A17B", network: "TRC-20 / ERC-20",  bg1: "rgba(38,161,123,0.12)",  border: "rgba(38,161,123,0.3)"  },
  BNB:  { name: "BNB Chain", symbol: "⬡", dot: "#F3BA2F", network: "BSC Mainnet",      bg1: "rgba(243,186,47,0.12)",  border: "rgba(243,186,47,0.3)"  },
};

function CoinSelector({ coin, onChange }: { coin: Coin; onChange: (c: Coin) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2 mb-6">
      {(["BTC", "ETH", "USDT", "BNB"] as Coin[]).map((c) => {
        const m = COIN_META[c];
        const active = c === coin;
        return (
          <motion.button
            key={c}
            whileTap={{ scale: 0.92 }}
            onClick={() => onChange(c)}
            className="relative rounded-xl border py-3 px-2 flex flex-col items-center gap-1.5 transition-all duration-200"
            style={{
              borderColor: active ? m.dot : "rgba(255,255,255,0.08)",
              background: active ? m.bg1 : "transparent",
              boxShadow: active ? `0 0 16px ${m.dot}30` : "none",
            }}
          >
            <span className="text-xl font-bold leading-none" style={{ color: m.dot }}>{m.symbol}</span>
            <span className="text-[11px] font-semibold" style={{ color: active ? "white" : "rgba(255,255,255,0.4)" }}>{c}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function WalletCard({ coin, address, showQR, onCopy }: { coin: Coin; address: string; showQR: boolean; onCopy: () => void }) {
  const m = COIN_META[coin];
  return (
    <motion.div
      layout
      className="relative rounded-2xl overflow-hidden mb-4"
      style={{
        background: `linear-gradient(135deg, #0D1B3E 0%, #111827 60%, ${m.dot}0a 100%)`,
        border: `1px solid ${m.border}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${m.border}`,
      }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 80% 0%, ${m.dot}20 0%, transparent 55%)` }} />

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: `${m.dot}80` }}>{m.network}</span>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: m.dot }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: m.dot }} />
        </span>
      </div>

      <div className="relative p-6">
        <div className="text-5xl font-bold mb-1 leading-none" style={{ color: m.dot, textShadow: `0 0 30px ${m.dot}50` }}>
          {m.symbol}
        </div>
        <div className="text-xs text-white/40 mb-5">{m.name}</div>

        <AnimatePresence mode="wait">
          {showQR ? (
            <motion.div
              key="qr"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.22 }}
              className="flex justify-center py-3"
            >
              <div className="bg-white p-3 rounded-xl shadow-2xl">
                <QRCodeSVG value={address} size={152} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="addr"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <div className="text-[10px] text-white/40 mb-1.5 uppercase tracking-wider">Deposit address</div>
              <div className="font-mono text-xs text-white/75 break-all leading-relaxed bg-black/30 rounded-xl p-4 border border-white/[0.05]">
                {address}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onCopy}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border"
          style={{ background: `${m.dot}15`, borderColor: `${m.dot}40`, color: m.dot }}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy address
        </button>
      </div>
    </motion.div>
  );
}

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
  const [showQR, setShowQR] = useState(false);
  const { theme } = useTheme();

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

  const copyAddress = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet.address);
    toast.success("Address copied");
  };

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
    toast.success("Deposit submitted — awaiting approval");
    setAmount(0); setFile(null);
    loadDeps();
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
            style={{ background: "radial-gradient(ellipse at 85% 50%, rgba(22,219,147,0.12) 0%, transparent 55%)" }} />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[#16DB93] mb-2 font-semibold">Fund Your Account</div>
            <h1 className="text-3xl font-bold mb-2 text-white">Make a deposit</h1>
            <p className="text-sm text-white/50 max-w-md">Send crypto to your secure wallet address and submit proof. Funds are credited within 24 hours.</p>
            <div className="flex flex-wrap gap-6 mt-5 text-xs text-white/50">
              {[
                { icon: Shield, label: "Multi-sig secured" },
                { icon: Clock,  label: "24-hour approval"  },
                { icon: Zap,    label: "Instant portfolio credit" },
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
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 block">Select network</Label>
              <CoinSelector coin={coin} onChange={(c) => { setCoin(c); setShowQR(false); }} />

              {wallet ? (
                <>
                  <WalletCard coin={coin} address={wallet.address} showQR={showQR} onCopy={copyAddress} />
                  <button
                    onClick={() => setShowQR(q => !q)}
                    className="w-full mb-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-[#16DB93] transition-colors"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    {showQR ? "Hide QR code" : "Show QR code"}
                  </button>
                </>
              ) : (
                <div className="rounded-xl border border-white/5 bg-white/[0.015] p-8 mb-6 text-center">
                  <div className="text-3xl mb-3 opacity-20" style={{ color: COIN_META[coin].dot }}>
                    {COIN_META[coin].symbol}
                  </div>
                  <div className="text-sm text-muted-foreground">No {coin} wallet configured</div>
                  <div className="text-xs text-muted-foreground/50 mt-1">Contact support to activate</div>
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Amount (USD equivalent)</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={amount || ""}
                      onChange={(e) => setAmount(+e.target.value || 0)}
                      required min={1}
                      placeholder="0.00"
                      className="pl-8 h-12 border-[rgba(22,219,147,0.12)] focus:border-[#16DB93] bg-transparent text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Payment screenshot</Label>
                  <label className="mt-1.5 flex flex-col items-center justify-center border border-dashed rounded-xl p-5 cursor-pointer group transition-all duration-200 hover:bg-[rgba(22,219,147,0.02)]"
                    style={{ borderColor: file ? "rgba(22,219,147,0.4)" : "rgba(255,255,255,0.08)" }}>
                    {file ? (
                      <div className="flex items-center gap-2 text-[#16DB93]">
                        <Check className="h-4 w-4" />
                        <span className="text-xs font-medium">{file.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-muted-foreground group-hover:text-[#16DB93] mb-2 transition-colors" />
                        <span className="text-xs text-muted-foreground group-hover:text-[#16DB93] transition-colors">Upload screenshot</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <Button
                  disabled={loading}
                  type="submit"
                  className="w-full gold-gradient text-white hover:opacity-90 h-12 font-semibold animate-glow-pulse"
                >
                  {loading ? "Submitting…" : "Submit deposit"}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Right: steps + history */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="flex flex-col gap-5"
          >
            {/* Steps */}
            <div className={cardCls}>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-5">How it works</div>
              <div className="space-y-5">
                {[
                  { n: "01", title: "Select your coin",     desc: "Choose BTC, ETH, USDT, or BNB above" },
                  { n: "02", title: "Send to address",      desc: "Copy the wallet address and send from your wallet" },
                  { n: "03", title: "Upload screenshot",    desc: "Submit your transaction confirmation" },
                  { n: "04", title: "Funds credited",       desc: "Admin approves and credits within 24 hours" },
                ].map(({ n, title, desc }, i) => (
                  <motion.div
                    key={n}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.32 + i * 0.08 }}
                    className="flex items-start gap-4"
                  >
                    <div className="shrink-0 h-8 w-8 rounded-full border border-[rgba(22,219,147,0.3)] bg-[rgba(22,219,147,0.06)] grid place-items-center">
                      <span className="text-[10px] font-bold text-[#16DB93]">{n}</span>
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="text-sm font-semibold">{title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                    </div>
                    {i < 3 && (
                      <div className="shrink-0 flex flex-col items-center" style={{ height: 28, marginTop: 28 }}>
                        <div className="w-px flex-1 bg-[rgba(22,219,147,0.12)]" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent deposits */}
            <div className={`${cardCls} flex-1`}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold">Recent deposits</h2>
                {deps.length > 0 && <span className="text-xs text-muted-foreground">{deps.length} total</span>}
              </div>
              {deps.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="h-10 w-10 rounded-full bg-[rgba(22,219,147,0.06)] grid place-items-center mx-auto mb-3">
                    <Upload className="h-4 w-4 text-muted-foreground/30" />
                  </div>
                  <div className="text-sm text-muted-foreground">No deposits yet</div>
                </div>
              ) : (
                <div className="space-y-1">
                  {deps.map((d, i) => {
                    const m = COIN_META[d.coin];
                    return (
                      <motion.div
                        key={d.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="flex justify-between items-center py-3 border-b border-[rgba(22,219,147,0.05)] last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-9 w-9 rounded-xl grid place-items-center text-base font-bold border shrink-0"
                            style={{ background: m.bg1, borderColor: m.border, color: m.dot }}
                          >
                            {m.symbol}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">${d.amount.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">{d.coin} · {new Date(d.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <StatusBadge s={d.status} />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
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
