import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Plus, TrendingUp, Briefcase, Wallet } from "lucide-react";
import { COIN_META, formatMoney, statusColor, type Investment } from "@/lib/invest";

const TEAL = "#0D9488";

export const Route = createFileRoute("/_authenticated/invest/portfolio")({
  component: Portfolio,
});

type WithPlan = Investment & { plans?: { name: string } | null };

function Portfolio() {
  const [rows, setRows] = useState<WithPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setLoading(false); return; }
      const { data } = await supabase
        .from("investments")
        .select("*, plans(name)")
        .eq("user_id", u.user.id)
        .order("start_at", { ascending: false });
      setRows((data as WithPlan[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const totalInvested = rows.reduce((s, r) => s + Number(r.amount), 0);
  const activePlans = rows.filter((r) => r.status === "active" || r.status === "pending").length;
  const totalEarnings = rows.filter((r) => r.status === "completed").reduce((s, r) => s + (Number(r.expected_return) - Number(r.amount)), 0);

  return (
    <SiteLayout>
      <div className="min-h-screen bg-[#F4F6F8]">
        <section className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10 space-y-5">
          <header className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 truncate">My Investments</h1>
              <p className="text-sm text-slate-500">Track every active and completed plan in one place.</p>
            </div>
            <Button asChild className="shrink-0 rounded-full text-white font-semibold shadow-md" style={{ background: `linear-gradient(135deg, ${TEAL} 0%, #0FB5A1 100%)` }}>
              <Link to="/invest/new"><Plus className="h-4 w-4 mr-1" />New</Link>
            </Button>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            <StatCard icon={Wallet} label="Invested" value={`$${formatMoney(totalInvested)}`} />
            <StatCard icon={Briefcase} label="Active" value={String(activePlans)} />
            <StatCard icon={TrendingUp} label="Earnings" value={`$${formatMoney(totalEarnings)}`} accent />
          </div>

          {/* List */}
          {loading ? (
            <div className="text-center text-sm text-slate-500 py-12">Loading…</div>
          ) : rows.length === 0 ? (
            <Card className="bg-white border-slate-200/70 rounded-2xl">
              <CardContent className="p-10 text-center">
                <div className="mx-auto h-14 w-14 rounded-full grid place-items-center mb-3" style={{ background: `${TEAL}15`, color: TEAL }}>
                  <Plus className="h-6 w-6" />
                </div>
                <div className="text-base font-semibold text-slate-900">No active investments</div>
                <div className="text-sm text-slate-500 mt-1 mb-5">Start your first investment plan to grow your portfolio.</div>
                <Button asChild className="rounded-full text-white font-semibold" style={{ background: `linear-gradient(135deg, ${TEAL} 0%, #0FB5A1 100%)` }}>
                  <Link to="/invest/new">Start Investing</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {rows.map((r) => <InvestmentRow key={r.id} inv={r} />)}
            </div>
          )}
        </section>
      </div>
    </SiteLayout>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <Card className="bg-white border-slate-200/70 rounded-2xl">
      <CardContent className="p-3.5 sm:p-4">
        <div className="h-8 w-8 rounded-lg grid place-items-center mb-2" style={{ background: accent ? `${TEAL}15` : "rgb(241 245 249)", color: accent ? TEAL : "#64748B" }}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums truncate" style={accent ? { color: TEAL } : undefined}>{value}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
      </CardContent>
    </Card>
  );
}

function InvestmentRow({ inv }: { inv: WithPlan }) {
  const s = statusColor(inv.status);
  const start = new Date(inv.start_at).getTime();
  const end = new Date(inv.end_at).getTime();
  const now = Date.now();
  const pct = Math.max(0, Math.min(100, ((now - start) / Math.max(1, end - start)) * 100));
  const daysLeft = Math.max(0, Math.ceil((end - now) / 86400000));
  const [sym] = (inv.payment_method ?? ":").split(":");
  const m = COIN_META[sym] ?? COIN_META.BTC;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-white border-slate-200/70 rounded-2xl">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <div className="font-bold text-slate-900 truncate">{inv.plans?.name ?? "Investment"}</div>
              <div className="text-[11px] text-slate-500">{inv.duration_days} day plan · {inv.roi_percent_snapshot}% ROI</div>
            </div>
            <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.fg }}>{s.label}</span>
          </div>

          {(inv.status === "active" || inv.status === "pending") && (
            <div className="mb-3">
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${TEAL}, #0FB5A1)` }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                <span>{pct.toFixed(0)}% elapsed</span>
                <span>{daysLeft} days left</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 text-xs">
            <Cell label="Invested" value={`$${formatMoney(Number(inv.amount))}`} />
            <Cell label="Return" value={`$${formatMoney(Number(inv.expected_return))}`} accent />
            <div className="flex items-center justify-end gap-1.5 text-slate-500">
              <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
              <span className="font-semibold">{sym || "—"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Cell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className="font-semibold text-slate-900 tabular-nums truncate" style={accent ? { color: TEAL } : undefined}>{value}</div>
    </div>
  );
}
