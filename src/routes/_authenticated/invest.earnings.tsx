import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp } from "lucide-react";
import { formatMoney } from "@/lib/invest";

const TEAL = "#0D9488";

type Earning = {
  id: string;
  amount: number;
  type: string;
  credited_at: string;
  investment_id: string | null;
  investments?: { plans?: { name: string } | null } | null;
};

type Tab = "all" | "credited" | "pending";

export const Route = createFileRoute("/_authenticated/invest/earnings")({
  component: Earnings,
});

function Earnings() {
  const [rows, setRows] = useState<Earning[]>([]);
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("earnings_log")
        .select("id, amount, type, credited_at, investment_id, investments(plans(name))")
        .eq("user_id", u.user.id)
        .order("credited_at", { ascending: false });
      setRows((data as any) ?? []);
    })();
  }, []);

  const filtered = useMemo(() => tab === "all" ? rows : rows.filter((r) => r.type === tab), [rows, tab]);
  const total = filtered.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <SiteLayout>
      <div className="min-h-screen bg-[#F4F6F8]">
        <section className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10 space-y-5">
          <header>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Earnings History</h1>
            <div className="mt-2 text-sm text-slate-500">
              Total {tab !== "all" ? tab : "earned"}:{" "}
              <span className="text-lg sm:text-xl font-extrabold tabular-nums" style={{ color: TEAL }}>${formatMoney(total)}</span>
            </div>
          </header>

          <div className="flex gap-1 bg-white rounded-full border border-slate-200 p-1 w-fit">
            {(["all", "credited", "pending"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition ${tab === t ? "text-white" : "text-slate-600 hover:text-slate-900"}`}
                style={tab === t ? { background: TEAL } : undefined}
              >
                {t}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <Card className="bg-white border-slate-200/70 rounded-2xl">
              <CardContent className="p-10 text-center">
                <div className="mx-auto h-14 w-14 rounded-full grid place-items-center mb-3" style={{ background: `${TEAL}15`, color: TEAL }}>
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-base font-semibold text-slate-900">No earnings yet</div>
                <div className="text-sm text-slate-500 mt-1">Active investments will show their credits here once payouts begin.</div>
                <Link to="/invest/new" className="inline-block mt-4 text-sm font-semibold" style={{ color: TEAL }}>Start an investment →</Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white border-slate-200/70 rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <ul className="divide-y divide-slate-100">
                  {filtered.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{r.investments?.plans?.name ?? "Investment"}</div>
                        <div className="text-[11px] text-slate-500">{new Date(r.credited_at).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-extrabold tabular-nums" style={{ color: TEAL }}>+${formatMoney(Number(r.amount))}</div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: r.type === "credited" ? "rgba(22,219,147,0.12)" : "rgba(245,158,11,0.12)", color: r.type === "credited" ? "#16DB93" : "#F59E0B" }}>
                          {r.type}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </SiteLayout>
  );
}
