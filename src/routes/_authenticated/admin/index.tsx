import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, ArrowDownToLine, ArrowUpFromLine, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminIndex,
});

function AnimatedCount({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, { duration: 1.5, ease: "easeOut", onUpdate: (v) => setDisplay(Math.floor(v)) });
    return controls.stop;
  }, [isInView, value]);
  return <span ref={ref}>{display.toLocaleString()}</span>;
}

function AdminIndex() {
  const [stats, setStats] = useState({ users: 0, deposits: 0, withdrawals: 0, invested: 0 });

  useEffect(() => {
    (async () => {
      const [u, d, w, i] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("deposits").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("withdrawals").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("investments").select("amount").eq("status", "active"),
      ]);
      const invested = (i.data || []).reduce((s: number, r: { amount: number }) => s + Number(r.amount), 0);
      setStats({ users: u.count || 0, deposits: d.count || 0, withdrawals: w.count || 0, invested });
    })();
  }, []);

  const cards = [
    { label: "Total users",        value: stats.users,       prefix: "",  icon: Users,           accent: true },
    { label: "Pending deposits",   value: stats.deposits,    prefix: "",  icon: ArrowDownToLine,  accent: false },
    { label: "Pending withdrawals",value: stats.withdrawals, prefix: "",  icon: ArrowUpFromLine, accent: false },
    { label: "Active invested",    value: stats.invested,    prefix: "$", icon: TrendingUp,      accent: false },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {cards.map((s) => (
        <Card key={s.label} className={`surface-card border-[rgba(22,219,147,0.08)] ${s.accent ? "animate-glow-pulse" : "hover:border-[rgba(22,219,147,0.2)]"} transition-colors duration-300`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
              <div className="h-8 w-8 rounded-lg bg-[rgba(22,219,147,0.1)] grid place-items-center">
                <s.icon className="h-4 w-4 text-[#16DB93]" />
              </div>
            </div>
            <div className="text-3xl font-bold tabular-nums gold-text">
              {s.prefix}<AnimatedCount value={s.value} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
