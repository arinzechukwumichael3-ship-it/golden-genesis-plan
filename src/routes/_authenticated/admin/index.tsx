import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminIndex,
});

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
      const invested = (i.data || []).reduce((s: number, r: any) => s + Number(r.amount), 0);
      setStats({ users: u.count || 0, deposits: d.count || 0, withdrawals: w.count || 0, invested });
    })();
  }, []);
  return (
    <div className="grid md:grid-cols-4 gap-4">
      {[
        { l: "Total users", v: stats.users },
        { l: "Pending deposits", v: stats.deposits },
        { l: "Pending withdrawals", v: stats.withdrawals },
        { l: "Active invested", v: `$${stats.invested.toLocaleString()}` },
      ].map((s) => (
        <Card key={s.l} className="surface-card border-white/5"><CardContent className="p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
          <div className="text-3xl font-bold mt-1">{s.v}</div>
        </CardContent></Card>
      ))}
    </div>
  );
}
