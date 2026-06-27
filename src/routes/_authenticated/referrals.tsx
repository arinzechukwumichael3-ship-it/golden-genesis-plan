import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, animate, useInView } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Gift, Copy, Check, Share2, TrendingUp, Star } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/_authenticated/referrals")({
  component: Referrals,
});

type Ref = { id: string; referred_id: string; bonus_paid: boolean; bonus_amount: number; created_at: string };

function AnimatedCount({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, { duration: 1.5, ease: "easeOut", onUpdate: (v) => setDisplay(Math.floor(v)) });
    return c.stop;
  }, [inView, value]);
  return <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

function ReferralCard({ code, link, onCopy, copied }: { code: string; link: string; onCopy: () => void; copied: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.2 }}
      className="relative rounded-2xl overflow-hidden mb-4 w-full"
      style={{
        background: "linear-gradient(135deg, #0D1B3E 0%, #0a1428 45%, rgba(22,219,147,0.12) 100%)",
        border: "1px solid rgba(22,219,147,0.22)",
        boxShadow: "0 8px 40px rgba(22,219,147,0.08), 0 0 0 1px rgba(22,219,147,0.06)",
      }}
    >
      {/* Glow orbs */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 20% 110%, rgba(22,219,147,0.22) 0%, transparent 50%)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 90% -10%, rgba(22,219,147,0.1) 0%, transparent 50%)" }} />

      {/* Decorative circles */}
      <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #16DB93 0%, transparent 70%)" }} />

      <div className="relative p-4 sm:p-7">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#16DB93]/70 mb-0.5">YieldEmpire Capital</div>
            <div className="text-xs text-white/30">Referral Program</div>
          </div>
          <div className="flex items-center gap-2 bg-[rgba(22,219,147,0.1)] border border-[rgba(22,219,147,0.25)] rounded-full px-3 py-1">
            <Star className="h-3 w-3 text-[#16DB93]" fill="#16DB93" />
            <span className="text-xs font-semibold text-[#16DB93]">5% Bonus</span>
          </div>
        </div>

        {/* Code */}
        <div className="mb-4 sm:mb-7 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Your referral code</div>
          <div className="text-xl sm:text-3xl font-bold tracking-[0.08em] sm:tracking-[0.16em] gold-text font-mono break-all">{code || "———"}</div>
        </div>

        {/* Link */}
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Shareable link</div>
          <div className="flex gap-2 items-center min-w-0">
            <code className="flex-1 min-w-0 bg-black/40 border border-white/[0.06] rounded-xl px-3 sm:px-4 py-2.5 text-xs text-white/50 font-mono truncate">
              {link}
            </code>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onCopy}
              className="shrink-0 h-10 w-10 rounded-xl border grid place-items-center transition-all duration-200"
              style={{
                borderColor: copied ? "rgba(22,219,147,0.5)" : "rgba(255,255,255,0.1)",
                background: copied ? "rgba(22,219,147,0.12)" : "transparent",
              }}
            >
              {copied
                ? <Check className="h-4 w-4 text-[#16DB93]" />
                : <Copy className="h-4 w-4 text-white/40" />
              }
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Referrals() {
  const [code, setCode] = useState("");
  const [refs, setRefs] = useState<Ref[]>([]);
  const [earned, setEarned] = useState(0);
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("referral_code").eq("id", u.user.id).maybeSingle(),
        supabase.from("referrals").select("*").eq("referrer_id", u.user.id).order("created_at", { ascending: false }),
      ]);
      setCode(p?.referral_code || "");
      const list = (r as Ref[]) || [];
      setRefs(list);
      setEarned(list.reduce((s, x) => s + Number(x.bonus_amount || 0), 0));
    })();
  }, []);

  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/auth?mode=register&ref=${code}`;

  const copy = () => {
    navigator.clipboard.writeText(link);
    toast.success("Copied to clipboard");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDark = theme === "dark";
  const cardCls = `rounded-2xl border p-4 sm:p-6 ${isDark ? "bg-[rgba(10,11,13,0.85)] border-[rgba(22,219,147,0.1)]" : "bg-white border-[rgba(22,219,147,0.12)] shadow-sm"}`;

  return (
    <SiteLayout>
      <section className="w-full mx-auto max-w-4xl px-4 py-4 sm:py-8">
        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative rounded-2xl overflow-hidden mb-4 p-4 sm:p-6 w-full"
          style={{
            background: "linear-gradient(135deg, #0D1B3E 0%, #0A0B0D 55%, #0a1428 100%)",
            border: "1px solid rgba(22,219,147,0.12)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 85% 50%, rgba(22,219,147,0.1) 0%, transparent 55%)" }} />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[#16DB93] mb-1.5 font-semibold">Referral Program</div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1.5 text-white">Refer &amp; earn</h1>
            <p className="text-sm text-white/50 max-w-md">Invite friends and earn 5% of their first approved deposit — auto-credited to your wallet.</p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Left: referral card + steps */}
          <div>
            <ReferralCard code={code} link={link} onCopy={copy} copied={copied} />

            {/* How it works */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className={cardCls}
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">How it works</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Share2,     step: "01", title: "Share link",    desc: "Send to friends" },
                  { icon: Users,      step: "02", title: "They deposit",  desc: "Join & deposit" },
                  { icon: TrendingUp, step: "03", title: "Earn 5%",       desc: "Auto-credited" },
                ].map(({ icon: Icon, step, title, desc }) => (
                  <div key={step} className="rounded-xl border border-[rgba(22,219,147,0.08)] bg-[rgba(22,219,147,0.02)] p-2.5 text-center">
                    <div className="h-7 w-7 rounded-lg bg-[rgba(22,219,147,0.08)] border border-[rgba(22,219,147,0.15)] grid place-items-center mx-auto mb-2">
                      <Icon className="h-3.5 w-3.5 text-[#16DB93]" />
                    </div>
                    <div className="text-[10px] text-[#16DB93] font-bold mb-0.5">{step}</div>
                    <div className="text-xs font-semibold leading-tight mb-0.5">{title}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">{desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: stats + activity */}
          <div className="flex flex-col gap-5">
            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 gap-3"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            >
              {[
                { icon: Users, label: "Total referrals",  value: refs.length, prefix: "",  accent: false },
                { icon: Gift,  label: "Total earned",     value: earned,       prefix: "$", accent: true  },
              ].map((s) => (
                <motion.div
                  key={s.label}
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                  className={`rounded-2xl border p-4 relative overflow-hidden ${s.accent ? "border-[rgba(22,219,147,0.2)]" : isDark ? "border-[rgba(22,219,147,0.08)]" : "border-[rgba(22,219,147,0.1)]"} ${isDark ? "bg-[rgba(10,11,13,0.85)]" : "bg-white shadow-sm"}`}
                >
                  {s.accent && (
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(22,219,147,0.08) 0%, transparent 60%)" }} />
                  )}
                  {s.accent && <div className="absolute inset-x-0 top-0 h-[2px] gold-gradient" />}
                  <div className="relative">
                    <div className="h-8 w-8 rounded-lg bg-[rgba(22,219,147,0.1)] grid place-items-center mb-3">
                      <s.icon className="h-4 w-4 text-[#16DB93]" />
                    </div>
                    <div className="text-xl font-bold tabular-nums gold-text">
                      <AnimatedCount value={s.value as number} prefix={s.prefix} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Activity */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={`${cardCls} flex-1`}
            >
              <h2 className="text-sm font-bold mb-5">Referral activity</h2>
              {refs.length === 0 ? (
                <div className="py-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-[rgba(22,219,147,0.06)] grid place-items-center mx-auto mb-3">
                    <Users className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                  <div className="text-sm text-muted-foreground">No referrals yet</div>
                  <div className="text-xs text-muted-foreground/50 mt-1">Share your link to start earning</div>
                </div>
              ) : (
                <div className="space-y-1 divide-y divide-[rgba(22,219,147,0.05)]">
                  {refs.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 + i * 0.06 }}
                      className="py-3 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[rgba(22,219,147,0.06)] border border-[rgba(22,219,147,0.12)] grid place-items-center">
                          <Users className="h-3.5 w-3.5 text-[#16DB93]/60" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Referred user</div>
                          <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      {r.bonus_paid ? (
                        <div className="text-right">
                          <div className="text-sm font-bold text-[#16DB93]">+${r.bonus_amount.toLocaleString()}</div>
                          <div className="text-[10px] text-muted-foreground">Paid</div>
                        </div>
                      ) : (
                        <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full">
                          Pending
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
