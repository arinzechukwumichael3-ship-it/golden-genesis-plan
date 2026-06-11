import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/users")({ component: Users });

type U = { id: string; email: string; full_name: string | null; balance: number; total_earned: number; referral_code: string; created_at: string };

function Users() {
  const [rows, setRows] = useState<U[]>([]);
  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows((data as U[]) || []));
  }, []);
  return (
    <Card className="surface-card border-white/5"><CardContent className="p-6 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">All users</h2>
      <table className="w-full text-sm">
        <thead className="text-xs uppercase text-muted-foreground border-b border-white/5">
          <tr><th className="text-left py-2">Email</th><th>Name</th><th>Ref code</th><th>Balance</th><th>Earned</th><th>Joined</th></tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="border-b border-white/5">
              <td className="py-2">{u.email}</td>
              <td>{u.full_name || "—"}</td>
              <td className="font-mono text-xs">{u.referral_code}</td>
              <td className="tabular-nums">${Number(u.balance).toLocaleString()}</td>
              <td className="tabular-nums">${Number(u.total_earned).toLocaleString()}</td>
              <td className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CardContent></Card>
  );
}
