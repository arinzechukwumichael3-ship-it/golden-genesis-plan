import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/wallets")({ component: AdminWallets });

type CW = {
  id: string;
  coin_name: string;
  symbol: string;
  network: string;
  wallet_address: string;
  is_active: boolean;
  sort_order: number;
};

function AdminWallets() {
  const [rows, setRows] = useState<CW[]>([]);
  const load = () =>
    supabase.from("crypto_wallets").select("*").order("sort_order").then(({ data }) => setRows((data as CW[]) ?? []));
  useEffect(() => { load(); }, []);

  const save = async (w: CW) => {
    const { error } = await supabase.from("crypto_wallets").update({
      wallet_address: w.wallet_address,
      is_active: w.is_active,
    }).eq("id", w.id);
    if (error) return toast.error(error.message);
    toast.success(`${w.symbol} ${w.network} updated`);
  };

  return (
    <div className="space-y-3 max-w-3xl">
      <div className="text-xs text-muted-foreground">Configure receiving wallet addresses per coin/network. Users see only active rows.</div>
      {rows.map((w, idx) => {
        const upd = (patch: Partial<CW>) => { const v = [...rows]; v[idx] = { ...w, ...patch }; setRows(v); };
        return (
          <Card key={w.id} className="surface-card border-white/5"><CardContent className="p-4 grid grid-cols-1 sm:grid-cols-[120px_1fr_auto] gap-3 items-end">
            <div className="min-w-0">
              <div className="text-[10px] uppercase text-muted-foreground">Coin / Network</div>
              <div className="font-bold text-sm truncate">{w.coin_name}</div>
              <div className="text-xs text-muted-foreground">{w.symbol} · {w.network}</div>
            </div>
            <div className="min-w-0">
              <label className="text-[10px] uppercase text-muted-foreground">Wallet address</label>
              <Input value={w.wallet_address} onChange={(e) => upd({ wallet_address: e.target.value })} placeholder="Paste deposit address…" className="font-mono text-xs" />
            </div>
            <div className="flex gap-2 items-center">
              <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={w.is_active} onChange={(e) => upd({ is_active: e.target.checked })} />Active</label>
              <Button onClick={() => save(w)} className="gold-gradient text-white">Save</Button>
            </div>
          </CardContent></Card>
        );
      })}
    </div>
  );
}
