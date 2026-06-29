import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings, MessageCircle, Wallet, Briefcase, Shield, Save, Plus, Trash2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: AdminSettings });

type Setting = { key: string; value: string; description: string | null };
type WalletRow = { id: string; coin_name: string; symbol: string; network: string; wallet_address: string; is_active: boolean };
type PlanRow = {
  id: string; name: string; slug: string; min_amount: number; max_amount: number | null;
  roi_percent: number; duration_days: number; active: boolean; sort_order: number;
};

type TabKey = "site" | "wallets" | "plans" | "admin";

function TabBtn({ active, icon: Icon, label, onClick }: { active: boolean; icon: any; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
        active
          ? "gold-gradient text-white border-transparent"
          : "border-white/10 text-white/60 hover:border-[#16DB93]/50 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function SettingRow({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-white/5 border-white/10" />
    </div>
  );
}

function SiteSettingsTab({ settings, onSave }: { settings: Setting[]; onSave: (s: Setting[]) => void }) {
  const whatsappNumber = settings.find(s => s.key === "whatsapp_number")?.value || "";
  const whatsappMessage = settings.find(s => s.key === "whatsapp_message")?.value || "";

  const setSetting = (key: string, value: string) => {
    const updated = [...settings];
    const idx = updated.findIndex(s => s.key === key);
    if (idx >= 0) updated[idx] = { ...updated[idx], value };
    else updated.push({ key, value, description: null });
    onSave(updated);
  };

  const handleSave = async () => {
    const { error } = await supabase.from("site_settings").upsert([
      { key: "whatsapp_number", value: whatsappNumber },
      { key: "whatsapp_message", value: whatsappMessage },
    ]);
    if (error) toast.error(error.message);
    else toast.success("Site settings saved");
  };

  return (
    <Card className="surface-card border-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg"><MessageCircle className="h-5 w-5 text-[#16DB93]" /> Site Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingRow label="WhatsApp Support Number" value={whatsappNumber} onChange={(v) => setSetting("whatsapp_number", v)} placeholder="e.g., 9122646692" />
        <SettingRow label="WhatsApp Default Message" value={whatsappMessage} onChange={(v) => setSetting("whatsapp_message", v)} placeholder="Default message sent when user clicks support" />
        <Button onClick={handleSave} className="gold-gradient text-white"><Save className="h-4 w-4 mr-2" />Save Site Settings</Button>
      </CardContent>
    </Card>
  );
}

