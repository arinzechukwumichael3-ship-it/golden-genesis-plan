import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useInView, animate, useMotionValue, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, Wallet, Zap, Users, Lock, ArrowRight, Star, Check, Clock, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YieldEmpireCapital — BTC/USDT Copy Trading" },
      { name: "description", content: "Professional BTC and USDT copy trading with tiered 72-hour payouts. Join 12,400+ investors." },
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
    <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.15 }}
      className="flex items-center justify-between rounded-full border border-[rgba(22,219,147,0.14)] bg-white/[0.025] px-5 py-3 hover:border-[rgba(22,219,147,0.35)] hover:bg-white/[0.04] transition-colors duration-200 cursor-default">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="h-5 w-5 rounded-full bg-[#16DB93] grid place-items-center shrink-0 ml-4">
        <Check className="h-3 w-3 text-black" strokeWidth={3} />
      </span>
    </motion.div>
  );
}

function MiniBarChart({ bars, active }: { bars: number[]; active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="flex items-end gap-0.5 h-10">
      {bars.map((h, i) => (
        <motion.div key={i} className="flex-1 rounded-t-sm"
          initial={{ height: 0 }}
          animate={inView ? { height: h * 0.4 } : { height: 0 }}
          transition={{ delay: 0.2 + i * 0.06, duration: 0.45, ease: "easeOut" }}
          style={{ background: (active && i === bars.length - 1) ? "#16DB93" : `rgba(22,219,147,${0.15 + i * (0.6 / bars.length)})` }}
        />
      ))}
    </div>
  );
}

