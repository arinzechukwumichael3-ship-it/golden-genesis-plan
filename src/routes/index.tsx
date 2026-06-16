import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useInView, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, Wallet, Zap, Users, BarChart3, Lock, ArrowRight, Star, Check } from "lucide-react";
import heroVideo from "@/assets/hero.mp4.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YieldEmpireCapital — BTC/USDT Copy Trading" },
      { name: "description", content: "Professional BTC and USDT copy trading plans with tiered 72-hour payouts." },
    ],
  }),
  component: Home,
});

/* ── Helpers ── */
function Counter({ to, prefix = "", suffix = "", duration = 2 }: { to: number; prefix?: string; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    const c = animate(0, to, { duration, ease: "easeOut", onUpdate: (v) => setDisplay(Math.floor(v)) });
    return c.stop;
  }, [isInView, to, duration]);
  return <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

function PillCheck({ label }: { label: string }) {
  return (
    <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.15 }} className="flex items-center justify-between rounded-full border border-[rgba(22,219,147,0.14)] bg-white/[0.025] px-5 py-3 hover:border-[rgba(22,219,147,0.35)] hover:bg-white/[0.04] transition-colors duration-200 cursor-default">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="h-5 w-5 rounded-full bg-[#16DB93] grid place-items-center shrink-0 ml-4">
        <Check className="h-3 w-3 text-black" strokeWidth={3} />
      </span>
    </motion.div>
  );
}

function HeroBarChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="flex items-end gap-1 h-14">
      {[35, 52, 41, 68, 55, 82, 100].map((h, i) => (
        <motion.div key={i} className="flex-1 rounded-t-sm"
          initial={{ height: 0 }}
          animate={inView ? { height: h * 0.56 } : { height: 0 }}
          transition={{ delay: 0.4 + i * 0.08, duration: 0.55, ease: "easeOut" }}
          style={{ background: i === 6 ? "#16DB93" : `rgba(22,219,147,${0.14 + i * 0.1})` }}
        />
      ))}
    </div>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

