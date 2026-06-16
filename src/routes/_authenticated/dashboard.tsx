import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { animate, useInView } from "framer-motion";
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

function AnimatedValue({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, { duration: 1.8, ease: "easeOut", onUpdate: (v) => setDisplay(Math.floor(v)) });
    return controls.stop;
  }, [isInView, value]);
  return <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <div className="text-sm text-muted-foreground">Welcome back</div>
          <h1 className="text-3xl font-bold">{profile?.full_name || profile?.email}</h1>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-4 mb-8"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          <StatCard
            icon={Wallet}
            label="Available balance"
            value={profile?.balance ?? 0}
            prefix="$"
            accent
          />
          <StatCard
            icon={TrendingUp}
            label="Active investments"
            value={investments.filter(i => i.status === "active").length}
          />
          <StatCard
            icon={Gift}
            label="Total earned"
            value={profile?.total_earned ?? 0}
            prefix="$"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap gap-3 mb-10"
        >
          <Button className="gold-gradient text-black hover:opacity-90" asChild>
            <Link to="/deposit"><ArrowDownToLine className="h-4 w-4 mr-2" />Deposit</Link>
          </Button>
          <Button variant="outline" className="hover:border-[rgba(22,219,147,0.4)] hover:text-[#16DB93] transition-colors" asChild>
            <Link to="/withdraw"><ArrowUpFromLine className="h-4 w-4 mr-2" />Withdraw</Link>
          </Button>
          <Button variant="outline" className="hover:border-[rgba(22,219,147,0.4)] hover:text-[#16DB93] transition-colors" asChild>
            <Link to="/invest"><TrendingUp className="h-4 w-4 mr-2" />New Investment</Link>
          </Button>
          <Button variant="outline" className="hover:border-[rgba(22,219,147,0.4)] hover:text-[#16DB93] transition-colors" asChild>
            <Link to="/referrals"><Users className="h-4 w-4 mr-2" />Referrals ({refCount})</Link>
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="surface-card border-[rgba(22,219,147,0.08)] lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Active investments</h2>
              {investments.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  No investments yet. <Link to="/invest" className="text-[#16DB93] underline underline-offset-2">Start one</Link>.
                </div>
              ) : (
                <div className="divide-y divide-[rgba(22,219,147,0.06)]">
                  {investments.map((i) => <InvestmentRow key={i.id} inv={i} />)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="surface-card border-[rgba(22,219,147,0.08)]">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-2">Your referral link</h2>
              <p className="text-xs text-muted-foreground mb-3">Share this link. Earn 5% on every referred user's first investment.</p>
              <div className="bg-input/50 rounded-md p-2 text-xs break-all border border-[rgba(22,219,147,0.1)] mb-3">{refLink}</div>
              <Button size="sm" variant="outline" className="w-full hover:border-[rgba(22,219,147,0.4)] hover:text-[#16DB93] transition-colors" onClick={() => { navigator.clipboard.writeText(refLink); }}>
                Copy link
              </Button>
              <div className="mt-4 text-sm flex justify-between">
                <span className="text-muted-foreground">Referrals</span>
                <span className="font-bold text-[#16DB93]">{refCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteLayout>
  );
}

function StatCard({ icon: Icon, label, value, prefix = "", accent }: { icon: React.ElementType; label: string; value: number; prefix?: string; accent?: boolean }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
      <Card className={`surface-card border-[rgba(22,219,147,0.08)] ${accent ? "animate-glow-pulse" : "hover:border-[rgba(22,219,147,0.2)]"} transition-colors duration-300`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="h-8 w-8 rounded-lg bg-[rgba(22,219,147,0.1)] grid place-items-center">
              <Icon className="h-4 w-4 text-[#16DB93]" />
            </div>
          </div>
          <div className="text-3xl font-bold tabular-nums gold-text">
            <AnimatedValue value={value} prefix={prefix} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InvestmentRow({ inv }: { inv: Inv }) {
  const end = new Date(inv.end_at).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  const remaining = Math.max(0, end - now);
  const days = Math.floor(remaining / 86400000);
  const hrs  = Math.floor((remaining % 86400000) / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  return (
    <div className="py-4 flex flex-wrap gap-4 items-center justify-between">
      <div>
        <div className="font-semibold">${inv.amount.toLocaleString()} · {inv.duration_days}d</div>
        <div className="text-xs text-muted-foreground">
          Expected return: <span className="text-emerald-400">+${inv.expected_return.toLocaleString()}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-muted-foreground">{inv.status === "active" ? "Ends in" : inv.status}</div>
        <div className="font-mono text-sm">
          {inv.status === "active" ? `${days}d ${hrs}h ${mins}m` : "—"}
        </div>
      </div>
    </div>
  );
}
