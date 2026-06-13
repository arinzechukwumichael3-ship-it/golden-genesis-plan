import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, TrendingUp, Wallet, Zap, Users, BarChart3, Lock, ArrowRight, Star } from "lucide-react";
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

function Home() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          autoPlay loop muted playsInline preload="auto"
          src={heroVideo.url}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(240,180,41,0.15),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 surface-card rounded-full px-3 py-1 text-xs mb-6">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-muted-foreground">Trusted by 12,400+ investors</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6">
              Professional crypto income.<br /><span className="gold-text">Copy trading in BTC & USDT.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mb-8">
              Premium BTC and USDT copy trading plans with tiered returns and verified 72-hour payouts. Deploy capital fast with our elite trading execution.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gold-gradient text-black hover:opacity-90 text-base h-12 px-7" asChild>
                <Link to="/auth" search={{ mode: "register" }}>Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-7" asChild>
                <Link to="/plans">View Plans</Link>
              </Button>
            </div>
            <div className="mt-10 flex gap-8 text-sm">
              <div><div className="text-2xl font-bold gold-text">$1.2B+</div><div className="text-muted-foreground">Assets managed</div></div>
              <div><div className="text-2xl font-bold gold-text">99.9%</div><div className="text-muted-foreground">Uptime</div></div>
              <div><div className="text-2xl font-bold gold-text">24/7</div><div className="text-muted-foreground">Support</div></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="hidden lg:block">
            <div className="surface-card rounded-2xl p-6 glow-gold">
              <div className="text-xs text-muted-foreground mb-2">Portfolio Overview</div>
              <div className="text-4xl font-bold tabular-nums">$48,231.<span className="text-muted-foreground">52</span></div>
              <div className="text-sm text-emerald-400 mb-6">+$1,842.20 (3.97%) today</div>
              <div className="space-y-3">
                {[
                  { c: "BTC", amt: "0.421", val: "$30,242", up: true },
                  { c: "ETH", amt: "3.18", val: "$12,218", up: true },
                  { c: "USDT", amt: "5,771", val: "$5,771", up: false },
                ].map((r) => (
                  <div key={r.c} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full gold-gradient grid place-items-center text-black text-xs font-bold">{r.c}</div>
                      <div><div className="font-semibold">{r.c}</div><div className="text-xs text-muted-foreground">{r.amt}</div></div>
                    </div>
                    <div className="text-right"><div className="font-semibold tabular-nums">{r.val}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-14">
          <div className="text-sm uppercase tracking-widest text-[var(--gold)] mb-2">How it works</div>
          <h2 className="text-4xl md:text-5xl font-bold">Start earning in 3 steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { i: 1, t: "Open your account", d: "Register quickly and secure your trading access in minutes.", icon: Users },
            { i: 2, t: "Fund with BTC or USDT", d: "Deposit BTC or USDT and join our copy trading service immediately.", icon: Wallet },
            { i: 3, t: "Choose a copy trading plan", d: "Select Basic, VIP, or Premium and receive returns in 72 hours.", icon: TrendingUp },
          ].map(({ i, t, d, icon: Icon }) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="surface-card border-white/5 h-full">
                <CardContent className="p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl gold-gradient grid place-items-center text-black"><Icon className="h-5 w-5" /></div>
                    <div className="text-5xl font-bold text-white/10 font-display">0{i}</div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t}</h3>
                  <p className="text-muted-foreground text-sm">{d}</p>
                </CardContent>
              {[
                { n: "Basic", min: "€500 → €2,500", roi: "2x-5x return", f: ["USDT copy trading","72-hour payout","Low entry point"] },
                { n: "VIP", min: "€1,000 → €100,000", roi: "5x-10x return", f: ["High-tier USDT strategy","Elite execution","Rapid growth"], featured: true },
                { n: "Premium", min: "1-5 BTC", roi: "3x BTC return", f: ["BTC copy trading","Maximum leverage","Top-tier payouts"] },
              ].map((p) => (

      {/* PLANS OVERVIEW */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-14">
                    <p className="text-sm text-muted-foreground mb-6">{p.min}</p>
          <h2 className="text-4xl md:text-5xl font-bold">Plans built for every investor</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "Basic", min: "$100", roi: "8%", f: ["Beginner-friendly","24/7 support","Daily payouts"] },
            { n: "Pro", min: "$1,000", roi: "15%", f: ["Priority support","Advanced analytics","Higher returns"], featured: true },
            { n: "VIP", min: "$10,000", roi: "25%", f: ["Dedicated manager","Custom strategies","Maximum ROI"] },
          ].map((p) => (
            <Card key={p.n} className={`surface-card border-white/5 relative ${p.featured ? "glow-gold" : ""}`}>
              {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 gold-gradient text-black text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>}
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-1">{p.n}</h3>
                <p className="text-sm text-muted-foreground mb-6">From {p.min}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-bold gold-text">{p.roi}</span>
                  <span className="text-muted-foreground">monthly ROI</span>
                </div>
                <ul className="space-y-2 text-sm mb-6">
                  {p.f.map((x) => <li key={x} className="flex gap-2 items-center"><span className="text-[var(--gold)]">✓</span>{x}</li>)}
                </ul>
                <Button className="w-full gold-gradient text-black hover:opacity-90" asChild><Link to="/plans">Select plan</Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-14">
          <div className="text-sm uppercase tracking-widest text-[var(--gold)] mb-2">Why choose us</div>
          <h2 className="text-4xl md:text-5xl font-bold">A platform you can trust</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Shield, t: "Bank-grade security", d: "Cold storage, 2FA, SOC2 compliant infrastructure." },
            { icon: Zap, t: "Instant withdrawals", d: "Most withdrawals processed within minutes, not days." },
            { icon: BarChart3, t: "Transparent returns", d: "Real-time dashboard. See every payout, every cent." },
            { icon: Lock, t: "Insured funds", d: "Up to $250k of client funds covered by our insurance." },
          ].map((x) => (
            <div key={x.t} className="surface-card rounded-xl p-6">
              <div className="h-11 w-11 rounded-lg bg-[var(--gold)]/10 grid place-items-center text-[var(--gold)] mb-4"><x.icon className="h-5 w-5" /></div>
              <h3 className="font-bold mb-1">{x.t}</h3>
              <p className="text-sm text-muted-foreground">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-14">
          <div className="text-sm uppercase tracking-widest text-[var(--gold)] mb-2">Testimonials</div>
          <h2 className="text-4xl md:text-5xl font-bold">Loved by investors</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "Sarah K.", r: "Verified VIP investor", q: "I've tried 5 platforms. YieldEmpire is the only one that pays out exactly as promised, every time." },
            { n: "Marcus L.", r: "Pro plan investor", q: "Withdrawals hit my wallet in 12 minutes. The dashboard alone is worth it." },
            { n: "Aiko T.", r: "Basic plan investor", q: "Started with $200. After 6 months I'm reinvesting profits monthly. Game-changer." },
          ].map((t) => (
            <Card key={t.n} className="surface-card border-white/5">
              <CardContent className="p-7">
                <div className="flex gap-1 mb-3 text-[var(--gold)]">{[...Array(5)].map((_,i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                <p className="text-sm mb-5 leading-relaxed">"{t.q}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gold-gradient grid place-items-center text-black font-bold">{t.n[0]}</div>
                  <div><div className="font-semibold text-sm">{t.n}</div><div className="text-xs text-muted-foreground">{t.r}</div></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-24">
        <div className="surface-card rounded-2xl p-12 text-center glow-gold">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to grow your portfolio?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Join thousands earning passive crypto income with YieldEmpireCapital.</p>
          <Button size="lg" className="gold-gradient text-black h-12 px-7" asChild>
            <Link to="/auth" search={{ mode: "register" }}>Open your account <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