/* ── Page ── */
function Home() {
  return (
    <SiteLayout>

      {/* ── HERO ── */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden">
        <video className="absolute inset-0 h-full w-full object-cover opacity-20" autoPlay loop muted playsInline preload="auto" src={heroVideo.url} />
        <div className="absolute inset-0 gradient-mesh-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(22,219,147,0.16),transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 surface-card rounded-full px-4 py-1.5 text-xs mb-8 border border-[rgba(22,219,147,0.22)]">
              <span className="h-2 w-2 rounded-full bg-[#16DB93] animate-pulse" />
              <span className="text-muted-foreground">Live · Trusted by <span className="text-[#16DB93] font-semibold">12,400+</span> investors</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6">
              Turn your capital<br />into <span className="gold-text">crypto income.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-lg mb-8">
              Professional BTC and USDT copy trading plans with verified 72-hour payouts and tiered returns.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-8">
              <Button size="lg" className="gold-gradient text-black hover:opacity-90 h-12 px-8 animate-glow-pulse font-semibold text-base" asChild>
                <Link to="/auth" search={{ mode: "register" }}>Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 border-white/20 hover:border-[rgba(22,219,147,0.5)] hover:text-[#16DB93] transition-colors" asChild>
                <Link to="/plans">View Plans</Link>
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2.5 surface-card rounded-2xl px-4 py-2.5 border border-[rgba(22,219,147,0.08)]">
                <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-[#16DB93] text-[#16DB93]" />)}</div>
                <div><div className="text-xs font-bold">Excellent</div><div className="text-[10px] text-muted-foreground">12,000+ reviews · Trustpilot</div></div>
              </div>
              <div className="flex items-center gap-2.5 surface-card rounded-2xl px-4 py-2.5 border border-[rgba(22,219,147,0.08)]">
                <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}</div>
                <div><div className="text-xs font-bold">4.8 / 5</div><div className="text-[10px] text-muted-foreground">Google Reviews</div></div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — floating portfolio card */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.3 }} className="hidden lg:block relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(22,219,147,0.1),transparent_70%)] blur-3xl" />
            <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="relative surface-card rounded-3xl p-7 animate-glow-pulse">
              <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Portfolio Overview</div>
              <div className="text-4xl font-bold tabular-nums mb-0.5">$48,231.<span className="text-muted-foreground text-2xl">52</span></div>
              <div className="text-sm text-emerald-400 mb-5">▲ +$1,842.20 (3.97%) today</div>
              <HeroBarChart />
              <div className="mt-5 space-y-2.5">
                {[
                  { c: "BTC", amt: "0.421 BTC", val: "$30,242", up: true },
                  { c: "ETH", amt: "3.18 ETH",  val: "$12,218", up: true },
                  { c: "USDT", amt: "5,771",      val: "$5,771",  up: false },
                ].map((r) => (
                  <div key={r.c} className="flex justify-between items-center py-2 border-b border-[rgba(22,219,147,0.06)] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full gold-gradient grid place-items-center text-black text-xs font-bold">{r.c[0]}</div>
                      <div><div className="font-semibold text-sm">{r.c}</div><div className="text-xs text-muted-foreground">{r.amt}</div></div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm tabular-nums">{r.val}</div>
                      <div className={`text-xs ${r.up ? "text-emerald-400" : "text-muted-foreground"}`}>{r.up ? "▲ 2.1%" : "stable"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.2 }} className="absolute -top-4 -right-6 surface-card rounded-2xl px-4 py-3 border border-[rgba(22,219,147,0.2)]">
              <div className="text-[#16DB93] font-bold text-xl">+25%</div>
              <div className="text-muted-foreground text-xs whitespace-nowrap">VIP Monthly ROI</div>
            </motion.div>
            <motion.div animate={{ y: [5, -5, 5] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }} className="absolute -bottom-4 -left-6 surface-card rounded-2xl px-4 py-3 border border-[rgba(22,219,147,0.2)]">
              <div className="text-white font-bold text-xl">72 hrs</div>
              <div className="text-muted-foreground text-xs whitespace-nowrap">Guaranteed payout</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── GLOBAL STATS ── */}
      <section className="border-y border-[rgba(22,219,147,0.08)] bg-[rgba(22,219,147,0.02)]">
        <motion.div className="mx-auto max-w-4xl px-4 py-12 grid grid-cols-3 gap-8 text-center" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {[
            { animated: true, to: 195, suffix: "+", label: "Countries" },
            { animated: true, to: 12400, suffix: "+", label: "Active Investors" },
            { animated: false, value: "$1.2B+", label: "Assets Managed" },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeUp}>
              <div className="text-3xl md:text-4xl font-bold gold-text tabular-nums">
                {s.animated ? <Counter to={s.to!} suffix={s.suffix} /> : s.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── STATS MARQUEE ── */}
      <div className="border-b border-[rgba(22,219,147,0.06)] bg-[rgba(22,219,147,0.015)] overflow-hidden py-4">
        <div className="animate-marquee flex whitespace-nowrap gap-14 text-sm text-muted-foreground">
          {[...Array(2)].map((_, set) => (
            <span key={set} className="flex gap-14 shrink-0">
              {["$1.2B+ Managed","12,400+ Investors","99.9% Uptime","72-Hour Payouts","BTC & USDT","Bank-Grade Security","SOC2 Compliant","Zero Hidden Fees"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2.5 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16DB93] shrink-0" />{item}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS — FundingPips numbered step style ── */}
      <section className="mx-auto max-w-5xl px-4 py-28">
        <div className="text-center mb-20">
          <div className="text-sm uppercase tracking-widest text-[#16DB93] mb-3">How it works</div>
          <h2 className="text-4xl md:text-5xl font-bold">Start earning in 3 steps</h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">No fluff, no fine print. Here's exactly how it works.</p>
        </div>

        <div className="space-y-20">
          {/* 01 */}
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
                <span className="font-mono">01</span><span>·</span><span>Account Setup</span>
              </div>
              <h3 className="text-3xl font-bold mb-3">Open Your Account</h3>
              <p className="text-muted-foreground mb-7 leading-relaxed">Register in minutes. Get verified and gain immediate access to our copy trading strategies.</p>
              <div className="space-y-2.5">
                {["Email verification","KYC approved in 24h","Instant trading access","Zero minimum wait period"].map(f => <PillCheck key={f} label={f} />)}
              </div>
            </div>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="surface-card rounded-3xl p-10 text-center border border-[rgba(22,219,147,0.1)] hover:border-[rgba(22,219,147,0.25)] transition-colors">
              <div className="h-20 w-20 mx-auto rounded-2xl gold-gradient grid place-items-center text-black mb-5 animate-glow-pulse">
                <Users className="h-9 w-9" />
              </div>
              <div className="text-3xl font-bold mb-1"><Counter to={12400} suffix="+" /></div>
              <div className="text-muted-foreground text-sm">Investors trust YieldEmpire</div>
            </motion.div>
          </motion.div>

          <div className="h-px bg-gradient-to-r from-transparent via-[rgba(22,219,147,0.15)] to-transparent" />

          {/* 02 */}
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="grid md:grid-cols-2 gap-14 items-center">
            <div className="md:order-2">
              <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
                <span className="font-mono">02</span><span>·</span><span>Fund &amp; Earn</span>
              </div>
              <h3 className="text-3xl font-bold mb-3">Real Returns. Fast.</h3>
              <p className="text-muted-foreground mb-7 leading-relaxed">Deposit BTC or USDT and join our copy trading service. Returns land in your wallet within 72 hours — guaranteed.</p>
              <div className="space-y-2.5">
                {["BTC & USDT accepted","72-hour payout window","Bank-grade cold storage","Zero hidden fees"].map(f => <PillCheck key={f} label={f} />)}
              </div>
            </div>
            {/* 3D raised stat card */}
            <div className="md:order-1">
              <motion.div
                animate={{ rotateX: [2, -2, 2], rotateY: [-3, 3, -3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                style={{ perspective: 1000 }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="surface-card rounded-3xl p-10 text-center animate-glow-pulse" style={{ boxShadow: "0 40px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(22,219,147,0.12), 0 20px 50px -15px rgba(22,219,147,0.2)" }}>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Total Assets Managed</div>
                  <div className="text-6xl font-bold gold-text mb-3">$1.2B+</div>
                  <div className="text-sm text-muted-foreground">Across all investment plans</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="h-px bg-gradient-to-r from-transparent via-[rgba(22,219,147,0.15)] to-transparent" />

          {/* 03 */}
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
                <span className="font-mono">03</span><span>·</span><span>Scale Up</span>
              </div>
              <h3 className="text-3xl font-bold mb-3">Grow Your Portfolio</h3>
              <p className="text-muted-foreground mb-7 leading-relaxed">Choose your plan. Scale from Basic to VIP with proven copy trading strategies and dedicated support.</p>
              <div className="space-y-2.5">
                {["3 plan tiers from $100","Up to 25% monthly ROI","Dedicated VIP manager","Custom scaling strategies"].map(f => <PillCheck key={f} label={f} />)}
              </div>
            </div>
            {/* Animated bar chart */}
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="surface-card rounded-3xl p-8 border border-[rgba(22,219,147,0.1)] hover:border-[rgba(22,219,147,0.25)] transition-colors">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-6">Plan Growth Scale</div>
              <div className="flex items-end gap-2.5" style={{ height: 140 }}>
                {[
                  { pct: 25, val: "$100" },
                  { pct: 40, val: "$500" },
                  { pct: 60, val: "$1K" },
                  { pct: 78, val: "$5K" },
                  { pct: 100, val: "$10K+" },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <motion.div className="w-full rounded-t-lg"
                      initial={{ height: 0 }}
                      whileInView={{ height: bar.pct * 1.4 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.12, duration: 0.8, ease: "easeOut" }}
                      style={{ background: `rgba(22,219,147,${0.22 + i * 0.155})` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex mt-3 text-xs text-muted-foreground">
                {["$100","$500","$1K","$5K","$10K+"].map((v) => <span key={v} className="flex-1 text-center">{v}</span>)}
              </div>
              <div className="flex mt-1 text-xs font-semibold text-[#16DB93]">
                {["Basic","","Pro","","VIP"].map((v, i) => <span key={i} className="flex-1 text-center">{v}</span>)}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── PLANS OVERVIEW ── */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-14">
          <div className="text-sm uppercase tracking-widest text-[#16DB93] mb-3">Investment plans</div>
          <h2 className="text-4xl md:text-5xl font-bold">Plans built for every investor</h2>
        </div>
        <motion.div className="grid md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {[
            { n: "Basic", min: "$100",    roi: "8%",  f: ["Beginner-friendly","24/7 support","Daily payouts"] },
            { n: "Pro",   min: "$1,000",  roi: "15%", f: ["Priority support","Advanced analytics","Higher returns"], featured: true },
            { n: "VIP",   min: "$10,000", roi: "25%", f: ["Dedicated manager","Custom strategies","Maximum ROI"] },
          ].map((p) => (
            <motion.div key={p.n} variants={fadeUp}>
              <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.2 }} className="h-full">
                <div className={`surface-card rounded-2xl relative h-full transition-all duration-300 overflow-hidden ${p.featured ? "animate-glow-pulse border border-[rgba(22,219,147,0.3)]" : "border border-[rgba(22,219,147,0.08)] hover:border-[rgba(22,219,147,0.25)]"}`}>
                  {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 gold-gradient text-black text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap z-10">MOST POPULAR</div>}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-1">{p.n}</h3>
                    <p className="text-sm text-muted-foreground mb-6">From {p.min}</p>
                    <div className="flex items-baseline gap-1 mb-7">
                      <span className="text-5xl font-bold gold-text">{p.roi}</span>
                      <span className="text-muted-foreground text-sm">monthly ROI</span>
                    </div>
                    <div className="space-y-2.5 mb-8">{p.f.map((x) => <PillCheck key={x} label={x} />)}</div>
                    <Button className="w-full gold-gradient text-black hover:opacity-90 font-semibold" asChild>
                      <Link to="/plans">Select plan</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-14">
          <div className="text-sm uppercase tracking-widest text-[#16DB93] mb-3">Why choose us</div>
          <h2 className="text-4xl md:text-5xl font-bold">A platform you can trust</h2>
        </div>
        <motion.div className="grid md:grid-cols-4 gap-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {[
            { icon: Shield,    t: "Bank-grade security", d: "Cold storage, 2FA, SOC2 compliant infrastructure." },
            { icon: Zap,       t: "Instant withdrawals",  d: "Most withdrawals processed within minutes, not days." },
            { icon: BarChart3, t: "Transparent returns",  d: "Real-time dashboard. See every payout, every cent." },
            { icon: Lock,      t: "Insured funds",        d: "Up to $250k of client funds covered by our insurance." },
          ].map((x) => (
            <motion.div key={x.t} variants={fadeUp}>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="surface-card rounded-2xl p-6 h-full border border-[rgba(22,219,147,0.08)] hover:border-[rgba(22,219,147,0.28)] transition-colors duration-300 cursor-default">
                <div className="h-12 w-12 rounded-xl bg-[rgba(22,219,147,0.1)] grid place-items-center text-[#16DB93] mb-4"><x.icon className="h-5 w-5" /></div>
                <h3 className="font-bold mb-2">{x.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{x.d}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-14">
          <div className="text-sm uppercase tracking-widest text-[#16DB93] mb-3">Testimonials</div>
          <h2 className="text-4xl md:text-5xl font-bold">Loved by investors</h2>
        </div>
        <motion.div className="grid md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {[
            { n: "Sarah K.",  r: "Verified VIP investor", q: "I've tried 5 platforms. YieldEmpire is the only one that pays out exactly as promised, every time." },
            { n: "Marcus L.", r: "Pro plan investor",      q: "Withdrawals hit my wallet in 12 minutes. The dashboard alone is worth it." },
            { n: "Aiko T.",   r: "Basic plan investor",    q: "Started with $200. After 6 months I'm reinvesting profits monthly. Game-changer." },
          ].map((t) => (
            <motion.div key={t.n} variants={fadeUp} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <div className="surface-card rounded-2xl border border-[rgba(22,219,147,0.08)] h-full hover:border-[rgba(22,219,147,0.22)] transition-colors duration-300 p-7">
                <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#16DB93] text-[#16DB93]" />)}</div>
                <p className="text-sm mb-5 leading-relaxed text-muted-foreground">"{t.q}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gold-gradient grid place-items-center text-black font-bold text-sm">{t.n[0]}</div>
                  <div><div className="font-semibold text-sm">{t.n}</div><div className="text-xs text-muted-foreground">{t.r}</div></div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-5xl px-4 py-24">
        <div className="relative surface-card rounded-3xl p-12 text-center overflow-hidden animate-glow-pulse border border-[rgba(22,219,147,0.2)]">
          <div className="absolute inset-0 gradient-mesh-bg opacity-60" />
          {[...Array(5)].map((_, i) => (
            <motion.div key={i} className="absolute h-1.5 w-1.5 rounded-full bg-[#16DB93]/40 pointer-events-none"
              style={{ left: `${12 + i * 18}%`, top: `${25 + (i % 3) * 22}%` }}
              animate={{ y: [-10, 10], opacity: [0.3, 0.7] }}
              transition={{ duration: 2 + i * 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.4 }}
            />
          ))}
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to grow your portfolio?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Join thousands earning passive crypto income with YieldEmpireCapital.</p>
            <Button size="lg" className="gold-gradient text-black h-12 px-9 hover:opacity-90 font-semibold" asChild>
              <Link to="/auth" search={{ mode: "register" }}>Open your account <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
