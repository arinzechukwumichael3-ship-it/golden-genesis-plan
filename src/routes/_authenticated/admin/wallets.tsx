import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/wallets")({ component: AdminWallets });

type W = { coin: "BTC"|"ETH"|"USDT"|"BNB"; address: string };

function AdminWallets() {
  const [rows, setRows] = useState<W[]>([]);
  useEffect(() => { supabase.from("wallets").select("coin,address").then(({ data }) => setRows((data as W[]) || [])); }, []);
  const save = async (w: W) => {
    const { error } = await supabase.from("wallets").update({ address: w.address, updated_at: new Date().toISOString() }).eq("coin", w.coin);
    if (error) return toast.error(error.message);
    toast.success(`${w.coin} address updated`);
  };
  return (
    <div className="space-y-3 max-w-2xl">
      {rows.map((w, idx) => (
        <Card key={w.coin} className="surface-card border-white/5"><CardContent className="p-4 flex gap-3 items-end">
          <div className="w-16 font-bold text-[var(--gold)]">{w.coin}</div>
          <div className="flex-1"><Input value={w.address} onChange={(e) => { const v = [...rows]; v[idx] = { ...w, address: e.target.value }; setRows(v); }} /></div>
          <Button onClick={() => save(w)} className="gold-gradient text-white">Save</Button>
        </CardContent></Card>
      ))}
    </div>
  );
}
