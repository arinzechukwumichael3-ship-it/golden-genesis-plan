import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, animate, useInView } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Gift, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/referrals")({
  component: Referrals,
});

type Ref = { id: string; referred_id: string; bonus_paid: boolean; bonus_amount: number; created_at: string };

function AnimatedCount({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, { duration: 1.5, ease: "easeOut", onUpdate: (v) => setDisplay(Math.floor(v)) });
    return c.stop;
  }, [inView, value]);
  return <span ref={ref}>{display.toLocaleString()}</span>;
}

function Referrals() {
  const [code, setCode] = useState("");
  const [refs, setRefs] = useState<Ref[]>([]);
  const [earned, setEarned] = useState(0);
  const [copied, setCopied] = useState(false);

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

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <div className="text-xs uppercase tracking-widest text-[#16DB93] mb-2">Referral Program</div>
          <h1 className="text-3xl font-bold mb-1">Refer &amp; earn</h1>
          <p className="text-sm text-muted-foreground">Earn 5% bonus on every referred user's first approved deposit.</p>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          className="grid sm:grid-cols-3 gap-4 mb-8"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {[
            { icon: Users, label: "Total referrals",  value: refs.length,   prefix: "",  accent: false },
            { icon: Gift,  label: "Bonus earned",      value: earned,        prefix: "$", accent: true  },
            { icon: Copy,  label: "Your referral code", value: null,          prefix: "",  accent: false, code },
          ].map((s) => (
            <motion.div key={s.label} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
              <Card className={`surface-card border-[rgba(22,219,147,0.08)] relative overflow-hidden ${s.accent ? "animate-glow-pulse" : "hover:border-[rgba(22,219,147,0.2)]"} transition-colors duration-300`}>
                {s.accent && <div className="absolute inset-x-0 top-0 h-[3px] gold-gradient" />}
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                    <div className="h-8 w-8 rounded-lg bg-[rgba(22,219,147,0.1)] grid place-items-center">
                      <s.icon className="h-4 w-4 text-[#16DB93]" />
                    </div>
                  </div>
                  {s.code ? (
                    <div className="text-2xl font-bold tracking-widest gold-text">{s.code || "—"}</div>
                  ) : (
                    <div className="text-3xl font-bold tabular-nums gold-text">
                      {s.prefix}<AnimatedCount value={s.value as number} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Referral link card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="surface-card border-[rgba(22,219,147,0.1)] mb-6">
            <CardContent className="p-6">
              <div className="text-sm font-semibold mb-3">Your referral link</div>
              <div className="flex gap-2 items-center">
                <code className="flex-1 bg-black/40 border border-[rgba(22,219,147,0.1)] rounded-lg p-3 text-xs break-all font-mono text-muted-foreground">
                  {link}
                </code>
                <Button
                  variant="outline"
                  onClick={copy}
                  className={`shrink-0 transition-colors duration-200 ${copied ? "border-[#16DB93] text-[#16DB93]" : "hover:border-[rgba(22,219,147,0.4)] hover:text-[#16DB93]"}`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                {[
                  { step: "01", text: "Share your unique link" },
                  { step: "02", text: "Friend deposits & invests" },
                  { step: "03", text: "You earn 5% instantly" },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-center gap-3 bg-white/[0.02] rounded-lg px-4 py-3 border border-[rgba(22,219,147,0.06)]">
                    <span className="text-xs font-bold text-[#16DB93]">{step}</span>
                    <span className="text-xs text-muted-foreground">{text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Referral activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card className="surface-card border-[rgba(22,219,147,0.08)]">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-5">Referral activity</h2>
              {refs.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <div className="text-sm text-muted-foreground">No referrals yet — share your link to start earning.</div>
                </div>
              ) : (
                <div className="text-sm divide-y divide-[rgba(22,219,147,0.05)]">
                  {refs.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="py-3 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">Referred user</div>
                        <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                      </div>
                      <div>
                        {r.bonus_paid ? (
                          <span className="text-[#16DB93] font-semibold">+${r.bonus_amount.toLocaleString()}</span>
                        ) : (
                          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full">Pending deposit</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </SiteLayout>
  );
}
