import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Gift, Copy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/referrals")({
  component: Referrals,
});

type Ref = { id: string; referred_id: string; bonus_paid: boolean; bonus_amount: number; created_at: string };

function Referrals() {
  const [code, setCode] = useState("");
  const [refs, setRefs] = useState<Ref[]>([]);
  const [earned, setEarned] = useState(0);

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

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Refer & earn</h1>
        <p className="text-sm text-muted-foreground mb-8">Earn 5% bonus on every referred user's first approved deposit.</p>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="surface-card border-white/5"><CardContent className="p-6">
            <Users className="h-5 w-5 text-[var(--gold)] mb-2" />
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Total referrals</div>
            <div className="text-3xl font-bold">{refs.length}</div>
          </CardContent></Card>
          <Card className="surface-card border-white/5"><CardContent className="p-6">
            <Gift className="h-5 w-5 text-[var(--gold)] mb-2" />
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Bonus earned</div>
            <div className="text-3xl font-bold gold-text">${earned.toLocaleString()}</div>
          </CardContent></Card>
          <Card className="surface-card border-white/5"><CardContent className="p-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Your code</div>
            <div className="text-3xl font-bold tracking-widest">{code}</div>
          </CardContent></Card>
        </div>

        <Card className="surface-card border-white/5 mb-8"><CardContent className="p-6">
          <div className="text-sm font-medium mb-2">Your referral link</div>
          <div className="flex gap-2">
            <code className="flex-1 bg-input/50 border border-white/10 rounded-md p-3 text-xs break-all">{link}</code>
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(link); toast.success("Copied"); }}><Copy className="h-4 w-4" /></Button>
          </div>
        </CardContent></Card>

        <Card className="surface-card border-white/5"><CardContent className="p-6">
          <h2 className="text-lg font-bold mb-4">Referral activity</h2>
          {refs.length === 0 ? <div className="text-sm text-muted-foreground">No referrals yet — share your link to start earning.</div> : (
            <div className="text-sm divide-y divide-white/5">
              {refs.map((r) => (
                <div key={r.id} className="py-3 flex justify-between">
                  <div className="text-xs text-muted-foreground">Referred user · {new Date(r.created_at).toLocaleDateString()}</div>
                  <div className={r.bonus_paid ? "text-emerald-400 font-semibold" : "text-muted-foreground"}>{r.bonus_paid ? `+$${r.bonus_amount}` : "Pending first deposit"}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      </section>
    </SiteLayout>
  );
}
