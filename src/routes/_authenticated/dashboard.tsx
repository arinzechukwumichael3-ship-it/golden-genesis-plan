import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, TrendingUp, Gift, ArrowDownToLine, ArrowUpFromLine, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Profile = { balance: number; total_earned: number; referral_code: string; full_name: string | null; email: string };
type Inv = { id: string; amount: number; expected_return: number; end_at: string; status: string; duration_days: number };

function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [investments, setInvestments] = useState<Inv[]>([]);
  const [refCount, setRefCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const [{ data: p }, { data: inv }, { count }] = await Promise.all([
        supabase.from("profiles").select("balance,total_earned,referral_code,full_name,email").eq("id", u.user.id).maybeSingle(),
        supabase.from("investments").select("id,amount,expected_return,end_at,status,duration_days").eq("user_id", u.user.id).order("start_at", { ascending: false }).limit(10),
        supabase.from("referrals").select("*", { count: "exact", head: true }).eq("referrer_id", u.user.id),
      ]);
      setProfile(p as Profile);
      setInvestments((inv as Inv[]) || []);
      setRefCount(count || 0);
    })();
  }, []);

  const refLink = profile ? `${window.location.origin}/auth?mode=register&ref=${profile.referral_code}` : "";

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8">
          <div className="text-sm text-muted-foreground">Welcome back</div>
          <h1 className="text-3xl font-bold">{profile?.full_name || profile?.email}</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <StatCard icon={Wallet} label="Available balance" value={`$${(profile?.balance ?? 0).toLocaleString()}`} accent />
          <StatCard icon={TrendingUp} label="Active investments" value={String(investments.filter(i => i.status === "active").length)} />
          <StatCard icon={Gift} label="Total earned" value={`$${(profile?.total_earned ?? 0).toLocaleString()}`} />
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          <Button className="gold-gradient text-black hover:opacity-90" asChild><Link to="/deposit"><ArrowDownToLine className="h-4 w-4 mr-2" />Deposit</Link></Button>
          <Button variant="outline" asChild><Link to="/withdraw"><ArrowUpFromLine className="h-4 w-4 mr-2" />Withdraw</Link></Button>
          <Button variant="outline" asChild><Link to="/invest"><TrendingUp className="h-4 w-4 mr-2" />New Investment</Link></Button>
          <Button variant="outline" asChild><Link to="/referrals"><Users className="h-4 w-4 mr-2" />Referrals ({refCount})</Link></Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="surface-card border-white/5 lg:col-span-2"><CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4">Active investments</h2>
            {investments.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">No investments yet. <Link to="/invest" className="text-[var(--gold)] underline">Start one</Link>.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {investments.map((i) => <InvestmentRow key={i.id} inv={i} />)}
              </div>
            )}
          </CardContent></Card>

          <Card className="surface-card border-white/5"><CardContent className="p-6">
            <h2 className="text-lg font-bold mb-2">Your referral link</h2>
            <p className="text-xs text-muted-foreground mb-3">Share this link. Earn 5% on every referred user's first investment.</p>
            <div className="bg-input/50 rounded-md p-2 text-xs break-all border border-white/10 mb-3">{refLink}</div>
            <Button size="sm" variant="outline" className="w-full" onClick={() => { navigator.clipboard.writeText(refLink); }}>Copy link</Button>
            <div className="mt-4 text-sm flex justify-between">
              <span className="text-muted-foreground">Referrals</span><span className="font-bold">{refCount}</span>
            </div>
          </CardContent></Card>
        </div>
      </section>
    </SiteLayout>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <Card className={`surface-card border-white/5 ${accent ? "glow-gold" : ""}`}><CardContent className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-[var(--gold)]" />
      </div>
      <div className="text-3xl font-bold tabular-nums">{value}</div>
    </CardContent></Card>
  );
}

function InvestmentRow({ inv }: { inv: Inv }) {
  const end = new Date(inv.end_at).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  const remaining = Math.max(0, end - now);
  const days = Math.floor(remaining / 86400000);
  const hrs = Math.floor((remaining % 86400000) / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  return (
    <div className="py-4 flex flex-wrap gap-4 items-center justify-between">
      <div>
        <div className="font-semibold">${inv.amount.toLocaleString()} · {inv.duration_days}d</div>
        <div className="text-xs text-muted-foreground">Expected return: <span className="text-emerald-400">+${inv.expected_return.toLocaleString()}</span></div>
      </div>
      <div className="text-right">
        <div className="text-xs text-muted-foreground">{inv.status === "active" ? "Ends in" : inv.status}</div>
        <div className="font-mono text-sm">{inv.status === "active" ? `${days}d ${hrs}h ${mins}m` : "—"}</div>
      </div>
    </div>
  );
}
