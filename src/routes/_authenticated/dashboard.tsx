import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, animate, useInView } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Wallet, TrendingUp, Gift, ArrowDownToLine, ArrowUpFromLine,
  Users, Clock, Share2, ChevronRight, BarChart3, Target, Zap,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Profile = { balance: number; total_earned: number; referral_code: string; full_name: string | null; email: string };
type Inv = { id: string; amount: number; expected_return: number; end_at: string; start_at: string; status: string; duration_days: number };

const G = "#16DB93";

/* ── Helpers ── */
function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
function getTier(total: number) {
  if (total >= 25000) return { name: "VIP",    color: "#FFD700", bg: "rgba(255,215,0,0.12)",    border: "rgba(255,215,0,0.3)",    pct: 100 };
  if (total >= 5000)  return { name: "Gold",   color: "#F59E0B", bg: "rgba(245,158,11,0.12)",   border: "rgba(245,158,11,0.3)",   pct: (total - 5000) / 20000 * 100 };
  if (total >= 1000)  return { name: "Silver",  color: "#94A3B8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.3)",  pct: (total - 1000) / 4000 * 100 };
  return               { name: "Bronze",  color: "#CD7F32", bg: "rgba(205,127,50,0.12)",  border: "rgba(205,127,50,0.3)",   pct: total / 1000 * 100 };
}
function getInitials(name: string | null, email: string) {
  if (name) return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return email.slice(0, 2).toUpperCase();
}
function shortId(id: string) { return `#${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`; }

/* ── Animated counter ── */
function Counter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [d, setD] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, { duration: 1.8, ease: "easeOut", onUpdate: v => setD(Math.floor(v)) });
    return c.stop;
  }, [inView, value]);
  return <span ref={ref}>{prefix}{d.toLocaleString()}{suffix}</span>;
}

