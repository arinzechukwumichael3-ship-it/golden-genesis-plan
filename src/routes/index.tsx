import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield, TrendingUp, Wallet, Zap, BarChart3, Lock, ArrowRight, Star,
  Clock, Bitcoin, Crown, LineChart, CheckCircle2, Copy,
} from "lucide-react";
import heroVideo from "@/assets/hero.mp4.asset.json";
import { useCurrency } from "@/lib/currency";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YieldEmpireCapital — BTC & USDT Copy Trading" },
      {
        name: "description",
        content:
          "Professional BTC and USDT copy trading. Mirror our institutional desk and receive fixed returns within 72 hours. USD, EUR, and GBP supported.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { info, formatFromEUR } = useCurrency();

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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(240,180,41,0.18),transparent_55%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 surface-card rounded-full px-3 py-1 text-xs mb-6">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-muted-foreground">Live desk · 12,400+ active investors</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6 font-display">
              BTC &amp; USDT<br />
              <span className="gold-text">Copy Trading</span><br />
              <span className="text-3xl md:text-4xl text-muted-foreground font-medium">that pays in 72 hours.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mb-8">
              Mirror our institutional trading desk in real time. Fixed-return tiers from {formatFromEUR(500)} up to
              5 BTC — settlement guaranteed within 72 hours of your confirmed deposit. Priced in {info.code}, EUR, and GBP.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gold-gradient text-black hover:opacity-90 text-base h-12 px-7" asChild>
                <Link to="/auth" search={{ mode: "register" }}>
                  Start Copy Trading <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-7" asChild>
                <Link to="/plans">View Plans</Link>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 text-sm max-w-md">
              <Stat label="AUM" value={formatFromEUR(1_100_000_000).replace(/,?\d{3},?\d{3}$/, "")+"B+"} />
              <Stat label="Avg payout" value="< 72h" />
              <Stat label="Win rate" value="91%" />
            </div>
          </motion.div>

          {/* HERO CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="surface-card rounded-2xl p-6 glow-gold relative">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                  <Copy className="w-3 h-3 text-[var(--gold)]" /> Copy-trade portfolio
                </div>
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                </span>
              </div>
              <div className="text-4xl font-bold tabular-nums font-display">
                {formatFromEUR(48231)}<span className="text-muted-foreground text-2xl">.52</span>
              </div>
              <div className="text-sm text-emerald-400 mb-6">+{formatFromEUR(1842)} (3.97%) today</div>

              <div className="space-y-3 mb-5">
                {[
                  { c: "BTC", amt: "0.421", pnl: "+12.4%" },
                  { c: "ETH", amt: "3.180", pnl: "+8.1%" },
                  { c: "USDT", amt: "5,771", pnl: "+5.0%" },
                ].map((r) => (
                  <div key={r.c} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full gold-gradient grid place-items-center text-black text-xs font-bold">{r.c}</div>
                      <div>
                        <div className="font-semibold text-sm">{r.c}</div>
                        <div className="text-xs text-muted-foreground tabular-nums">{r.amt}</div>
                      </div>
                    </div>
                    <div className="text-emerald-400 text-sm font-semibold tabular-nums">{r.pnl}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-[var(--gold)]/20 bg-[var(--gold)]/5 px-4 py-3 text-xs">
                <div className="flex items-center gap-2 text-[var(--gold)] font-semibold mb-0.5">
                  <Clock className="w-3.5 h-3.5" /> Next payout in 41h 22m
                </div>
                <div className="text-muted-foreground">Auto-credited to your wallet</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-14">
          <div className="text-sm uppercase tracking-widest text-[var(--gold)] mb-2">How copy trading works</div>
          <h2 className="text-4xl md:text-5xl font-bold font-display">From deposit to payout in 72 hours</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { i: 1, t: "Fund your account", d: `Deposit BTC, USDT, ETH, or BNB. Track balances in ${info.code}, EUR, or GBP.`, icon: Wallet },
            { i: 2, t: "Pick a plan tier", d: "Basic, VIP, or Premium. The platform copies our desk's positions to yours automatically.", icon: Copy },
            { i: 3, t: "Withdraw your profit", d: "Fixed payout lands in your wallet within 72 hours of activation. Every tier, every time.", icon: TrendingUp },
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
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PLANS PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-14">
          <div className="text-sm uppercase tracking-widest text-[var(--gold)] mb-2">Plan tiers</div>
          <h2 className="text-4xl md:text-5xl font-bold font-display">Choose your allocation</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Three professionally-managed tiers. Fixed multipliers, 72-hour settlement.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <PlanPreview
            icon={Zap}
            name="Basic"
            tagline="Entry tier"
            from={`From ${formatFromEUR(500)}`}
            multiplier="Up to 2.78×"
            highlights={["EUR / USD / GBP", "USDT or BTC funding", "Daily desk updates"]}
          />
          <PlanPreview
            icon={Crown}
            name="VIP"
            tagline="Most popular"
            from={`From ${formatFromEUR(1000)}`}
            multiplier="Up to 10×"
            highlights={["Dedicated account manager", "Priority payout queue", "Advanced strategies"]}
            featured
          />
          <PlanPreview
            icon={Bitcoin}
            name="Premium"
            tagline="Whale tier"
            from="From 1 BTC"
            multiplier="3× on every tier"
            highlights={["Native BTC settlement", "Cold-storage custody", "White-glove onboarding"]}
          />
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg" asChild>
            <Link to="/plans">See all plan tiers <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-14">
          <div className="text-sm uppercase tracking-widest text-[var(--gold)] mb-2">Why YieldEmpire</div>
          <h2 className="text-4xl md:text-5xl font-bold font-display">Built for serious capital</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Shield, t: "Bank-grade security", d: "Cold storage, 2FA, SOC2-compliant infrastructure." },
            { icon: Zap, t: "72-hour payouts", d: "Fixed-return cycles. No vesting, no lock-ups." },
            { icon: LineChart, t: "Live desk", d: "Real institutional traders. Your portfolio mirrors theirs." },
            { icon: Lock, t: "Multi-currency", d: "View, deposit, and withdraw in USD, EUR, or GBP." },
          ].map((x) => (
            <div key={x.t} className="surface-card rounded-xl p-6 hover:border-[var(--gold)]/30 transition-colors border border-white/5">
              <div className="h-11 w-11 rounded-lg bg-[var(--gold)]/10 grid place-items-center text-[var(--gold)] mb-4"><x.icon className="h-5 w-5" /></div>
              <h3 className="font-bold mb-1">{x.t}</h3>
              <p className="text-sm text-muted-foreground">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PERFORMANCE STRIP */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="surface-card rounded-2xl border border-white/5 p-8 md:p-10 grid md:grid-cols-4 gap-6 items-center">
          <Stat large label="Capital under copy-trade" value={formatFromEUR(1_100_000_000).replace(/[\d,]+/, "1.1B")} />
          <Stat large label="Completed payouts" value="184,200+" />
          <Stat large label="Avg settlement" value="58h" />
          <Stat large label="Investor satisfaction" value="4.9 / 5" />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-14">
          <div className="text-sm uppercase tracking-widest text-[var(--gold)] mb-2">Investor stories</div>
          <h2 className="text-4xl md:text-5xl font-bold font-display">Trusted across 60+ countries</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "Sarah K.", r: "Verified VIP investor", q: `Deposited ${formatFromEUR(2000)} on a Monday. Payout hit my wallet Thursday morning. Exactly as promised.` },
            { n: "Marcus L.", r: "Premium · BTC tier", q: "Sent 1 BTC, received 3 BTC back inside 72 hours. The dashboard kept me updated the entire time." },
            { n: "Aiko T.", r: "Basic tier investor", q: `Started with ${formatFromEUR(500)}. Reinvested twice. The 72-hour cycle is the real deal — no excuses, no delays.` },
          ].map((t) => (
            <Card key={t.n} className="surface-card border-white/5">
              <CardContent className="p-7">
                <div className="flex gap-1 mb-3 text-[var(--gold)]">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                <p className="text-sm mb-5 leading-relaxed">"{t.q}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gold-gradient grid place-items-center text-black font-bold">{t.n[0]}</div>
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-1">{t.n} <CheckCircle2 className="h-3.5 w-3.5 text-[var(--gold)]" /></div>
                    <div className="text-xs text-muted-foreground">{t.r}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-24">
        <div className="surface-card rounded-2xl p-12 text-center glow-gold relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(240,180,41,0.12),transparent_70%)]" />
          <div className="relative">
            <BarChart3 className="h-10 w-10 mx-auto text-[var(--gold)] mb-4" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">Activate your copy-trade slot</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Limited daily slots. Once allocated, your tier is locked in and payouts begin immediately.
            </p>
            <Button size="lg" className="gold-gradient text-black h-12 px-7" asChild>
              <Link to="/auth" search={{ mode: "register" }}>Open your account <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Stat({ label, value, large }: { label: string; value: string; large?: boolean }) {
  return (
    <div>
      <div className={`${large ? "text-3xl md:text-4xl" : "text-2xl"} font-bold gold-text font-display tabular-nums`}>{value}</div>
      <div className="text-xs md:text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function PlanPreview({
  icon: Icon, name, tagline, from, multiplier, highlights, featured,
}: {
  icon: React.ComponentType<{ className?: string }>;
  name: string; tagline: string; from: string; multiplier: string; highlights: string[]; featured?: boolean;
}) {
  return (
    <Card className={`surface-card border-white/5 relative ${featured ? "glow-gold border-[var(--gold)]/40" : ""}`}>
      {featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 gold-gradient text-black text-[10px] font-bold tracking-wider px-3 py-1 rounded-full">MOST POPULAR</div>}
      <CardContent className="p-7">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[var(--gold)]" />
          </div>
          <div>
            <h3 className="text-xl font-bold leading-none">{name}</h3>
            <div className="text-xs text-muted-foreground mt-1">{tagline}</div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">{from}</div>
        <div className="text-3xl font-bold gold-text font-display mt-1 mb-4">{multiplier}</div>
        <ul className="space-y-2 text-sm mb-6">
          {highlights.map((h) => (
            <li key={h} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--gold)] mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{h}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full gold-gradient text-black hover:opacity-90" asChild>
          <Link to="/plans">View tiers</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
