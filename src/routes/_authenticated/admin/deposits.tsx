import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/deposits")({ component: AdminDeposits });

type D = { id: string; user_id: string; coin: string; amount: number; status: string; created_at: string; proof_url: string | null };

function AdminDeposits() {
  const [rows, setRows] = useState<D[]>([]);
  const load = () => supabase.from("deposits").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows((data as D[]) || []));
  useEffect(() => { load(); }, []);

  const action = async (id: string, kind: "approve" | "reject") => {
    const fn = kind === "approve" ? "approve_deposit" : "reject_deposit";
    const { error } = await supabase.rpc(fn, { _deposit_id: id });
    if (error) return toast.error(error.message);
    toast.success(`Deposit ${kind}d`);
    load();
  };

  const viewProof = async (path: string) => {
    const { data, error } = await supabase.storage.from("payment-proofs").createSignedUrl(path, 300);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  };

  return (
    <Card className="surface-card border-white/5"><CardContent className="p-6 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Deposits</h2>
      <table className="w-full text-sm">
        <thead className="text-xs uppercase text-muted-foreground border-b border-white/5">
          <tr><th className="text-left py-2">User</th><th>Coin</th><th>Amount</th><th>Status</th><th>Proof</th><th>Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.id} className="border-b border-white/5">
              <td className="py-2 font-mono text-xs">{d.user_id.slice(0,8)}</td>
              <td>{d.coin}</td>
              <td className="tabular-nums">${Number(d.amount).toLocaleString()}</td>
              <td>{d.status}</td>
              <td>{d.proof_url ? <button onClick={() => viewProof(d.proof_url!)} className="text-[var(--gold)] underline">View</button> : "—"}</td>
              <td className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString()}</td>
              <td>
                {d.status === "pending" && (
                  <div className="flex gap-1">
                    <Button size="sm" className="gold-gradient text-white h-7" onClick={() => action(d.id, "approve")}>Approve</Button>
                    <Button size="sm" variant="outline" className="h-7" onClick={() => action(d.id, "reject")}>Reject</Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </CardContent></Card>
  );
}