/* ── Circular ring SVG ── */
function CircularRing({ pct, size = 128, sw = 9, color = G, children }: {
  pct: number; size?: number; sw?: number; color?: string; children?: ReactNode;
}) {
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [off, setOff] = useState(circ);
  useEffect(() => {
    if (!inView) return;
    const c = animate(circ, circ * (1 - Math.min(pct / 100, 1)), {
      duration: 1.8, ease: "easeOut", delay: 0.3, onUpdate: v => setOff(v),
    });
    return c.stop;
  }, [inView, circ, pct]);
  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}20`} strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

/* ── Radar / spider chart ── */
function RadarChart({ values, labels, size = 156 }: { values: number[]; labels: string[]; size?: number }) {
  const cx = size / 2, cy = size / 2, maxR = size * 0.3, n = values.length;
  const step = (2 * Math.PI) / n;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [prog, setProg] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, 1, { duration: 1.6, ease: "easeOut", delay: 0.5, onUpdate: v => setProg(v) });
    return c.stop;
  }, [inView]);
  const pt = (i: number, s: number) => {
    const a = -Math.PI / 2 + i * step;
    return { x: cx + maxR * s * Math.cos(a), y: cy + maxR * s * Math.sin(a) };
  };
  const dataPts = values.map((v, i) => {
    const full = pt(i, v);
    return { x: cx + (full.x - cx) * prog, y: cy + (full.y - cy) * prog };
  });
  return (
    <div ref={ref}>
      <svg width={size} height={size} className="overflow-visible">
        {[0.25, 0.5, 0.75, 1].map(s => (
          <polygon key={s}
            points={Array.from({ length: n }, (_, i) => { const p = pt(i, s); return `${p.x},${p.y}`; }).join(" ")}
            fill="none" stroke={`${G}14`} strokeWidth={1} />
        ))}
        {Array.from({ length: n }, (_, i) => {
          const p = pt(i, 1);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={`${G}14`} strokeWidth={1} />;
        })}
        <polygon points={dataPts.map(p => `${p.x},${p.y}`).join(" ")} fill={`${G}18`} stroke={G} strokeWidth={1.5} />
        {dataPts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3} fill={G} />)}
        {Array.from({ length: n }, (_, i) => {
          const p = pt(i, 1.35);
          return (
            <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
              fill="rgba(128,128,128,0.85)" fontSize={8.5} fontFamily="sans-serif">
              {labels[i]}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Donut circle ── */
function DonutCircle({ value, color = G, label, sublabel, size = 90 }: {
  value: number; color?: string; label: string; sublabel: string; size?: number;
}) {
  const r = size * 0.33, c = size / 2, sw = size * 0.092;
  const circ = 2 * Math.PI * r;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [off, setOff] = useState(circ);
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(circ, circ * (1 - value / 100), {
      duration: 1.4, ease: "easeOut", delay: 0.25, onUpdate: v => setOff(v),
    });
    return ctrl.stop;
  }, [inView, value, circ]);
  return (
    <div ref={ref} className="flex flex-col items-center gap-2.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
          <circle cx={c} cy={c} r={r} fill="none" stroke={`${color}20`} strokeWidth={sw} />
          <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={sw}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold tabular-nums" style={{ fontSize: size * 0.145, color }}>{value.toFixed(0)}%</span>
        </div>
      </div>
      <div className="text-center">
        <div className="font-bold text-[11px]" style={{ color }}>{label}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</div>
      </div>
    </div>
  );
}

/* ── Investment card (FundingPips-style) ── */
function InvestmentCard({ inv }: { inv: Inv }) {
  const start = new Date(inv.start_at ?? inv.end_at).getTime() - inv.duration_days * 86400000;
  const end = new Date(inv.end_at).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const remaining = Math.max(0, end - now);
  const elapsed = Math.max(0, now - start);
  const total = end - start;
  const pct = total > 0 ? Math.min(100, (elapsed / total) * 100) : 0;
  const days = Math.floor(remaining / 86400000);
  const hrs = Math.floor((remaining % 86400000) / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  const isActive = inv.status === "active";
  const roi = inv.amount > 0 ? ((inv.expected_return - inv.amount) / inv.amount * 100).toFixed(1) : "0.0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
      className="surface-card rounded-2xl border border-[rgba(22,219,147,0.1)] hover:border-[rgba(22,219,147,0.25)] transition-all duration-300 overflow-hidden"
    >
      {/* Top accent */}
      <div className={`h-[3px] ${isActive ? "gold-gradient" : "bg-muted"}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground">{shortId(inv.id)}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isActive
                  ? "bg-[rgba(22,219,147,0.12)] text-[#16DB93] border border-[rgba(22,219,147,0.25)]"
                  : inv.status === "paid"
                  ? "bg-[rgba(59,130,246,0.12)] text-blue-400 border border-blue-400/25"
                  : "bg-white/5 text-muted-foreground border border-white/10"
              }`}>
                {isActive ? "● Active" : inv.status === "paid" ? "✓ Paid" : inv.status}
              </span>
            </div>
            <div className="font-bold text-lg">${inv.amount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{inv.duration_days}-day plan · USDT</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Expected return</div>
            <div className="font-bold text-[#16DB93]">+${inv.expected_return.toLocaleString()}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">ROI: {roi}%</div>
          </div>
        </div>

        {/* Progress bar */}
        {isActive && (
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
              <span>{pct.toFixed(1)}% elapsed</span>
              <span>{days}d {hrs}h {mins}m remaining</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full gold-gradient rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-[10px] text-muted-foreground">
            Started {new Date(inv.start_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
          {isActive && (
            <div className="flex items-center gap-1 text-[10px] text-[#16DB93]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16DB93] animate-pulse" />
              <span>Live</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Dashboard ── */
function Dashboard() {
  const { theme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [investments, setInvestments] = useState<Inv[]>([]);
  const [refCount, setRefCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const [{ data: p }, { data: inv }, { count }] = await Promise.all([
        supabase.from("profiles").select("balance,total_earned,referral_code,full_name,email").eq("id", u.user.id).maybeSingle(),
        supabase.from("investments").select("id,amount,expected_return,end_at,start_at,status,duration_days").eq("user_id", u.user.id).order("start_at", { ascending: false }).limit(20),
        supabase.from("referrals").select("*", { count: "exact", head: true }).eq("referrer_id", u.user.id),
      ]);
      setProfile(p as Profile);
      setInvestments((inv as Inv[]) || []);
      setRefCount(count || 0);
    })();
  }, []);

  const balance = profile?.balance ?? 0;
  const totalEarned = profile?.total_earned ?? 0;
  const totalPortfolio = balance + totalEarned;
  const tier = getTier(totalPortfolio);
  const activeInvs = investments.filter(i => i.status === "active");
  const completedInvs = investments.filter(i => i.status === "paid" || i.status === "completed");
  const totalActiveCapital = activeInvs.reduce((s, i) => s + i.amount, 0);
  const portfolioPct = totalPortfolio > 0 ? Math.min((totalEarned / Math.max(totalPortfolio, 1)) * 300, 100) : 0;
  const refLink = profile ? `${window.location.origin}/auth?mode=register&ref=${profile.referral_code}` : "";

  // Radar chart values (0–1 normalized)
  const radarValues = [
    Math.min(totalEarned / 2000, 1),           // Returns
    Math.min(investments.length / 8, 1),        // Activity
    Math.min(refCount / 5, 1),                  // Referrals
    Math.min(balance / 5000, 1),                // Balance
    Math.min(completedInvs.length / 4, 1),      // Consistency
  ];
  const healthScore = parseFloat((radarValues.reduce((a, b) => a + b, 0) / radarValues.length * 10).toFixed(1));

  // Allocation for donut circles — BTC vs USDT (simulated from investments)
  const btcInvs = investments.filter(i => i.duration_days >= 30);
  const usdtInvs = investments.filter(i => i.duration_days < 30);
  const totalInvAmt = investments.reduce((s, i) => s + i.amount, 0);
  const btcPct = totalInvAmt > 0 ? (btcInvs.reduce((s, i) => s + i.amount, 0) / totalInvAmt * 100) : 50;
  const usdtPct = totalInvAmt > 0 ? (usdtInvs.reduce((s, i) => s + i.amount, 0) / totalInvAmt * 100) : 50;

  const cardBase = theme === "dark"
    ? "bg-[rgba(255,255,255,0.03)] border border-[rgba(22,219,147,0.08)]"
    : "bg-white border border-[rgba(0,0,0,0.07)]";

  const copyRefLink = () => {
    if (refLink) { navigator.clipboard.writeText(refLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 space-y-6">

        {/* ── WEALTH DESK BANNER ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-7 md:p-9"
          style={{ background: "linear-gradient(135deg, #0D1B3E 0%, #0f2248 60%, #0D1B3E 100%)" }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#16DB93]/50 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_90%_50%,rgba(22,219,147,0.06),transparent)]" />

          <div className="relative flex flex-wrap gap-5 items-start justify-between">
            <div>
              <div className="text-xs text-[#16DB93] uppercase tracking-[0.2em] mb-2 font-medium">Wealth Desk</div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5">
                {getGreeting()}, {profile?.full_name?.split(" ")[0] || profile?.email?.split("@")[0] || "Investor"}
              </h1>
              <p className="text-white/50 text-sm">Your accounts, rewards, and performance in one view.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex items-center gap-2 rounded-full px-4 py-2 border text-sm font-semibold"
                style={{ background: tier.bg, borderColor: tier.border, color: tier.color }}
              >
                <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: tier.color }} />
                {tier.name} Tier
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white/70 hover:border-white/50 hover:text-white bg-transparent text-xs"
                onClick={copyRefLink}
              >
                <Share2 className="h-3.5 w-3.5 mr-1.5" />{copied ? "Copied!" : "Share"}
              </Button>
              <Button className="gold-gradient text-white hover:opacity-90 animate-glow-pulse text-sm font-semibold" asChild>
                <Link to="/invest"><Zap className="h-4 w-4 mr-1.5" />Invest Now</Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── PROFILE + STAT CARDS ── */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Profile card with circular ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`rounded-3xl p-7 flex flex-col items-center text-center ${cardBase} shadow-sm`}
          >
            <div className="mb-5">
              <CircularRing pct={portfolioPct} size={128} sw={9} color={tier.color}>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold" style={{ color: tier.color }}>
                    {profile ? getInitials(profile.full_name, profile.email) : "—"}
                  </span>
                </div>
              </CircularRing>
            </div>
            <div className="font-bold text-lg mb-0.5">{profile?.full_name || profile?.email?.split("@")[0]}</div>
            <div
              className="text-xs font-semibold px-3 py-1 rounded-full mb-6"
              style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.border}` }}
            >
              {tier.name} Tier
            </div>
            <div className="w-full grid grid-cols-3 gap-1 divide-x divide-[rgba(22,219,147,0.08)]">
              {[
                { label: "Investments", value: investments.length, prefix: "" },
                { label: "Total Earned", value: totalEarned, prefix: "$" },
                { label: "Referrals", value: refCount, prefix: "" },
              ].map(s => (
                <div key={s.label} className="px-2">
                  <div className="font-bold text-base tabular-nums" style={{ color: G }}>
                    <Counter value={s.value} prefix={s.prefix} />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 4 Stat cards (2×2) */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {[
              { icon: Wallet,    label: "Available Balance",   value: balance,              prefix: "$", color: G,         accent: true  },
              { icon: TrendingUp,label: "Active Capital",      value: totalActiveCapital,   prefix: "$", color: "#60A5FA", accent: false },
              { icon: Clock,     label: "Active Plans",         value: activeInvs.length,   prefix: "",  color: "#A78BFA", accent: false },
              { icon: Gift,      label: "Total Earned",         value: totalEarned,          prefix: "$", color: "#34D399", accent: false },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                whileHover={{ y: -4 }}
                className={`rounded-2xl p-6 relative overflow-hidden ${cardBase} shadow-sm transition-shadow duration-300 hover:shadow-md`}
              >
                {s.accent && <div className="absolute inset-x-0 top-0 h-[3px] gold-gradient" />}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</div>
                  <div className="h-9 w-9 rounded-xl grid place-items-center" style={{ background: `${s.color}18` }}>
                    <s.icon className="h-4 w-4" style={{ color: s.color }} />
                  </div>
                </div>
                <div className="text-3xl font-bold tabular-nums" style={{ color: s.color }}>
                  <Counter value={s.value} prefix={s.prefix} />
                </div>
                {s.accent && (
                  <div className="mt-2 text-[11px]" style={{ color: `${G}99` }}>
                    {activeInvs.length > 0 ? `${activeInvs.length} plan${activeInvs.length !== 1 ? "s" : ""} running` : "Ready to invest"}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── CTA if no investments ── */}
        {investments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-3xl p-8 text-center relative overflow-hidden border border-[rgba(22,219,147,0.15)]"
            style={{ background: "linear-gradient(135deg, rgba(13,27,62,0.6), rgba(22,219,147,0.04))" }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_50%_50%,rgba(22,219,147,0.08),transparent)]" />
            <div className="relative">
              <TrendingUp className="h-10 w-10 mx-auto mb-4" style={{ color: G }} />
              <h3 className="text-xl font-bold mb-2">Your first investment awaits</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                Earn up to 10× returns in 72 hours. Start with as little as $500.
              </p>
              <Button className="gold-gradient text-white hover:opacity-90 animate-glow-pulse font-semibold px-8" asChild>
                <Link to="/invest">Start Investing <ChevronRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── ACTIVE INVESTMENTS ── */}
        {investments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="h-5 w-5" style={{ color: G }} />
                My Investments
              </h2>
              <Link to="/invest" className="text-xs font-semibold hover:underline underline-offset-2" style={{ color: G }}>
                + New plan
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {investments.slice(0, 6).map((inv, i) => (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                >
                  <InvestmentCard inv={inv} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── PERFORMANCE + PORTFOLIO HEALTH ── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Performance breakdown */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className={`rounded-3xl p-7 ${cardBase} shadow-sm`}
          >
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-medium">Investment Activity</div>
            <h3 className="text-lg font-bold mb-6">Portfolio Performance</h3>

            {investments.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">No investments to display yet.</div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {[
                    { label: "Active Plans",    count: activeInvs.length,    total: investments.length, color: G },
                    { label: "Completed",       count: completedInvs.length, total: investments.length, color: "#60A5FA" },
                  ].map(row => {
                    const pct = investments.length > 0 ? (row.count / investments.length) * 100 : 0;
                    return (
                      <div key={row.label}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">{row.label}</span>
                          <span className="font-bold tabular-nums" style={{ color: row.color }}>{row.count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: row.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
                          />
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">{pct.toFixed(1)}% of total</div>
                      </div>
                    );
                  })}
                </div>

                {/* Asset allocation donuts */}
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 font-medium">Plan Allocation</div>
                <div className="flex justify-around">
                  <DonutCircle value={Math.max(btcPct, 5)} color="#F59E0B" label="BTC Plans" sublabel={`${btcInvs.length} plans`} />
                  <DonutCircle value={Math.max(usdtPct, 5)} color={G}        label="USDT Plans" sublabel={`${usdtInvs.length} plans`} />
                  <DonutCircle value={Math.min(portfolioPct, 100)} color="#A78BFA" label="Growth" sublabel="portfolio" />
                </div>
              </>
            )}
          </motion.div>

          {/* Portfolio Health Score radar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className={`rounded-3xl p-7 ${cardBase} shadow-sm`}
          >
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-medium">Score Index</div>
            <h3 className="text-lg font-bold mb-1">Portfolio Health</h3>
            <p className="text-xs text-muted-foreground mb-5">Based on your investment behavior and rewards.</p>

            <div className="flex items-center justify-center mb-5">
              <RadarChart
                values={radarValues}
                labels={["Returns", "Activity", "Referrals", "Balance", "Consistency"]}
                size={160}
              />
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold gold-text tabular-nums">{healthScore}</div>
              <div className="text-xs text-muted-foreground mt-1">out of 10.0</div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {[
                { label: "Returns",     val: radarValues[0] },
                { label: "Activity",    val: radarValues[1] },
                { label: "Referrals",   val: radarValues[2] },
                { label: "Consistency", val: radarValues[4] },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: `${G}08` }}>
                  <span className="text-[11px] text-muted-foreground">{m.label}</span>
                  <span className="text-[11px] font-bold" style={{ color: G }}>{(m.val * 10).toFixed(1)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── QUICK ACTIONS + REFERRAL ── */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className={`rounded-3xl p-6 ${cardBase} shadow-sm`}
          >
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Target className="h-4 w-4" style={{ color: G }} />
              Quick Actions
            </h3>
            <div className="space-y-2.5">
              {[
                { icon: TrendingUp,     label: "New Investment",  to: "/invest",    primary: true  },
                { icon: ArrowDownToLine,label: "Deposit Funds",   to: "/deposit",   primary: false },
                { icon: ArrowUpFromLine,label: "Withdraw",        to: "/withdraw",  primary: false },
                { icon: Users,          label: `Referrals (${refCount})`, to: "/referrals", primary: false },
              ].map(a => (
                <motion.div key={a.label} whileHover={{ x: 4 }} transition={{ duration: 0.15 }}>
                  <Link
                    to={a.to}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      a.primary
                        ? "gold-gradient text-white hover:opacity-90"
                        : "hover:border-[rgba(22,219,147,0.3)] hover:bg-[rgba(22,219,147,0.04)] border"
                    } ${!a.primary ? (theme === "dark" ? "border-white/10 text-white/70" : "border-black/10 text-[#0D1B3E]/70") : ""}`}
                  >
                    <a.icon className="h-4 w-4 shrink-0" />
                    {a.label}
                    <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-50" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Referral card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className={`lg:col-span-2 rounded-3xl p-7 ${cardBase} shadow-sm`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                  <Gift className="h-5 w-5" style={{ color: G }} />
                  Your Referral Link
                </h3>
                <p className="text-xs text-muted-foreground">Earn 5% commission on every referred investor's first deposit.</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: G }}>{refCount}</div>
                <div className="text-[10px] text-muted-foreground">referrals</div>
              </div>
            </div>

            {/* Link box */}
            <div
              className="rounded-xl p-3.5 mb-3 border font-mono text-xs break-all leading-relaxed"
              style={theme === "dark"
                ? { background: "rgba(0,0,0,0.3)", borderColor: "rgba(22,219,147,0.12)", color: "rgba(255,255,255,0.5)" }
                : { background: "rgba(0,0,0,0.03)", borderColor: "rgba(0,0,0,0.08)", color: "rgba(0,0,0,0.5)" }
              }
            >
              {refLink || "Loading…"}
            </div>
            <Button
              size="sm"
              onClick={copyRefLink}
              className={`w-full font-semibold transition-colors ${copied ? "gold-gradient text-white" : "border hover:border-[rgba(22,219,147,0.4)] hover:text-[#16DB93]"}`}
              variant={copied ? "default" : "outline"}
            >
              {copied ? "✓ Copied to clipboard!" : "Copy referral link"}
            </Button>

            {/* Tier progress */}
            <div className="mt-5 pt-5 border-t border-[rgba(22,219,147,0.06)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">
                  {tier.name} → {tier.name === "Bronze" ? "Silver at $1,000" : tier.name === "Silver" ? "Gold at $5,000" : tier.name === "Gold" ? "VIP at $25,000" : "Max tier reached"}
                </span>
                <span className="text-xs font-semibold" style={{ color: tier.color }}>{tier.pct.toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: tier.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${tier.pct}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
                />
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </SiteLayout>
  );
}
