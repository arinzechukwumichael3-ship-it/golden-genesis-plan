import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/referrals")({ component: AdminRefs });

type R = { id: string; referrer_id: string; referred_id: string; bonus_paid: boolean; bonus_amount: number; created_at: string };

function AdminRefs() {
  const [rows, setRows] = useState<R[]>([]);
  useEffect(() => {
    supabase.from("referrals").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows((data as R[]) || []));
  }, []);
  return (
    <Card className="surface-card border-white/5"><CardContent className="p-6 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Referral activity</h2>
      <table className="w-full text-sm">
        <thead className="text-xs uppercase text-muted-foreground border-b border-white/5">
          <tr><th className="text-left py-2">Referrer</th><th>Referred</th><th>Paid</th><th>Bonus</th><th>Date</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-white/5">
              <td className="py-2 font-mono text-xs">{r.referrer_id.slice(0,8)}</td>
              <td className="font-mono text-xs">{r.referred_id.slice(0,8)}</td>
              <td>{r.bonus_paid ? "✓" : "—"}</td>
              <td className="tabular-nums">${Number(r.bonus_amount).toLocaleString()}</td>
              <td className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CardContent></Card>
  );
}