function WalletsTab({ wallets, onUpdate }: { wallets: WalletRow[]; onUpdate: () => void }) {
  const [rows, setRows] = useState<WalletRow[]>(wallets);

  useEffect(() => { setRow(wallets); }, [wallets]);

  const setRow = (r: WalletRow[]) => setRows(r);

  const save = async (w: WalletRow) => {
    const { error } = await supabase.from("crypto_wallets").update({
      wallet_address: w.wallet_address,
      is_active: w.is_active,
    }).eq("id", w.id);
    if (error) toast.error(error.message);
    else { toast.success(`${w.symbol} saved`); onUpdate(); }
  };

  const addWallet = async () => {
    const { error } = await supabase.from("crypto_wallets").insert({
      coin_name: "New Coin", symbol: "NEW", network: "Network", wallet_address: "", is_active: false, sort_order: 99,
    });
    if (error) toast.error(error.message);
    else { toast.success("Wallet added"); onUpdate(); }
  };

  const deleteWallet = async (id: string) => {
    const { error } = await supabase.from("crypto_wallets").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Wallet deleted"); onUpdate(); }
  };

  return (
    <Card className="surface-card border-white/5">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg"><Wallet className="h-5 w-5 text-[#16DB93]" /> Crypto Wallets</CardTitle>
        <Button onClick={addWallet} size="sm" className="gold-gradient text-white"><Plus className="h-4 w-4 mr-1" />Add</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((w, idx) => {
          const upd = (patch: Partial<WalletRow>) => { const v = [...rows]; v[idx] = { ...w, ...patch }; setRow(v); };
          return (
            <motion.div key={w.id} layout className="grid grid-cols-1 sm:grid-cols-[100px_80px_100px_1fr_auto] gap-2 items-end p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground">Coin</Label>
                <Input value={w.coin_name} onChange={(e) => upd({ coin_name: e.target.value })} className="bg-transparent border-white/10 h-9" />
              </div>
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground">Symbol</Label>
                <Input value={w.symbol} onChange={(e) => upd({ symbol: e.target.value })} className="bg-transparent border-white/10 h-9 font-mono" />
              </div>
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground">Network</Label>
                <Input value={w.network} onChange={(e) => upd({ network: e.target.value })} className="bg-transparent border-white/10 h-9" />
              </div>
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground">Address</Label>
                <Input value={w.wallet_address} onChange={(e) => upd({ wallet_address: e.target.value })} className="bg-transparent border-white/10 h-9 font-mono text-xs" />
              </div>
              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-1 text-xs text-muted-foreground"><input type="checkbox" checked={w.is_active} onChange={(e) => upd({ is_active: e.target.checked })} />Active</label>
                <Button onClick={() => save(w)} size="sm" className="gold-gradient text-white h-8">Save</Button>
                <Button onClick={() => deleteWallet(w.id)} size="sm" variant="destructive" className="h-8"><Trash2 className="h-3 w-3" /></Button>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function PlansTab({ plans, onUpdate }: { plans: PlanRow[]; onUpdate: () => void }) {
  const [rows, setRows] = useState<PlanRow[]>(plans);
  const [showAdd, setShowAdd] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: "", slug: "", min_amount: 0, max_amount: null as number | null, roi_percent: 0, duration_days: 30 });

  useEffect(() => { setRows(plans); }, [plans]);

  const save = async (p: PlanRow) => {
    const { error } = await supabase.from("plans").update({
      name: p.name,
      min_amount: p.min_amount,
      max_amount: p.max_amount,
      roi_percent: p.roi_percent,
      duration_days: p.duration_days,
      active: p.active,
    }).eq("id", p.id);
    if (error) toast.error(error.message);
    else { toast.success("Plan saved"); onUpdate(); }
  };

  const addPlan = async () => {
    if (!newPlan.name || !newPlan.slug) return toast.error("Name and slug required");
    const { error } = await supabase.from("plans").insert({
      name: newPlan.name,
      slug: newPlan.slug.toLowerCase().replace(/\s+/g, "-"),
      min_amount: newPlan.min_amount,
      max_amount: newPlan.max_amount,
      roi_percent: newPlan.roi_percent,
      duration_days: newPlan.duration_days,
      active: false,
      sort_order: 99,
    });
    if (error) toast.error(error.message);
    else { toast.success("Plan added"); setShowAdd(false); setNewPlan({ name: "", slug: "", min_amount: 0, max_amount: null, roi_percent: 0, duration_days: 30 }); onUpdate(); }
  };

  const deletePlan = async (id: string) => {
    const { error } = await supabase.from("plans").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Plan deleted"); onUpdate(); }
  };

  return (
    <Card className="surface-card border-white/5">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg"><Briefcase className="h-5 w-5 text-[#16DB93]" /> Investment Plans</CardTitle>
        <Button onClick={() => setShowAdd(!showAdd)} size="sm" className="gold-gradient text-white"><Plus className="h-4 w-4 mr-1" />Add</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-[#16DB93]/10 border border-[#16DB93]/30 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div><Label className="text-[10px] uppercase text-muted-foreground">Name</Label><Input value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} /></div>
              <div><Label className="text-[10px] uppercase text-muted-foreground">Slug</Label><Input value={newPlan.slug} onChange={(e) => setNewPlan({ ...newPlan, slug: e.target.value })} /></div>
              <div><Label className="text-[10px] uppercase text-muted-foreground">Min ($)</Label><Input type="number" value={newPlan.min_amount} onChange={(e) => setNewPlan({ ...newPlan, min_amount: +e.target.value })} /></div>
              <div><Label className="text-[10px] uppercase text-muted-foreground">Max ($)</Label><Input type="number" value={newPlan.max_amount ?? ""} onChange={(e) => setNewPlan({ ...newPlan, max_amount: e.target.value ? +e.target.value : null })} /></div>
              <div><Label className="text-[10px] uppercase text-muted-foreground">ROI %</Label><Input type="number" value={newPlan.roi_percent} onChange={(e) => setNewPlan({ ...newPlan, roi_percent: +e.target.value })} /></div>
              <div><Label className="text-[10px] uppercase text-muted-foreground">Days</Label><Input type="number" value={newPlan.duration_days} onChange={(e) => setNewPlan({ ...newPlan, duration_days: +e.target.value })} /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addPlan} className="gold-gradient text-white">Create</Button>
              <Button onClick={() => setShowAdd(false)} variant="outline" className="border-white/20">Cancel</Button>
            </div>
          </motion.div>
        )}
        {rows.map((p, idx) => {
          const upd = (patch: Partial<PlanRow>) => { const v = [...rows]; v[idx] = { ...p, ...patch }; setRows(v); };
          return (
            <motion.div key={p.id} layout className="grid grid-cols-1 sm:grid-cols-[120px_1fr_auto] gap-2 items-end p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex flex-col gap-1">
                <div className="font-semibold">{p.name}</div>
                <Input value={p.name} onChange={(e) => upd({ name: e.target.value })} className="bg-transparent border-white/10 h-9 text-xs" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground">Min</Label>
                  <Input type="number" value={p.min_amount} onChange={(e) => upd({ min_amount: +e.target.value })} className="bg-transparent border-white/10 h-9" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground">Max</Label>
                  <Input type="number" value={p.max_amount ?? ""} onChange={(e) => upd({ max_amount: e.target.value ? +e.target.value : null })} className="bg-transparent border-white/10 h-9" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground">ROI%</Label>
                  <Input type="number" value={p.roi_percent} onChange={(e) => upd({ roi_percent: +e.target.value })} className="bg-transparent border-white/10 h-9" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground">Days</Label>
                  <Input type="number" value={p.duration_days} onChange={(e) => upd({ duration_days: +e.target.value })} className="bg-transparent border-white/10 h-9" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-1 text-xs text-muted-foreground"><input type="checkbox" checked={p.active} onChange={(e) => upd({ active: e.target.checked })} />Active</label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => save(p)} size="sm" className="gold-gradient text-white h-9"><Save className="h-3 w-3" /></Button>
                <Button onClick={() => deletePlan(p.id)} size="sm" variant="destructive" className="h-9"><Trash2 className="h-3 w-3" /></Button>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function AdminAccountTab() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setEmail(data.user.email || "");
    });
  }, []);

  const updateEmail = async () => {
    if (!email) return toast.error("Email required");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ email });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Email update initiated. Check your inbox to confirm.");
  };

  const updatePassword = async () => {
    if (!newPassword || newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
  };

  const createAdmin = async () => {
    if (!email || !newPassword) return toast.error("Email and password required");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password: newPassword });
    if (error) { setLoading(false); return toast.error(error.message); }
    if (data.user) {
      const { error: roleError } = await supabase.from("user_roles").insert({ user_id: data.user.id, role: "admin" });
      if (roleError) toast.error(roleError.message);
      else toast.success("Admin created successfully");
    }
    setLoading(false);
  };

  return (
    <Card className="surface-card border-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5 text-[#16DB93]" /> Admin Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
          Changing admin credentials affects who can access this admin panel. Make sure you remember new credentials.
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-white/80">Update Email</h3>
          <div className="flex gap-2">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" className="bg-white/5 border-white/10 flex-1" />
            <Button onClick={updateEmail} disabled={loading} className="gold-gradient text-white">Update</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-white/80">Change Password</h3>
          <div className="space-y-2">
            <div className="relative">
              <Label className="text-[10px] uppercase text-muted-foreground">New Password</Label>
              <div className="relative">
                <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-white/5 border-white/10 pr-10" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-[10px] uppercase text-muted-foreground">Confirm Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-white/5 border-white/10" />
            </div>
            <Button onClick={updatePassword} disabled={loading} className="gold-gradient text-white">Update Password</Button>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h3 className="font-semibold text-sm text-white/80 mb-4">Create New Admin Account</h3>
          <p className="text-xs text-muted-foreground mb-3">Create a brand new admin account. The new user will receive a confirmation email.</p>
          <div className="flex gap-2">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="new-admin@example.com" className="bg-white/5 border-white/10 flex-1" />
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password" className="bg-white/5 border-white/10 w-40" />
            <Button onClick={createAdmin} disabled={loading} className="gold-gradient text-white">Create</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminSettings() {
  const [tab, setTab] = useState<TabKey>("site");
  const [settings, setSettings] = useState<Setting[]>([]);
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [plans, setPlans] = useState<PlanRow[]>([]);

  const loadData = async () => {
    const { data: s } = await supabase.from("site_settings").select("*");
    setSettings((s as Setting[]) || []);
    const { data: w } = await supabase.from("crypto_wallets").select("*").order("sort_order");
    setWallets((w as WalletRow[]) || []);
    const { data: p } = await supabase.from("plans").select("*").order("sort_order");
    setPlans((p as PlanRow[]) || []);
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <TabBtn active={tab === "site"} icon={MessageCircle} label="Site Settings" onClick={() => setTab("site")} />
        <TabBtn active={tab === "wallets"} icon={Wallet} label="Wallets" onClick={() => setTab("wallets")} />
        <TabBtn active={tab === "plans"} icon={Briefcase} label="Plans" onClick={() => setTab("plans")} />
        <TabBtn active={tab === "admin"} icon={Shield} label="Admin Account" onClick={() => setTab("admin")} />
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {tab === "site" && <SiteSettingsTab settings={settings} onSave={setSettings} />}
        {tab === "wallets" && <WalletsTab wallets={wallets} onUpdate={loadData} />}
        {tab === "plans" && <PlansTab plans={plans} onUpdate={loadData} />}
        {tab === "admin" && <AdminAccountTab />}
      </motion.div>
    </div>
  );
}