/* ── 3D Hero Visual ── */
function HeroVisual() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX = useSpring(useMotionValue(8), { stiffness: 50, damping: 20 });
  const rotY = useSpring(useMotionValue(-12), { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 18);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * -10);
      rotX.set((e.clientY / window.innerHeight - 0.5) * -10 + 8);
      rotY.set((e.clientX / window.innerWidth - 0.5) * 18 - 12);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY, rotX, rotY]);

  return (
    <div className="relative w-full max-w-2xl mx-auto h-[340px] md:h-[400px] flex items-center justify-center select-none pointer-events-none">
      {/* Radial glow behind cards */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(22,219,147,0.18),transparent_70%)]" />

      {/* Abstract floating geometric shapes */}
      <motion.div
        animate={{ y: [0, -18, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 left-8 md:left-20 w-16 h-16 rounded-2xl opacity-40"
        style={{
          background: "linear-gradient(135deg, rgba(22,219,147,0.4), rgba(22,219,147,0.1))",
          border: "1px solid rgba(22,219,147,0.4)",
          boxShadow: "0 8px 32px rgba(22,219,147,0.2)",
          transform: "rotate(15deg)",
        }}
      />
      <motion.div
        animate={{ y: [0, 14, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-8 right-6 md:right-20 w-12 h-12 opacity-30"
        style={{
          background: "linear-gradient(135deg, rgba(22,219,147,0.5), rgba(45,224,142,0.2))",
          border: "1px solid rgba(22,219,147,0.3)",
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          boxShadow: "0 8px 24px rgba(22,219,147,0.2)",
        }}
      />
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-14 right-10 md:right-28 w-8 h-8 rounded-lg opacity-25"
        style={{
          background: "rgba(22,219,147,0.5)",
          border: "1px solid rgba(22,219,147,0.4)",
        }}
      />

      {/* Main 3D card */}
      <motion.div
        style={{ rotateX: rotX, rotateY: rotY }}
        animate={{ y: [-10, 10, -10] }}
        transition={{ y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" } }}
        className="relative z-10 w-72 md:w-80 rounded-3xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {/* Card surface */}
        <div style={{
          background: "linear-gradient(145deg, rgba(22,219,147,0.14) 0%, rgba(10,11,13,0.9) 60%, rgba(22,219,147,0.06) 100%)",
          border: "1px solid rgba(22,219,147,0.28)",
          boxShadow: "0 50px 100px -20px rgba(0,0,0,0.95), 0 0 0 1px rgba(22,219,147,0.08), 0 0 80px -20px rgba(22,219,147,0.35)",
          backdropFilter: "blur(24px)",
        }}>
          {/* Card sheen highlight */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />
          {/* Green top edge */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(22,219,147,0.7)] to-transparent" />

          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#16DB93] mb-1">Portfolio Value</div>
                <div className="text-2xl font-bold tabular-nums">$1,247,830</div>
                <div className="text-xs text-emerald-400 mt-0.5">▲ +$3,842 today</div>
              </div>
              <div className="bg-[rgba(22,219,147,0.12)] border border-[rgba(22,219,147,0.25)] rounded-full px-2.5 py-1 text-[10px] text-[#16DB93] font-semibold whitespace-nowrap">
                ● Live
              </div>
            </div>

            <MiniBarChart bars={[35, 48, 38, 62, 52, 78, 100]} active />

            <div className="mt-4 space-y-2">
              {[
                { coin: "BTC", amt: "0.421", val: "$28,420", pct: "+2.4%", color: "#F7931A" },
                { coin: "ETH", amt: "3.18",  val: "$12,418", pct: "+1.8%", color: "#627EEA" },
                { coin: "USDT", amt: "5,771", val: "$5,771",  pct: "stable", color: "#26A17B" },
              ].map((r) => (
                <div key={r.coin} className="flex items-center justify-between py-1.5 border-b border-[rgba(22,219,147,0.06)] last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full grid place-items-center text-black text-[9px] font-bold" style={{ background: r.color }}>
                      {r.coin[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{r.coin}</div>
                      <div className="text-[9px] text-muted-foreground">{r.amt}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold">{r.val}</div>
                    <div className="text-[9px] text-[#16DB93]">{r.pct}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Satellite cards */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        className="absolute top-4 right-4 md:right-10 z-20 rounded-2xl overflow-hidden"
        style={{
          background: "rgba(10,11,13,0.85)",
          border: "1px solid rgba(22,219,147,0.22)",
          boxShadow: "0 20px 50px -10px rgba(0,0,0,0.8), 0 0 30px -10px rgba(22,219,147,0.25)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="px-4 py-3">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">VIP Monthly ROI</div>
          <div className="text-lg font-bold gold-text">+25%</div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0], rotate: [1.5, -1.5, 1.5] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-4 left-4 md:left-10 z-20 rounded-2xl overflow-hidden"
        style={{
          background: "rgba(10,11,13,0.85)",
          border: "1px solid rgba(22,219,147,0.22)",
          boxShadow: "0 20px 50px -10px rgba(0,0,0,0.8), 0 0 30px -10px rgba(22,219,147,0.25)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="px-4 py-3">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Payout window</div>
          <div className="text-lg font-bold">72 hrs</div>
        </div>
      </motion.div>
    </div>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

/* ── Page ── */
function Home() {
  return (
    <SiteLayout>

      {/* ── HERO — centered FundingPips-style ── */}
      <section className="relative overflow-hidden pt-12 pb-8">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(22,219,147,0.13),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_110%,rgba(22,219,147,0.06),transparent_70%)]" />

        <div className="relative mx-auto max-w-5xl px-4 text-center">
          {/* 3D Visual at top */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <HeroVisual />
          </motion.div>

          {/* Live badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 surface-card rounded-full px-4 py-1.5 text-xs mb-5 border border-[rgba(22,219,147,0.2)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16DB93] animate-pulse" />
            <span className="text-muted-foreground">Live · Trusted by <span className="text-[#16DB93] font-semibold">12,400+</span> investors worldwide</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.03] tracking-tight mb-5">
            Turn your capital<br />into <span className="gold-text">crypto income.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join the world's leading copy trading platform. Professional BTC &amp; USDT plans with verified 72-hour payouts.
          </motion.p>

          {/* Global stats row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center gap-8 md:gap-16 mb-8">
            {[
              { value: 195, suffix: "+", label: "Countries" },
              { value: 12400, suffix: "+", label: "Investors" },
              { value: null, display: "$1.2B+", label: "Assets Managed" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold gold-text tabular-nums">
                  {s.value !== null ? <Counter to={s.value} suffix={s.suffix} /> : s.display}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <Button size="lg" className="gold-gradient text-black hover:opacity-90 h-13 px-8 animate-glow-pulse font-semibold text-base" asChild>
              <Link to="/auth" search={{ mode: "register" }}>Start Earning <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-13 px-8 border-white/20 hover:border-[rgba(22,219,147,0.5)] hover:text-[#16DB93] transition-colors" asChild>
              <Link to="/plans">View Plans</Link>
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-3 surface-card rounded-2xl px-4 py-3 border border-[rgba(22,219,147,0.08)]">
              <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[#16DB93] text-[#16DB93]" />)}</div>
              <div>
                <div className="text-sm font-bold">Excellent</div>
                <div className="text-[11px] text-muted-foreground">58,842 reviews · Trustpilot</div>
              </div>
            </div>
            <div className="flex items-center gap-3 surface-card rounded-2xl px-4 py-3 border border-[rgba(22,219,147,0.08)]">
              <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}</div>
              <div>
                <div className="text-sm font-bold">Excellent</div>
                <div className="text-[11px] text-muted-foreground">4.8 rated · Google</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS MARQUEE ── */}
      <div className="border-y border-[rgba(22,219,147,0.06)] bg-[rgba(22,219,147,0.015)] overflow-hidden py-4">
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

      {/* ── "Trade with peace of mind" — feature image section ── */}
      <section className="relative overflow-hidden py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_50%,rgba(22,219,147,0.07),transparent_70%)]" />
        <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="text-xs uppercase tracking-widest text-[#16DB93] mb-4">Our Philosophy</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Trade with<br /><span className="gold-text">peace of mind.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              No complicated processes. No hidden requirements. A clear path to earning real crypto returns — all with institutional-grade security.
            </p>
            <div className="space-y-3">
              {["Flexible payout cycles — weekly or on maturity", "Zero reward denial policy", "Transparent return structure with no surprises", "Starting from just $500"].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded-full bg-[#16DB93] grid place-items-center shrink-0">
                    <Check className="h-3 w-3 text-black" strokeWidth={3} />
                  </span>
                  <span className="text-sm text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>
            <Button className="mt-8 gold-gradient text-black hover:opacity-90" asChild>
              <Link to="/plans">Explore plans <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: Shield,  title: "Bank-grade security",     desc: "Multi-sig wallets, cold storage, 2FA on every account." },
              { icon: Clock,   title: "72-hour payouts",          desc: "Returns credited within 72 hours of investment maturity." },
              { icon: Zap,     title: "Instant setup",            desc: "Open an account in minutes. Start earning today." },
              { icon: Lock,    title: "SOC2 compliant",           desc: "Audited infrastructure you can trust with real capital." },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="surface-card rounded-2xl p-5 border border-[rgba(22,219,147,0.08)] hover:border-[rgba(22,219,147,0.25)] transition-colors duration-300"
              >
                <div className="h-9 w-9 rounded-xl bg-[rgba(22,219,147,0.1)] grid place-items-center mb-3">
                  <card.icon className="h-4.5 w-4.5 text-[#16DB93]" />
                </div>
                <div className="font-semibold text-sm mb-1">{card.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{card.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS — FundingPips numbered steps ── */}
      <section className="py-24 border-t border-[rgba(22,219,147,0.06)]">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-3">How it works</h2>
            <p className="text-muted-foreground text-lg">No fluff, no fine print. Here's exactly how it works.</p>
          </motion.div>

          <div className="space-y-24">
            {/* Step 01 */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <div className="text-[80px] font-bold leading-none gold-text opacity-25 mb-2 select-none">01</div>
                <div className="text-xs uppercase tracking-widest text-[#16DB93] mb-2">Account Setup</div>
                <h3 className="text-3xl font-bold mb-4">Open Your Account</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">Register in minutes with just your email. Verify your identity and get instant access to all investment plans.</p>
                <div className="space-y-2.5">
                  {["Email verification in seconds", "KYC approval within 24 hours", "Instant platform access", "Dedicated onboarding support"].map(f => <PillCheck key={f} label={f} />)}
                </div>
              </div>
              <motion.div
                whileHover={{ y: -4 }}
                className="surface-card rounded-3xl p-8 border border-[rgba(22,219,147,0.12)]"
                style={{ boxShadow: "0 30px 60px -15px rgba(0,0,0,0.6), 0 0 0 1px rgba(22,219,147,0.08)" }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-[rgba(22,219,147,0.15)] grid place-items-center border border-[rgba(22,219,147,0.2)]">
                    <Users className="h-6 w-6 text-[#16DB93]" />
                  </div>
                  <div>
                    <div className="font-bold">New investor joined</div>
                    <div className="text-xs text-muted-foreground">Just now · Verified ✓</div>
                  </div>
                </div>
                {["Email confirmed", "Identity verified", "Account activated", "First investment placed"].map((step, i) => (
                  <div key={step} className="flex items-center gap-3 py-2.5 border-b border-[rgba(22,219,147,0.05)] last:border-0">
                    <span className="h-5 w-5 rounded-full bg-[#16DB93] grid place-items-center shrink-0">
                      <Check className="h-3 w-3 text-black" strokeWidth={3} />
                    </span>
                    <span className="text-sm">{step}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">{i === 0 ? "instant" : i === 1 ? "24h" : i === 2 ? "immediate" : "ready"}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Step 02 */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div className="lg:order-2">
                <div className="text-[80px] font-bold leading-none gold-text opacity-25 mb-2 select-none">02</div>
                <div className="text-xs uppercase tracking-widest text-[#16DB93] mb-2">Fund Your Account</div>
                <h3 className="text-3xl font-bold mb-4">Real Cash. Fast.</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">Deposit your chosen cryptocurrency. Already paid out $1.2B+ to investors. Keep up to 100% of your earnings.</p>
                <div className="space-y-2.5">
                  {["BTC and USDT accepted", "Instant portfolio credit on approval", "No minimum lock-in periods", "Withdrawals processed within 72 hours"].map(f => <PillCheck key={f} label={f} />)}
                </div>
              </div>
              <div className="lg:order-1 flex justify-center">
                {/* 3D raised stat card */}
                <motion.div
                  animate={{ rotateX: [8, 12, 8], rotateY: [-12, -8, -12] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
                  whileHover={{ scale: 1.03 }}
                  className="rounded-3xl overflow-hidden w-72"
                >
                  <div style={{
                    background: "linear-gradient(145deg, rgba(22,219,147,0.18) 0%, rgba(10,11,13,0.95) 100%)",
                    border: "1px solid rgba(22,219,147,0.25)",
                    boxShadow: "0 50px 100px -20px rgba(0,0,0,0.95), 0 0 0 1px rgba(22,219,147,0.1), 0 0 80px -20px rgba(22,219,147,0.4)",
                  }}>
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(22,219,147,0.6)] to-transparent" />
                    <div className="p-10 text-center">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Total paid out</div>
                      <div className="text-6xl font-bold gold-text mb-2">$1.2B+</div>
                      <div className="text-sm text-muted-foreground">rewarded to investors</div>
                      <div className="mt-6 inline-flex items-center gap-2 bg-[rgba(22,219,147,0.1)] border border-[rgba(22,219,147,0.2)] rounded-full px-4 py-2 text-xs text-[#16DB93]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#16DB93] animate-pulse" />
                        Payouts running live
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Step 03 */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <div className="text-[80px] font-bold leading-none gold-text opacity-25 mb-2 select-none">03</div>
                <div className="text-xs uppercase tracking-widest text-[#16DB93] mb-2">Scale Your Capital</div>
                <h3 className="text-3xl font-bold mb-4">Choose a Plan &amp; Earn</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">Select Basic, VIP, or Premium. Scale your capital from hundreds to millions. Reinvest and compound your returns automatically.</p>
                <div className="space-y-2.5">
                  {["3 plan tiers for every capital level", "Returns in 72 hours after maturity", "Compound reinvestment available", "Scale to unlimited capital over time"].map(f => <PillCheck key={f} label={f} />)}
                </div>
              </div>

              {/* Animated bar chart showing plan tiers */}
              <motion.div
                whileHover={{ y: -4 }}
                className="surface-card rounded-3xl p-8 border border-[rgba(22,219,147,0.12)]"
                style={{ boxShadow: "0 30px 60px -15px rgba(0,0,0,0.6)" }}
              >
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-6">Scale Prime Capital</div>
                <div className="flex items-end gap-3 h-44 mb-4">
                  {[
                    { label: "Basic", height: 35, range: "$500→$1k" },
                    { label: "Basic+", height: 48, range: "$800→$2.5k" },
                    { label: "VIP", height: 65, range: "$2k→$10k" },
                    { label: "VIP+", height: 80, range: "$5k→$50k" },
                    { label: "Premium", height: 100, range: "$10k→$100k" },
                  ].map((bar, i) => {
                    const ref = useRef<HTMLDivElement>(null);
                    const inView = useInView(ref, { once: true });
                    return (
                      <div key={bar.label} ref={ref} className="flex-1 flex flex-col items-center gap-2">
                        <div className="text-[9px] text-muted-foreground text-center leading-tight">{bar.range}</div>
                        <div className="w-full flex flex-col justify-end" style={{ height: "120px" }}>
                          <motion.div
                            className="w-full rounded-t-md"
                            initial={{ height: 0 }}
                            animate={inView ? { height: bar.height * 1.2 } : { height: 0 }}
                            transition={{ delay: 0.3 + i * 0.12, duration: 0.6, ease: "easeOut" }}
                            style={{
                              background: i === 4
                                ? "linear-gradient(180deg, #16DB93, #2DE08E)"
                                : `rgba(22,219,147,${0.15 + i * 0.18})`,
                            }}
                          />
                        </div>
                        <div className="text-[9px] text-muted-foreground">{bar.label}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground border-t border-[rgba(22,219,147,0.06)] pt-3">
                  <span>Starting at $500</span>
                  <span className="text-[#16DB93]">Up to 10× returns</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PLANS OVERVIEW ── */}
      <section className="py-24 border-t border-[rgba(22,219,147,0.06)] bg-[rgba(22,219,147,0.015)]">
        <motion.div className="mx-auto max-w-7xl px-4" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-14">
            <div className="text-xs uppercase tracking-widest text-[#16DB93] mb-3">Investment Plans</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose your plan</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Three tiers of professionally managed copy trading. All plans pay out within 72 hours.</p>
          </div>

          <motion.div className="grid lg:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              {
                name: "Basic Plan",
                sub: "USDT copy trading",
                featured: false,
                entries: [["€500","€1,000"],["€600","€1,500"],["€700","€1,800"],["€800","€2,000"],["€900","€2,500"]],
                features: ["72-hour payouts","5 tier levels","USDT deposits","Email support"],
              },
              {
                name: "VIP Plan",
                sub: "Elite USDT tiers",
                featured: true,
                entries: [["€1k","€5k"],["€2k","€10k"],["€5k","€50k"],["€10k","€100k"]],
                features: ["Priority payouts","7 tier levels","Highest multipliers","Dedicated support"],
              },
              {
                name: "Premium Plan",
                sub: "BTC-only trading",
                featured: false,
                entries: [["1 BTC","3 BTC"],["2 BTC","6 BTC"],["3 BTC","9 BTC"],["5 BTC","15 BTC"]],
                features: ["72-hour payouts","5 BTC tiers","3× multiplier","VIP account manager"],
              },
            ].map((plan) => (
              <motion.div key={plan.name} variants={fadeUp}>
                <motion.div whileHover={{ y: -8, transition: { duration: 0.22 } }}
                  className={`surface-card rounded-3xl border h-full ${plan.featured ? "border-[rgba(22,219,147,0.35)] animate-glow-pulse" : "border-[rgba(22,219,147,0.1)] hover:border-[rgba(22,219,147,0.28)]"} transition-colors duration-300 overflow-hidden`}>
                  {plan.featured && (
                    <div className="gold-gradient text-black text-xs font-bold text-center py-2 tracking-wider">VIP SELECTION</div>
                  )}
                  <div className="p-8">
                    <div className="mb-6">
                      <div className="text-xs text-muted-foreground mb-1">{plan.sub}</div>
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                    </div>

                    <div className="rounded-2xl border border-[rgba(22,219,147,0.1)] bg-black/30 p-4 mb-6">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Return structure</div>
                      <div className="space-y-2">
                        {plan.entries.map(([inv, earn]) => (
                          <div key={inv} className="flex justify-between text-sm border border-white/5 rounded-lg px-3 py-2 bg-black/30">
                            <span className="text-muted-foreground">{inv}</span>
                            <span className="font-semibold text-[#16DB93]">{earn}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      {plan.features.map(f => (
                        <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="h-4 w-4 rounded-full bg-[rgba(22,219,147,0.15)] grid place-items-center shrink-0">
                            <Check className="h-2.5 w-2.5 text-[#16DB93]" strokeWidth={3} />
                          </span>
                          {f}
                        </div>
                      ))}
                    </div>

                    <Button className="w-full gold-gradient text-black hover:opacity-95 font-semibold" asChild>
                      <Link to="/auth" search={{ mode: "register" }}>Start this plan</Link>
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 border-t border-[rgba(22,219,147,0.06)]">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-14">
            <div className="text-xs uppercase tracking-widest text-[#16DB93] mb-3">Investor Testimonials</div>
            <h2 className="text-4xl md:text-5xl font-bold">Trusted by thousands</h2>
          </motion.div>

          <motion.div className="grid md:grid-cols-3 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { name: "Alex M.",    country: "United States", rating: 5, text: "Got my VIP payout in less than 72 hours. No drama, no delays. My capital has grown 8× in 4 months." },
              { name: "Sarah K.",   country: "United Kingdom", rating: 5, text: "Started with the Basic plan. The returns showed up exactly when they said. Now I'm on Premium BTC." },
              { name: "Daniel R.", country: "Germany",        rating: 5, text: "The copy trading platform I was looking for. Institutional quality, transparent returns. Highly recommend." },
            ].map((t) => (
              <motion.div key={t.name} variants={fadeUp}>
                <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}
                  className="surface-card rounded-3xl p-7 border border-[rgba(22,219,147,0.08)] hover:border-[rgba(22,219,147,0.2)] transition-colors duration-300 h-full flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(t.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#16DB93] text-[#16DB93]" />)}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{t.text}"</p>
                  <div className="mt-5 pt-4 border-t border-[rgba(22,219,147,0.06)]">
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.country}</div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 border-t border-[rgba(22,219,147,0.06)] relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-bg opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(22,219,147,0.12),transparent_70%)]" />

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full bg-[#16DB93] opacity-10 pointer-events-none"
            style={{ width: 8 + i * 5, height: 8 + i * 5, left: `${15 + i * 18}%`, top: `${20 + (i % 2) * 50}%` }}
            animate={{ y: [-20, 20, -20], opacity: [0.06, 0.18, 0.06] }}
            transition={{ duration: 3 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
          />
        ))}

        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="relative text-center max-w-3xl mx-auto px-4">
          <div className="text-xs uppercase tracking-widest text-[#16DB93] mb-4">Start Today</div>
          <h2 className="text-4xl md:text-6xl font-bold mb-5">
            Ready to grow<br />your <span className="gold-text">wealth?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">Join 12,400+ investors already earning on YieldEmpireCapital. No experience required.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" className="gold-gradient text-black hover:opacity-90 h-13 px-10 animate-glow-pulse font-semibold text-base" asChild>
              <Link to="/auth" search={{ mode: "register" }}>Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-13 px-8 border-white/20 hover:border-[rgba(22,219,147,0.5)] hover:text-[#16DB93] transition-colors" asChild>
              <Link to="/contact">Talk to us</Link>
            </Button>
          </div>
        </motion.div>
      </section>

    </SiteLayout>
  );
}
