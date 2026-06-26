import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/plans")({ component: AdminPlans });

type P = {
  id: string; name: string; slug: string;
  min_amount: number; max_amount: number | null;
  roi_percent: number; duration_days: number; active: boolean;
};

function AdminPlans() {
  const [rows, setRows] = useState<P[]>([]);
  const load = () => supabase.from("plans").select("*").order("sort_order").then(({ data }) => setRows((data as P[]) || []));
  useEffect(() => { load(); }, []);

  const save = async (p: P) => {
    const { error } = await supabase.from("plans").update({
      min_amount: p.min_amount,
      max_amount: p.max_amount,
      roi_percent: p.roi_percent,
      duration_days: p.duration_days,
      active: p.active,
    }).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {rows.map((p, idx) => {
        const upd = (patch: Partial<P>) => { const v = [...rows]; v[idx] = { ...p, ...patch }; setRows(v); };
        return (
          <Card key={p.id} className="surface-card border-white/5"><CardContent className="p-5 space-y-3">
            <h3 className="text-lg font-bold">{p.name}</h3>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[10px] uppercase text-muted-foreground">Min ($)</label>
                <Input type="number" value={p.min_amount} onChange={(e) => upd({ min_amount: +e.target.value })} />
              </div>
              <div><label className="text-[10px] uppercase text-muted-foreground">Max ($)</label>
                <Input type="number" value={p.max_amount ?? ""} onChange={(e) => upd({ max_amount: e.target.value === "" ? null : +e.target.value })} />
              </div>
              <div><label className="text-[10px] uppercase text-muted-foreground">ROI %</label>
                <Input type="number" step="0.01" value={p.roi_percent} onChange={(e) => upd({ roi_percent: +e.target.value })} />
              </div>
              <div><label className="text-[10px] uppercase text-muted-foreground">Duration (days)</label>
                <Input type="number" value={p.duration_days} onChange={(e) => upd({ duration_days: +e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={p.active} onChange={(e) => upd({ active: e.target.checked })} />
              Active
            </label>
            <Button onClick={() => save(p)} className="gold-gradient text-white w-full">Save</Button>
          </CardContent></Card>
        );
      })}
    </div>
  );
}
