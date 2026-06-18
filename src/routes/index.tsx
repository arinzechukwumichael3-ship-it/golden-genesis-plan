import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useInView, animate, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState, type ReactNode } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, Wallet, Zap, Users, Lock, ArrowRight, Star, Check, Clock, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YieldEmpireCapital — BTC/USDT Copy Trading" },
      { name: "description", content: "Professional BTC and USDT copy trading with tiered 72-hour payouts. Join 12,400+ investors." },
    ],
  }),
  component: Home,
});

/* ── Animated trading chart canvas background ── */
function TradingChartBg({ isDark = false }: { isDark?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    // Particles
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * W(), y: Math.random() * H(),
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    }));

    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, W(), H());

      // Grid lines
      ctx.strokeStyle = "rgba(22,219,147,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W(); x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H()); ctx.stroke();
      }
      for (let y = 0; y < H(); y += 60) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W(), y); ctx.stroke();
      }

      // Animated chart lines (3 waves)
      const waves = [
        { amp: 40, freq: 0.012, phase: 0,    col: "rgba(22,219,147,0.18)", lw: 1.5 },
        { amp: 25, freq: 0.018, phase: 1.5,  col: "rgba(13,27,62,0.12)",   lw: 1 },
        { amp: 15, freq: 0.025, phase: 3,    col: "rgba(22,219,147,0.09)", lw: 0.8 },
      ];
      waves.forEach(({ amp, freq, phase, col, lw }) => {
        ctx.beginPath();
        ctx.strokeStyle = col;
        ctx.lineWidth = lw;
        for (let x = 0; x <= W(); x++) {
          const y = H() * 0.55 + amp * Math.sin(x * freq + t + phase)
            + amp * 0.4 * Math.sin(x * freq * 1.7 + t * 1.3 + phase);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Fill under the first wave
        if (lw === 1.5) {
          ctx.lineTo(W(), H()); ctx.lineTo(0, H()); ctx.closePath();
          const grad = ctx.createLinearGradient(0, H() * 0.3, 0, H());
          grad.addColorStop(0, "rgba(22,219,147,0.06)");
          grad.addColorStop(1, "rgba(22,219,147,0)");
          ctx.fillStyle = grad;
          ctx.fill();
        }
      });

      // Candlestick bars (faint)
      for (let i = 0; i < 24; i++) {
        const x = (i / 24) * W() + 12;
        const open = H() * 0.5 + Math.sin(i * 0.7 + t * 0.5) * 30;
        const close = open + (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 15 + 5);
        const high = Math.min(open, close) - Math.random() * 8;
        const low = Math.max(open, close) + Math.random() * 8;
        const isUp = close < open;
        const color = isUp ? "rgba(22,219,147,0.12)" : "rgba(239,68,68,0.08)";
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, high); ctx.lineTo(x, low); ctx.stroke();
        ctx.fillStyle = color;
        ctx.fillRect(x - 4, Math.min(open, close), 8, Math.abs(close - open));
      }

      // Floating particles
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W(); if (p.x > W()) p.x = 0;
        if (p.y < 0) p.y = H(); if (p.y > H()) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(22,219,147,0.25)";
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: isDark ? 0.75 : 0.38 }} />;
}

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

/* ── Magnetic Button (mouse-tracking spring offset) ── */
function MagneticButton({ children }: { children: ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 350, damping: 20 });
  const springY = useSpring(y, { stiffness: 350, damping: 20 });
  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left - rect.width / 2) * 0.28);
        y.set((e.clientY - rect.top - rect.height / 2) * 0.28);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ── Word-by-word reveal animation ── */
function WordReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          className={`inline-block mr-[0.22em] last:mr-0 ${className ?? ""}`}
          initial={{ opacity: 0, y: 38, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.62, delay: delay + i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {word}
        </motion.span>
      ))}
    </>
  );
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
  const { theme } = useTheme();
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
    <div className="relative w-full max-w-2xl mx-auto h-[220px] sm:h-[320px] md:h-[400px] flex items-center justify-center select-none pointer-events-none">
      {/* Radial glow behind cards */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(13,27,62,0.07),transparent_70%)]" />

      {/* Abstract floating geometric shapes */}
      <motion.div
        animate={{ y: [0, -18, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 left-8 md:left-20 w-16 h-16 rounded-2xl opacity-40"
        style={{
          background: "linear-gradient(135deg, rgba(13,27,62,0.35), rgba(13,27,62,0.1))",
          border: "1px solid rgba(13,27,62,0.2)",
          boxShadow: "0 8px 32px rgba(13,27,62,0.12)",
          transform: "rotate(15deg)",
        }}
      />
      <motion.div
        animate={{ y: [0, 14, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-8 right-6 md:right-20 w-12 h-12 opacity-30"
        style={{
          background: "linear-gradient(135deg, rgba(13,27,62,0.5), rgba(27,58,122,0.2))",
          border: "1px solid rgba(13,27,62,0.25)",
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          boxShadow: "0 8px 24px rgba(13,27,62,0.12)",
        }}
      />
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-14 right-10 md:right-28 w-8 h-8 rounded-lg opacity-25"
        style={{
          background: "rgba(13,27,62,0.4)",
          border: "1px solid rgba(13,27,62,0.3)",
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
          background: "linear-gradient(145deg, #0D1B3E 0%, #122040 100%)",
          border: "1px solid rgba(13,27,62,0.4)",
          boxShadow: "0 30px 60px -15px rgba(13,27,62,0.45), 0 0 0 1px rgba(13,27,62,0.2)",
        }}>
          {/* Card sheen highlight */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />
          {/* Green top edge */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(22,219,147,0.7)] to-transparent" />

          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#16DB93] mb-1">Portfolio Value</div>
                <div className="text-2xl font-bold tabular-nums text-white">$1,247,830</div>
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
                      <div className="text-xs font-semibold text-white">{r.coin}</div>
                      <div className="text-[9px] text-white/50">{r.amt}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-white">{r.val}</div>
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
        className="hidden sm:block absolute top-4 right-4 md:right-10 z-20 rounded-2xl overflow-hidden"
        style={theme === "dark" ? {
          background: "rgba(17,24,39,0.96)",
          border: "1px solid rgba(22,219,147,0.15)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(22,219,147,0.08)",
        } : {
          background: "rgba(255,255,255,0.98)",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
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
        className="hidden sm:block absolute bottom-4 left-4 md:left-10 z-20 rounded-2xl overflow-hidden"
        style={theme === "dark" ? {
          background: "rgba(17,24,39,0.96)",
          border: "1px solid rgba(22,219,147,0.15)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(22,219,147,0.08)",
        } : {
          background: "rgba(255,255,255,0.98)",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
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

const easeOut = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];
const fadeUp = { hidden: { opacity: 0, y: 52, scale: 0.95, filter: "blur(6px)" }, show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.72, ease: easeOut } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.13, delayChildren: 0.08 } } };

/* ── Page ── */
function Home() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <SiteLayout>

      {/* ── HERO — with animated canvas background ── */}
      <section ref={heroRef} className="relative pt-10 pb-8 sm:pt-12 sm:pb-8 sm:min-h-[90vh] flex flex-col justify-center">
        {/* Animated canvas background */}
        <TradingChartBg isDark={theme === "dark"} />

        {/* Gradient overlays */}
        <div className={`absolute inset-0 ${theme === "dark"
          ? "bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(22,219,147,0.08),transparent_70%)]"
          : "bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(13,27,62,0.04),transparent_65%)]"}`}
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative mx-auto max-w-5xl px-4 text-center">
          {/* 3D Visual — hidden on mobile, visible from sm (640px) up */}
          <motion.div className="hidden sm:block" initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <HeroVisual />
          </motion.div>

          {/* Live badge */}
          <motion.div initial={{ opacity: 0, y: 20, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 surface-card rounded-full px-4 py-1.5 text-xs mb-3 sm:mb-5 border border-[rgba(22,219,147,0.2)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16DB93] animate-pulse" />
            <span className="text-muted-foreground">{t("hero.badge")}</span>
          </motion.div>

          {/* Headline — word-by-word reveal */}
          <h1 className="text-[1.9rem] sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.08] tracking-tight mb-3 sm:mb-5">
            <WordReveal text={t("hero.headline")} delay={0.3} />
            <br />
            <WordReveal text={t("hero.headlineAccent")} className="gold-text" delay={0.52} />
          </h1>

          <motion.p initial={{ opacity: 0, y: 20, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.7, delay: 0.45 }}
            className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 sm:mb-8">
            {t("hero.subtext")}
          </motion.p>

          {/* Global stats row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}
            className="flex items-center justify-center gap-4 sm:gap-8 md:gap-16 mb-4 sm:mb-8">
            {[
              { value: 195, suffix: "+", label: t("stats.countries") },
              { value: 12400, suffix: "+", label: t("stats.investors") },
              { value: null, display: "$1.2B+", label: t("stats.assets") },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold gold-text tabular-nums">
                  {s.value !== null ? <Counter to={s.value} suffix={s.suffix} /> : s.display}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 sm:mb-8">
            <MagneticButton>
              <Button size="lg" className="gold-gradient text-white hover:opacity-90 h-13 px-8 animate-glow-pulse font-semibold text-base" asChild>
                <Link to="/auth" search={{ mode: "register" }}>{t("hero.cta")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button size="lg" variant="outline" className="h-13 px-8 border-[#0D1B3E]/20 dark:border-white/20 hover:border-[rgba(22,219,147,0.5)] hover:text-[#16DB93] transition-colors" asChild>
                <Link to="/plans">{t("hero.ctaSecondary")}</Link>
              </Button>
            </MagneticButton>
          </motion.div>

          {/* Trust badges */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.75 }}
            className="hidden sm:flex flex-wrap items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03, y: -2 }} className="flex items-center gap-3 surface-card rounded-2xl px-4 py-3 border border-[rgba(22,219,147,0.08)]">
              <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[#16DB93] text-[#16DB93]" />)}</div>
              <div>
                <div className="text-sm font-bold">Excellent</div>
                <div className="text-[11px] text-muted-foreground">58,842 reviews · Trustpilot</div>
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03, y: -2 }} className="flex items-center gap-3 surface-card rounded-2xl px-4 py-3 border border-[rgba(22,219,147,0.08)]">
              <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}</div>
              <div>
                <div className="text-sm font-bold">Excellent</div>
                <div className="text-[11px] text-muted-foreground">4.8 rated · Google</div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
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
      <section className="relative overflow-hidden py-14 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_50%,rgba(22,219,147,0.07),transparent_70%)]" />
        <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -55, filter: "blur(8px)" }} whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}>
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
            <Button className="mt-8 gold-gradient text-white hover:opacity-90" asChild>
              <Link to="/plans">Explore plans <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 55, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
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
                initial={{ opacity: 0, y: 36, scale: 0.94, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ y: -6, scale: 1.02 }}
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
      <section className="py-12 sm:py-24 border-t border-[rgba(22,219,147,0.06)]">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div initial={{ opacity: 0, y: 24, filter: "blur(8px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}
            className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-3">{t("howItWorks.title")}</h2>
            <p className="text-muted-foreground text-lg">{t("howItWorks.sub")}</p>
          </motion.div>

          <div className="space-y-12 sm:space-y-24">
            {/* Step 01 */}
            <motion.div
              initial={{ opacity: 0, x: -65, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] }}
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
                style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(22,219,147,0.1)" }}
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
                  <div key={step} className="flex items-center gap-3 py-2.5 border-b border-[rgba(0,0,0,0.05)] last:border-0">
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
              initial={{ opacity: 0, x: 65, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] }}
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
                    background: "linear-gradient(145deg, #0D1B3E 0%, #122040 100%)",
                    border: "1px solid rgba(13,27,62,0.35)",
                    boxShadow: "0 30px 60px -15px rgba(13,27,62,0.4), 0 0 0 1px rgba(13,27,62,0.2)",
                  }}>
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(22,219,147,0.6)] to-transparent" />
                    <div className="p-10 text-center">
                      <div className="text-xs uppercase tracking-widest text-white/60 mb-4">Total paid out</div>
                      <div className="text-6xl font-bold gold-text mb-2">$1.2B+</div>
                      <div className="text-sm text-white/60">rewarded to investors</div>
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
              initial={{ opacity: 0, x: -65, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] }}
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
                style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.07)" }}
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
                <div className="flex justify-between text-[10px] text-muted-foreground border-t border-[rgba(0,0,0,0.06)] pt-3">
                  <span>Starting at $500</span>
                  <span className="text-[#16DB93]">Up to 10× returns</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PLANS OVERVIEW ── */}
      <section className="py-16 sm:py-24 border-t border-[rgba(22,219,147,0.06)] bg-[rgba(22,219,147,0.015)]">
        <motion.div className="mx-auto max-w-7xl px-4" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-14">
            <div className="text-xs uppercase tracking-widest text-[#16DB93] mb-3">Investment Plans</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("plans.title")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("plans.sub")}</p>
          </div>

          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
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
                    <div className="gold-gradient text-white text-xs font-bold text-center py-2 tracking-wider">VIP SELECTION</div>
                  )}
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="mb-4 sm:mb-6">
                      <div className="text-xs text-muted-foreground mb-1">{plan.sub}</div>
                      <h3 className="text-lg sm:text-2xl font-bold">{plan.name}</h3>
                    </div>

                    <div className="rounded-2xl border border-[rgba(0,0,0,0.07)] bg-black/[0.02] p-3 sm:p-4 mb-4 sm:mb-6">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Return structure</div>
                      <div className="space-y-2">
                        {plan.entries.map(([inv, earn]) => (
                          <div key={inv} className="flex justify-between text-sm border border-[rgba(0,0,0,0.07)] rounded-lg px-3 py-2 bg-black/[0.03]">
                            <span className="text-muted-foreground">{inv}</span>
                            <span className="font-semibold text-[#16DB93]">{earn}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 sm:mb-6">
                      {plan.features.map(f => (
                        <div key={f} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <span className="h-4 w-4 rounded-full bg-[rgba(22,219,147,0.15)] grid place-items-center shrink-0">
                            <Check className="h-2.5 w-2.5 text-[#16DB93]" strokeWidth={3} />
                          </span>
                          {f}
                        </div>
                      ))}
                    </div>

                    <Button className="w-full gold-gradient text-white hover:opacity-95 font-semibold" asChild>
                      <Link to="/auth" search={{ mode: "register" }}>{t("plans.start")}</Link>
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-12 sm:py-24 border-t border-[rgba(22,219,147,0.06)]">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-14">
            <div className="text-xs uppercase tracking-widest text-[#16DB93] mb-3">Investor Testimonials</div>
            <h2 className="text-4xl md:text-5xl font-bold">Trusted by thousands</h2>
          </motion.div>

          <motion.div className="grid sm:grid-cols-3 gap-4 sm:gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {[
              { name: "Alex Morrison",  country: "United States",  rating: 5, text: "Got my VIP payout in less than 72 hours. No drama, no delays. My capital has grown 8× in 4 months.",              avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
              { name: "Sarah Kim",      country: "United Kingdom", rating: 5, text: "Started with the Basic plan. The returns showed up exactly when they said. Now I'm on Premium BTC.",         avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
              { name: "Daniel Richter", country: "Germany",        rating: 5, text: "The copy trading platform I was looking for. Institutional quality, transparent returns. Highly recommend.", avatar: "https://randomuser.me/api/portraits/men/67.jpg" },
            ].map((testimonial) => (
              <motion.div key={testimonial.name} variants={fadeUp}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -6, rotateY: 2 }}
                  transition={{ duration: 0.22 }}
                  className="surface-card rounded-3xl p-4 sm:p-7 border border-[rgba(22,219,147,0.08)] hover:border-[rgba(22,219,147,0.22)] transition-colors duration-300 h-full flex flex-col"
                  style={{ transformStyle: "preserve-3d", perspective: "800px" }}
                >
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.span key={i} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08, duration: 0.3, type: "spring" }} viewport={{ once: true }}>
                        <Star className="h-4 w-4 fill-[#16DB93] text-[#16DB93]" />
                      </motion.span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{testimonial.text}"</p>
                  <div className="mt-5 pt-4 border-t border-[rgba(22,219,147,0.06)] flex items-center gap-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-10 w-10 rounded-full object-cover border-2 border-[rgba(22,219,147,0.25)] shrink-0"
                    />
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.country}</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12 sm:py-24 border-t border-[rgba(22,219,147,0.06)] relative overflow-hidden">
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

        <motion.div initial={{ opacity: 0, y: 24, filter: "blur(8px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8 }}
          className="relative text-center max-w-3xl mx-auto px-4">
          <div className="text-xs uppercase tracking-widest text-[#16DB93] mb-4">Start Today</div>
          <h2 className="text-4xl md:text-6xl font-bold mb-5">
            {t("cta.title")}<br /><span className="gold-text">{t("cta.titleAccent")}</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">{t("cta.sub")}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <MagneticButton>
              <Button size="lg" className="gold-gradient text-white hover:opacity-90 h-13 px-10 animate-glow-pulse font-semibold text-base" asChild>
                <Link to="/auth" search={{ mode: "register" }}>{t("cta.button")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button size="lg" variant="outline" className="h-13 px-8 border-[#0D1B3E]/20 dark:border-white/20 hover:border-[rgba(22,219,147,0.5)] hover:text-[#16DB93] transition-colors" asChild>
                <Link to="/contact">{t("cta.secondary")}</Link>
              </Button>
            </MagneticButton>
          </div>
        </motion.div>
      </section>

    </SiteLayout>
  );
}
