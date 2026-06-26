import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, FileCheck2, ArrowRight, Hash } from "lucide-react";

const TEAL = "#0D9488";

export const Route = createFileRoute("/_authenticated/invest/deposit/$id/proof")({
  component: ProofStep,
});

function ProofStep() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [txHash, setTxHash] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!file && !txHash.trim()) return toast.error("Upload a screenshot or enter the transaction hash");
    setSubmitting(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setSubmitting(false); return toast.error("Not signed in"); }

    let proof_url: string | null = null;
    if (file) {
      const path = `${u.user.id}/${id}-${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, file);
      if (upErr) { setSubmitting(false); return toast.error(upErr.message); }
      proof_url = path;
    }

    const { error } = await supabase
      .from("investments")
      .update({ proof_url, tx_hash: txHash.trim() || null })
      .eq("id", id);

    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Submitted for review");
    navigate({ to: "/invest/deposit/$id/confirm", params: { id } });
  };

  return (
    <SiteLayout>
      <div className="min-h-screen bg-[#F4F6F8]">
        <section className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10 space-y-5">
          <header className="space-y-1">
            <div className="text-[10px] font-semibold tracking-[0.22em] uppercase" style={{ color: TEAL }}>Step 3 of 3 — Proof</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Upload Payment Proof</h1>
            <p className="text-sm text-slate-500">Send a screenshot or your transaction hash so we can verify your payment.</p>
          </header>

          <Card className="bg-white border-slate-200/70 shadow-sm rounded-2xl">
            <CardContent className="p-5 space-y-3">
              <Label className="text-[10px] uppercase tracking-widest text-slate-400">Transaction Screenshot</Label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition hover:bg-slate-50"
                style={{ borderColor: file ? TEAL : "rgb(203 213 225)" }}>
                {file ? (
                  <div className="flex items-center gap-2" style={{ color: TEAL }}>
                    <FileCheck2 className="h-5 w-5" />
                    <span className="text-sm font-semibold">{file.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-7 w-7 text-slate-400 mb-2" />
                    <div className="text-sm font-semibold text-slate-700">Tap to upload</div>
                    <div className="text-xs text-slate-500 mt-0.5">PNG, JPG up to 10MB</div>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
            </CardContent>
          </Card>

          <div className="text-center text-xs uppercase tracking-widest text-slate-400">— or —</div>

          <Card className="bg-white border-slate-200/70 shadow-sm rounded-2xl">
            <CardContent className="p-5 space-y-3">
              <Label className="text-[10px] uppercase tracking-widest text-slate-400">Transaction Hash / ID</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x… or transaction ID"
                  className="pl-9 h-12 font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button asChild variant="outline" className="h-12 rounded-full border-slate-300 text-slate-700">
              <Link to="/invest/deposit/$id" params={{ id }}>Back</Link>
            </Button>
            <Button
              onClick={submit}
              disabled={submitting || (!file && !txHash.trim())}
              className="h-12 rounded-full text-white font-bold shadow-md disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${TEAL} 0%, #0FB5A1 100%)` }}
            >
              {submitting ? "Submitting…" : (<>Submit for Review <ArrowRight className="ml-2 h-4 w-4" /></>)}
            </Button>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
