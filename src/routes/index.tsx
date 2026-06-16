import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { animate, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, TrendingUp, Wallet, Zap, Users, BarChart3, Lock, ArrowRight, Star, CheckCircle2 } from "lucide-react";
import heroVideo from "@/assets/hero.mp4.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YieldEmpireCapital — BTC/USDT Copy Trading" },
      { name: "description", content: "Professional BTC and USDT copy trading plans with tiered 72-hour payouts. Choose Basic, VIP, or Premium strategies for fast crypto growth." },
    ],
  }),
  component: Home,
});

function Counter({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, to, { duration: 2, ease: "easeOut", onUpdate: (v) => setDisplay(Math.floor(v)) });
    return controls.stop;
  }, [isInView, to]);
  return <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

function Home() {
  return (
    <SiteLayout>
      {/* ── HERO ── */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          autoPlay loop muted playsInline preload="auto"
          src={heroVideo.url}
        />
        <div className="absolute inset-0 gradient-mesh-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(22,219,147,0.16),transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 surface-card rounded-full px-4 py-1.5 text-xs mb-8 border border-[rgba(22,219,147,0.22)]">
              <span className="h-2 w-2 rounded-full bg-[#16DB93] animate-pulse" />
              <span className="text-muted-foreground">Live · Trusted by <span className="text-[#16DB93] font-semibold">12,400+</span> investors</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6">
              Grow your wealth with<br />
              <span className="gold-text">elite crypto copy</span><br />
              trading.
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-lg mb-8">
              Premium BTC and USDT copy trading plans with tiered returns and verified 72-hour payouts. Deploy capital fast with our elite trading execution.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Button size="lg" className="gold-gradient text-black hover:opacity-90 text-base h-12 px-8 animate-glow-pulse" asChild>
                <Link to="/auth" search={{ mode: "register" }}>Start Earning <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 border-white/20 hover:border-[rgba(22,219,147,0.5)] hover:text-[#16DB93] transition-colors duration-200" asChild>
                <Link to="/plans">View Plans</Link>
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[#16DB93] text-[#16DB93]" />)}
              </div>
              <span>Excellent · <strong className="text-foreground">4.8/5</strong> from 12,000+ investors</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="hidden lg:flex flex-col gap-4"
          >
            <div className="surface-card rounded-2xl p-6 animate-glow-pulse">
              <div className="text-xs text-muted-foreground mb-5 uppercase tracking-widest">Platform Stats</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Assets Managed", to: 1200, prefix: "$", suffix: "M+" },
                  { label: "Active Investors", to: 12400, suffix: "+" },
                  { label: "Uptime", to: 99, suffix: ".9%" },
                  { label: "Payout Window", to: 72, suffix: "hrs" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                    <div className="text-2xl font-bold gold-text tabular-nums">
                      <Counter to={s.to} prefix={s.prefix} suffix={s.suffix} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card rounded-2xl p-5">
              <div className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">Live Portfolio</div>
              <div className="text-3xl font-bold tabular-nums mb-1">$48,231.<span className="text-muted-foreground text-xl">52</span></div>
              <div className="text-sm text-emerald-400 mb-5">+$1,842.20 (3.97%) today</div>
              <div className="space-y-2">
                {[
                  { c: "BTC", amt: "0.421", val: "$30,242", up: true },
                  { c: "ETH", amt: "3.18",  val: "$12,218", up: true },
                  { c: "USDT", amt: "5,771", val: "$5,771",  up: false },
                ].map((r) => (
                  <div key={r.c} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full gold-gradient grid place-items-center text-black text-xs font-bold">{r.c}</div>
                      <div>
                        <div className="font-semibold text-sm">{r.c}</div>
                        <div className="text-xs text-muted-foreground">{r.amt}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm tabular-nums">{r.val}</div>
                      <div className={`text-xs ${r.up ? "text-emerald-400" : "text-muted-foreground"}`}>{r.up ? "▲" : "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS MARQUEE ── */}
      <div className="border-y border-[rgba(22,219,147,0.08)] bg-[rgba(22,219,147,0.025)] overflow-hidden py-4">
        <div className="animate-marquee flex whitespace-nowrap gap-14 text-sm text-muted-foreground">
          {[...Array(2)].map((_, set) => (
            <span key={set} className="flex gap-14 shrink-0">
              {[
                "$1.2B+ Managed", "12,400+ Investors", "99.9% Uptime",
                "72-Hour Payouts", "BTC & USDT", "Bank-Grade Security",
                "SOC2 Compliant", "Zero Hidden Fees",
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-2.5 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16DB93] shrink-0" />
                  {item}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="mx-auto max-w-6xl px-4 py-28">
        <div className="text-center mb-16">
          <div className="text-sm uppercase tracking-widest text-[#16DB93] mb-3">How it works</div>
          <h2 className="text-4xl md:text-5xl font-bold">Start earning in 3 steps</h2>
        </div>
        <div className="space-y-5">
          {[
            {
              n: "01", icon: Users, t: "Open Your Account",
              d: "Register in minutes. Secure your trading access with full KYC verification.",
              features: ["Email verification", "KYC in 24h", "Instant access"],
            },
            {
              n: "02", icon: Wallet, t: "Fund with BTC or USDT",
              d: "Deposit your chosen asset and join the copy trading service immediately.",
              features: ["BTC & USDT accepted", "No minimum wait", "Secure cold storage"],
            },
            {
              n: "03", icon: TrendingUp, t: "Choose a Plan & Earn",
              d: "Select Basic, VIP, or Premium. Receive your returns within 72 hours.",
              features: ["3 plan tiers", "72-hour payout", "Transparent returns"],
            },
          ].map((step, idx) => (
            <motion.div key={step.n}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
            >
              <div className="surface-card rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center gap-8 hover:border-[rgba(22,219,147,0.25)] transition-all duration-300 group cursor-default">
                <div className="relative shrink-0 w-28 h-24 flex items-center justify-center">
                  <span className="absolute text-[7.5rem] font-bold text-white/[0.04] font-display leading-none select-none">{step.n}</span>
                  <div className="relative h-14 w-14 rounded-2xl gold-gradient grid place-items-center text-black group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold mb-2">{step.t}</h3>
                  <p className="text-muted-foreground mb-4">{step.d}</p>
                  <div className="flex flex-wrap gap-4">
                    {step.features.map((f) => (
                      <span key={f} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-[#16DB93] shrink-0" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
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
            { n: "Basic", min: "$100",    roi: "8%",  f: ["Beginner-friendly", "24/7 support", "Daily payouts"] },
            { n: "Pro",   min: "$1,000",  roi: "15%", f: ["Priority support", "Advanced analytics", "Higher returns"], featured: true },
            { n: "VIP",   min: "$10,000", roi: "25%", f: ["Dedicated manager", "Custom strategies", "Maximum ROI"] },
          ].map((p) => (
            <motion.div key={p.n} variants={fadeUp}>
              <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.2 }} className="h-full">
                <Card className={`surface-card border-[rgba(22,219,147,0.08)] relative h-full ${p.featured ? "animate-glow-pulse" : "hover:border-[rgba(22,219,147,0.2)]"} transition-all duration-300`}>
                  {p.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 gold-gradient text-black text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                      MOST POPULAR
                    </div>
                  )}
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-1">{p.n}</h3>
                    <p className="text-sm text-muted-foreground mb-6">From {p.min}</p>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-5xl font-bold gold-text">{p.roi}</span>
                      <span className="text-muted-foreground text-sm">monthly ROI</span>
                    </div>
                    <ul className="space-y-2.5 text-sm mb-8">
                      {p.f.map((x) => (
                        <li key={x} className="flex gap-2 items-center">
                          <CheckCircle2 className="h-4 w-4 text-[#16DB93] shrink-0" />
                          {x}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full gold-gradient text-black hover:opacity-90" asChild>
                      <Link to="/plans">Select plan</Link>
                    </Button>
                  </CardContent>
                </Card>
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
        <motion.div className="grid md:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {[
            { icon: Shield,   t: "Bank-grade security", d: "Cold storage, 2FA, SOC2 compliant infrastructure." },
            { icon: Zap,      t: "Instant withdrawals",  d: "Most withdrawals processed within minutes, not days." },
            { icon: BarChart3, t: "Transparent returns", d: "Real-time dashboard. See every payout, every cent." },
            { icon: Lock,     t: "Insured funds",        d: "Up to $250k of client funds covered by our insurance." },
          ].map((x) => (
            <motion.div key={x.t} variants={fadeUp}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="surface-card rounded-xl p-6 h-full border border-[rgba(22,219,147,0.08)] hover:border-[rgba(22,219,147,0.28)] transition-colors duration-300 cursor-default"
              >
                <div className="h-11 w-11 rounded-lg bg-[rgba(22,219,147,0.1)] grid place-items-center text-[#16DB93] mb-4">
                  <x.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold mb-1">{x.t}</h3>
                <p className="text-sm text-muted-foreground">{x.d}</p>
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
            { n: "Sarah K.",  r: "Verified VIP investor",  q: "I've tried 5 platforms. YieldEmpire is the only one that pays out exactly as promised, every time." },
            { n: "Marcus L.", r: "Pro plan investor",       q: "Withdrawals hit my wallet in 12 minutes. The dashboard alone is worth it." },
            { n: "Aiko T.",   r: "Basic plan investor",     q: "Started with $200. After 6 months I'm reinvesting profits monthly. Game-changer." },
          ].map((t) => (
            <motion.div key={t.n} variants={fadeUp} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card className="surface-card border-[rgba(22,219,147,0.08)] h-full hover:border-[rgba(22,219,147,0.22)] transition-colors duration-300">
                <CardContent className="p-7">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#16DB93] text-[#16DB93]" />)}
                  </div>
                  <p className="text-sm mb-5 leading-relaxed text-muted-foreground">"{t.q}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full gold-gradient grid place-items-center text-black font-bold text-sm">{t.n[0]}</div>
                    <div>
                      <div className="font-semibold text-sm">{t.n}</div>
                      <div className="text-xs text-muted-foreground">{t.r}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-5xl px-4 py-24">
        <div className="relative surface-card rounded-3xl p-12 text-center overflow-hidden animate-glow-pulse">
          <div className="absolute inset-0 gradient-mesh-bg opacity-60" />
          {[...Array(5)].map((_, i) => (
            <motion.div key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-[#16DB93]/40 pointer-events-none"
              style={{ left: `${12 + i * 18}%`, top: `${25 + (i % 3) * 22}%` }}
              animate={{ y: [-10, 10], opacity: [0.3, 0.7] }}
              transition={{ duration: 2 + i * 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.4 }}
            />
          ))}
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to grow your portfolio?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Join thousands earning passive crypto income with YieldEmpireCapital.</p>
            <Button size="lg" className="gold-gradient text-black h-12 px-9 hover:opacity-90" asChild>
              <Link to="/auth" search={{ mode: "register" }}>Open your account <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
