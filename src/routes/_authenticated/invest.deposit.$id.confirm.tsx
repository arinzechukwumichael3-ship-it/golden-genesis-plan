import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Wallet, TrendingUp, CalendarDays, Repeat, CheckCircle2 } from "lucide-react";
import { formatMoney, type Investment } from "@/lib/invest";

const TEAL = "#0D9488";

export const Route = createFileRoute("/_authenticated/invest/deposit/$id/confirm")({
  component: ConfirmStep,
});

function ConfirmStep() {
  const { id } = Route.useParams();
  const [inv, setInv] = useState<Investment | null>(null);
  const [planName, setPlanName] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("investments").select("*").eq("id", id).maybeSingle();
      const i = data as Investment | null;
      setInv(i);
      if (i) {
        const { data: pl } = await supabase.from("plans").select("name").eq("id", i.plan_id).maybeSingle();
        setPlanName(pl?.name ?? "");
      }
    })();
  }, [id]);

  return (
    <SiteLayout>
      <div className="min-h-screen bg-[#F4F6F8]">
        <section className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-12 space-y-6 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 14 }}
            className="mx-auto h-20 w-20 rounded-full grid place-items-center"
            style={{ background: `linear-gradient(135deg, ${TEAL} 0%, #0FB5A1 100%)`, boxShadow: `0 12px 40px ${TEAL}55` }}
          >
            <motion.div initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
              <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
            </motion.div>
          </motion.div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Investment Submitted!</h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Your deposit is under review. You'll be notified once it's confirmed and your plan goes active.</p>
          </div>

          {inv && (
            <Card className="bg-white border-slate-200/70 shadow-sm rounded-2xl text-left">
              <CardContent className="p-5">
                <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-3">Investment Summary</div>
                <ul className="divide-y divide-slate-100">
                  <SummaryRow icon={Briefcase} label="Plan" value={planName} />
                  <SummaryRow icon={Wallet} label="Deposit Amount" value={`$${formatMoney(Number(inv.amount))}`} />
                  <SummaryRow icon={TrendingUp} label="Expected ROI" value={`${inv.roi_percent_snapshot}%`} />
                  <SummaryRow icon={CalendarDays} label="Duration" value={`${inv.duration_days} days`} />
                  <SummaryRow icon={Repeat} label="Payment via" value={inv.payment_method ?? "—"} />
                  <SummaryRow icon={CheckCircle2} label="You will receive" value={`$${formatMoney(Number(inv.expected_return))}`} accent />
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button asChild className="h-12 rounded-full text-white font-bold shadow-md" style={{ background: `linear-gradient(135deg, ${TEAL} 0%, #0FB5A1 100%)` }}>
              <Link to="/invest/portfolio">View My Investments</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full border-slate-300 text-slate-700">
              <Link to="/invest/new">Make Another Investment</Link>
            </Button>
          </div>
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
