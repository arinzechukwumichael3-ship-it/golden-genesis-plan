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

function AnimatedCount({ value, prefix = "" }: { value: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, { duration: 1.5, ease: "easeOut", onUpdate: (v) => setDisplay(Math.floor(v)) });
    return c.stop;
  }, [inView, value]);
  return <span ref={ref}>{prefix}{display.toLocaleString()}</span>;
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
  const cardCls = `rounded-2xl border p-5 ${isDark ? "bg-[rgba(10,11,13,0.85)] border-[rgba(22,219,147,0.1)]" : "bg-white border-[rgba(22,219,147,0.12)] shadow-sm"}`;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-8">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.22em] text-[#16DB93] mb-1 font-semibold">Referral Program</div>
          <h1 className="text-2xl font-bold">Refer &amp; earn</h1>
          <p className="text-sm text-muted-foreground mt-1">Invite friends and earn 5% of their first approved deposit.</p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-5"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {[
            { icon: Users, label: "Total referrals", value: refs.length, prefix: "",  accent: false },
            { icon: Gift,  label: "Total earned",    value: earned,      prefix: "$", accent: true  },
          ].map((s) => (
            <motion.div
              key={s.label}
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
              className={`rounded-2xl border p-4 relative overflow-hidden ${s.accent ? "border-[rgba(22,219,147,0.25)]" : isDark ? "border-[rgba(22,219,147,0.08)]" : "border-[rgba(22,219,147,0.1)]"} ${isDark ? "bg-[rgba(10,11,13,0.85)]" : "bg-white shadow-sm"}`}
            >
              {s.accent && <div className="absolute inset-x-0 top-0 h-[2px] gold-gradient" />}
              {s.accent && (
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(22,219,147,0.07) 0%, transparent 60%)" }} />
              )}
              <div className="relative">
                <div className="h-7 w-7 rounded-lg bg-[rgba(22,219,147,0.1)] grid place-items-center mb-3">
                  <s.icon className="h-3.5 w-3.5 text-[#16DB93]" />
                </div>
                <div className="text-xl font-bold tabular-nums gold-text">
                  <AnimatedCount value={s.value as number} prefix={s.prefix} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Referral card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative rounded-2xl overflow-hidden mb-5"
          style={{
            background: "linear-gradient(135deg, #0D1B3E 0%, #0a1428 50%, rgba(22,219,147,0.1) 100%)",
            border: "1px solid rgba(22,219,147,0.2)",
            boxShadow: "0 4px 24px rgba(22,219,147,0.07)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 15% 100%, rgba(22,219,147,0.18) 0%, transparent 50%)" }} />
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 90% 0%, rgba(22,219,147,0.08) 0%, transparent 50%)" }} />

          <div className="relative p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#16DB93]/60 mb-0.5">YieldEmpire Capital</div>
                <div className="text-[10px] text-white/30">Referral Program</div>
              </div>
              <div className="flex items-center gap-1.5 bg-[rgba(22,219,147,0.1)] border border-[rgba(22,219,147,0.22)] rounded-full px-2.5 py-1">
                <Star className="h-3 w-3 text-[#16DB93]" fill="#16DB93" />
                <span className="text-[11px] font-bold text-[#16DB93]">5% Bonus</span>
              </div>
            </div>

            <div className="mb-5">
              <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Your referral code</div>
              <div className="text-2xl font-bold tracking-[0.16em] gold-text font-mono">{code || "———"}</div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Shareable link</div>
              <div className="flex gap-2 items-center">
                <code className="flex-1 bg-black/40 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-white/50 font-mono truncate">
                  {link}
                </code>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={copy}
                  className="shrink-0 h-9 w-9 rounded-xl border grid place-items-center transition-all duration-200"
                  style={{
                    borderColor: copied ? "rgba(22,219,147,0.5)" : "rgba(255,255,255,0.08)",
                    background: copied ? "rgba(22,219,147,0.12)" : "transparent",
                  }}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-[#16DB93]" /> : <Copy className="h-3.5 w-3.5 text-white/40" />}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.22 }}
          className={`${cardCls} mb-5`}
        >
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">How it works</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Share2,     step: "01", title: "Share link",     desc: "Send to friends" },
              { icon: Users,      step: "02", title: "They deposit",   desc: "Friend joins & funds" },
              { icon: TrendingUp, step: "03", title: "You earn 5%",    desc: "Auto-credited" },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="rounded-xl border border-[rgba(22,219,147,0.07)] bg-[rgba(22,219,147,0.02)] p-3 text-center">
                <div className="h-8 w-8 rounded-xl bg-[rgba(22,219,147,0.08)] border border-[rgba(22,219,147,0.12)] grid place-items-center mx-auto mb-2">
                  <Icon className="h-3.5 w-3.5 text-[#16DB93]" />
                </div>
                <div className="text-[10px] text-[#16DB93] font-bold mb-0.5">{step}</div>
                <div className="text-xs font-semibold">{title}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className={cardCls}
        >
          <h2 className="text-sm font-bold mb-4">Referral activity</h2>
          {refs.length === 0 ? (
            <div className="py-8 text-center">
              <div className="h-10 w-10 rounded-full bg-[rgba(22,219,147,0.06)] grid place-items-center mx-auto mb-2">
                <Users className="h-4 w-4 text-muted-foreground/30" />
              </div>
              <div className="text-sm text-muted-foreground">No referrals yet</div>
              <div className="text-xs text-muted-foreground/50 mt-0.5">Share your link to start earning</div>
            </div>
          ) : (
            <div className="divide-y divide-[rgba(22,219,147,0.05)]">
              {refs.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="py-3 flex justify-between items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-[rgba(22,219,147,0.06)] border border-[rgba(22,219,147,0.1)] grid place-items-center">
                      <Users className="h-3 w-3 text-[#16DB93]/50" />
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
                    <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">Pending</span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>
    </SiteLayout>
  );
}
