import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/plans")({ component: AdminPlans });

type P = { id: string; name: string; slug: string; min_amount: number; roi_percent: number; active: boolean };

function AdminPlans() {
  const [rows, setRows] = useState<P[]>([]);
  const load = () => supabase.from("plans").select("*").order("sort_order").then(({ data }) => setRows((data as P[]) || []));
  useEffect(() => { load(); }, []);

  const save = async (p: P) => {
    const { error } = await supabase.from("plans").update({ min_amount: p.min_amount, roi_percent: p.roi_percent, active: p.active }).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {rows.map((p, idx) => (
        <Card key={p.id} className="surface-card border-white/5"><CardContent className="p-6 space-y-3">
          <h3 className="text-xl font-bold">{p.name}</h3>
          <div><label className="text-xs">Min amount</label>
            <Input type="number" value={p.min_amount} onChange={(e) => { const v = [...rows]; v[idx] = { ...p, min_amount: +e.target.value }; setRows(v); }} />
          </div>
          <div><label className="text-xs">ROI % monthly</label>
            <Input type="number" step="0.01" value={p.roi_percent} onChange={(e) => { const v = [...rows]; v[idx] = { ...p, roi_percent: +e.target.value }; setRows(v); }} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={p.active} onChange={(e) => { const v = [...rows]; v[idx] = { ...p, active: e.target.checked }; setRows(v); }} />
            Active
          </label>
          <Button onClick={() => save(p)} className="gold-gradient text-black w-full">Save</Button>
        </CardContent></Card>
      ))}
    </div>
  );
}
