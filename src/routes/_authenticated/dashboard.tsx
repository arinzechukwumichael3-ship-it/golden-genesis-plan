import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, animate, useInView } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, TrendingUp, Gift, ArrowDownToLine, ArrowUpFromLine, Users, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Profile = { balance: number; total_earned: number; referral_code: string; full_name: string | null; email: string };
type Inv = { id: string; amount: number; expected_return: number; end_at: string; start_at: string; status: string; duration_days: number };

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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
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
        supabase.from("investments").select("id,amount,expected_return,end_at,start_at,status,duration_days").eq("user_id", u.user.id).order("start_at", { ascending: false }).limit(10),
        supabase.from("referrals").select("*", { count: "exact", head: true }).eq("referrer_id", u.user.id),
      ]);
      setProfile(p as Profile);
      setInvestments((inv as Inv[]) || []);
      setRefCount(count || 0);
    })();
  }, []);

  const refLink = profile ? `${window.location.origin}/auth?mode=register&ref=${profile.referral_code}` : "";
  const activeInvestments = investments.filter(i => i.status === "active");
  const totalActive = activeInvestments.reduce((s, i) => s + i.amount, 0);

  const statCards = [
    { icon: Wallet,    label: "Available balance",   value: profile?.balance ?? 0,     prefix: "$", accent: true  },
    { icon: TrendingUp,label: "Total active capital", value: totalActive,               prefix: "$", accent: false },
    { icon: Clock,     label: "Active investments",   value: activeInvestments.length,  prefix: "",  accent: false },
    { icon: Gift,      label: "Total earned",          value: profile?.total_earned ?? 0, prefix: "$", accent: false },
  ];

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 py-12">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="text-sm text-muted-foreground">{getGreeting()}</div>
          <h1 className="text-3xl font-bold">{profile?.full_name || profile?.email}</h1>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
        >
          {statCards.map((s) => (
            <motion.div key={s.label} variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
              <Card className={`surface-card border-[rgba(22,219,147,0.08)] relative overflow-hidden ${s.accent ? "animate-glow-pulse" : "hover:border-[rgba(22,219,147,0.2)]"} transition-colors duration-300`}>
                {s.accent && <div className="absolute inset-x-0 top-0 h-[3px] gold-gradient" />}
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                    <div className={`h-8 w-8 rounded-lg grid place-items-center ${s.accent ? "bg-[rgba(22,219,147,0.2)]" : "bg-[rgba(22,219,147,0.08)]"}`}>
                      <s.icon className="h-4 w-4 text-[#16DB93]" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold tabular-nums gold-text">
                    <AnimatedValue value={s.value} prefix={s.prefix} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap gap-3 mb-10"
        >
          <Button className="gold-gradient text-black hover:opacity-90 animate-glow-pulse" asChild>
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

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Investments table */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="surface-card border-[rgba(22,219,147,0.08)] h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold">Active investments</h2>
                  {investments.length > 0 && (
                    <Link to="/invest" className="text-xs text-[#16DB93] hover:underline">+ New</Link>
                  )}
                </div>
                {investments.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-12 text-center flex flex-col items-center gap-3">
                    <TrendingUp className="h-10 w-10 text-muted-foreground/30" />
                    <span>No investments yet. <Link to="/invest" className="text-[#16DB93] underline underline-offset-2">Start one</Link>.</span>
                  </div>
                ) : (
                  <div className="divide-y divide-[rgba(22,219,147,0.05)]">
                    {investments.map((i) => <InvestmentRow key={i.id} inv={i} />)}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Referral card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="surface-card border-[rgba(22,219,147,0.08)]">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-1">Your referral link</h2>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Share this link. Earn 5% on every referred user's first investment.</p>
                <div className="bg-black/40 rounded-lg p-3 text-xs break-all border border-[rgba(22,219,147,0.1)] mb-3 font-mono text-muted-foreground leading-relaxed">
                  {refLink || "—"}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full hover:border-[rgba(22,219,147,0.4)] hover:text-[#16DB93] transition-colors"
                  onClick={() => { if (refLink) navigator.clipboard.writeText(refLink); }}
                >
                  Copy link
                </Button>

                <div className="mt-5 pt-4 border-t border-[rgba(22,219,147,0.06)] flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total referrals</span>
                  <span className="font-bold text-[#16DB93] text-xl">{refCount}</span>
                </div>

                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full hover:border-[rgba(22,219,147,0.4)] hover:text-[#16DB93] transition-colors" asChild>
                    <Link to="/referrals"><Users className="h-3.5 w-3.5 mr-1.5" />View all referrals</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}

function InvestmentRow({ inv }: { inv: Inv }) {
  const start = new Date(inv.start_at ?? inv.end_at).getTime() - inv.duration_days * 86400000;
  const end   = new Date(inv.end_at).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const remaining = Math.max(0, end - now);
  const elapsed   = Math.max(0, now - start);
  const total     = end - start;
  const pct       = total > 0 ? Math.min(100, (elapsed / total) * 100) : 0;
  const days = Math.floor(remaining / 86400000);
  const hrs  = Math.floor((remaining % 86400000) / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);

  return (
    <div className="py-4">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-2">
        <div>
          <div className="font-semibold">${inv.amount.toLocaleString()} <span className="text-muted-foreground font-normal">· {inv.duration_days}d plan</span></div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Expected: <span className="text-emerald-400">+${inv.expected_return.toLocaleString()}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-xs px-2 py-0.5 rounded-full ${inv.status === "active" ? "bg-[rgba(22,219,147,0.1)] text-[#16DB93]" : "bg-white/5 text-muted-foreground"}`}>
            {inv.status}
          </div>
          <div className="font-mono text-sm mt-1 text-muted-foreground">
            {inv.status === "active" ? `${days}d ${hrs}h ${mins}m` : "—"}
          </div>
        </div>
      </div>
      {inv.status === "active" && (
        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full gold-gradient rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      )}
    </div>
  );
}
