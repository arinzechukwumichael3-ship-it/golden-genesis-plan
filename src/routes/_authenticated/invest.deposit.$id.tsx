import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, ArrowRight, Copy, Check, Clock } from "lucide-react";
import { COIN_META, formatMoney, type Investment } from "@/lib/invest";

const TEAL = "#0D9488";

export const Route = createFileRoute("/_authenticated/invest/deposit/$id")({
  component: DepositStep,
});

function DepositStep() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [inv, setInv] = useState<Investment | null>(null);
  const [copied, setCopied] = useState(false);
  const [seconds, setSeconds] = useState(30 * 60);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("investments").select("*").eq("id", id).maybeSingle();
      if (error) toast.error(error.message);
      setInv((data as Investment) || null);
    })();
  }, [id]);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  if (!inv) {
    return <SiteLayout><div className="min-h-screen bg-[#F4F6F8] grid place-items-center"><div className="text-slate-500 text-sm">Loading investment…</div></div></SiteLayout>;
  }

  const [sym, network] = (inv.payment_method ?? ":").split(":");
  const m = COIN_META[sym] ?? COIN_META.BTC;
  const address = inv.wallet_address_used ?? "";
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");

  const copy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SiteLayout>
      <div className="min-h-screen bg-[#F4F6F8]">
        <section className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10 space-y-5">
          <header className="space-y-1">
            <div className="text-[10px] font-semibold tracking-[0.22em] uppercase" style={{ color: TEAL }}>Step 2 of 3 — Send Payment</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Send ${formatMoney(Number(inv.amount))} via {sym}</h1>
            <p className="text-sm text-slate-500">Network: <span className="font-semibold text-slate-700">{network}</span></p>
          </header>

          <Card className="bg-white border-slate-200/70 shadow-sm rounded-2xl">
            <CardContent className="p-5 sm:p-7 flex flex-col items-center text-center gap-4">
              {address ? (
                <>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                    <QRCodeSVG value={address} size={180} />
                  </div>
                  <div className="w-full">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">Wallet Address</div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 min-w-0 truncate font-mono text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700">{address}</code>
                      <button onClick={copy} className="shrink-0 h-10 w-10 rounded-xl border grid place-items-center transition" style={{ borderColor: copied ? TEAL : "rgb(226 232 240)", background: copied ? `${TEAL}10` : "white", color: copied ? TEAL : "#64748B" }}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-sm text-slate-500">
                  Wallet address not configured yet — please contact support.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0" style={{ background: "#FFF7ED" }}>
            <CardContent className="p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-900">
                Send exactly <strong>${formatMoney(Number(inv.amount))}</strong> worth of <strong>{sym}</strong> on the <strong>{network}</strong> network. Wrong amount or network = lost funds.
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <Clock className="h-4 w-4" style={{ color: TEAL }} />
            <span>This address expires in <span className="font-bold tabular-nums" style={{ color: TEAL }}>{mins}:{secs}</span></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button asChild variant="outline" className="h-12 rounded-full border-slate-300 text-slate-700">
              <Link to="/invest/new">Back</Link>
            </Button>
            <Button
              onClick={() => navigate({ to: "/invest/deposit/$id/proof", params: { id } })}
              className="h-12 rounded-full text-white font-bold shadow-md"
              style={{ background: `linear-gradient(135deg, ${TEAL} 0%, #0FB5A1 100%)` }}
            >
              I have made the payment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-slate-500">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
              {sym} · {network}
            </div>
          </motion.div>
        </section>
      </div>
    </SiteLayout>
  );
}
