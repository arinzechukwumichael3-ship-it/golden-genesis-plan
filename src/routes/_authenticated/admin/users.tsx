import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LogIn, Edit2, Check, X, Eye, DollarSign, Search,
  Users as UsersIcon, PlusCircle, MinusCircle, Bell, KeyRound,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({ component: Users });

type U = {
  id: string; email: string; full_name: string | null;
  balance: number; total_earned: number; referral_code: string; created_at: string;
};

type ActionMode = "edit" | "credit" | "debit" | "notify" | null;

function Users() {
  const [rows, setRows] = useState<U[]>([]);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [editBalance, setEditBalance] = useState("");
  const [editName, setEditName] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () =>
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as U[]) || []));

  useEffect(() => { load(); }, []);

  const filtered = rows.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.referral_code?.toLowerCase().includes(search.toLowerCase())
  );

  const startAction = (u: U, mode: ActionMode) => {
    setActiveId(u.id);
    setActionMode(mode);
    if (mode === "edit") { setEditBalance(String(u.balance)); setEditName(u.full_name || ""); }
    if (mode === "credit" || mode === "debit") setFundAmount("");
    if (mode === "notify") { setNotifTitle(""); setNotifBody(""); }
  };

  const cancel = () => { setActiveId(null); setActionMode(null); };

  const saveEdit = async (u: U) => {
    const newBal = parseFloat(editBalance);
    if (isNaN(newBal) || newBal < 0) return toast.error("Invalid balance");
    setLoading(true);
    const { error } = await supabase.from("profiles")
      .update({ balance: newBal, full_name: editName || u.full_name })
      .eq("id", u.id);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("User updated");
    cancel(); load();
  };

  const applyFund = async (u: U, mode: "credit" | "debit") => {
    const amt = parseFloat(fundAmount);
    if (isNaN(amt) || amt <= 0) return toast.error("Enter a valid amount");
    if (mode === "debit" && amt > u.balance) return toast.error("Amount exceeds user balance");
    setLoading(true);
    const newBal = mode === "credit" ? u.balance + amt : u.balance - amt;
    const { error } = await supabase.from("profiles")
      .update({ balance: newBal })
      .eq("id", u.id);
    if (!error) {
      await supabase.from("notifications").insert({
        user_id: u.id,
        title: mode === "credit" ? "Balance credited" : "Balance debited",
        body: mode === "credit"
          ? `$${amt.toLocaleString()} has been added to your account.`
          : `$${amt.toLocaleString()} has been deducted from your account.`,
      });
    }
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(mode === "credit" ? `Credited $${amt.toLocaleString()}` : `Debited $${amt.toLocaleString()}`);
    cancel(); load();
  };

  const sendNotification = async (u: U) => {
    if (!notifTitle.trim()) return toast.error("Title is required");
    setLoading(true);
    const { error } = await supabase.from("notifications").insert({
      user_id: u.id,
      title: notifTitle.trim(),
      body: notifBody.trim() || null,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Notification sent");
    cancel();
  };

  const sendPasswordReset = async (u: U) => {
    const { error } = await supabase.auth.resetPasswordForEmail(u.email);
    if (error) return toast.error(error.message);
    toast.success(`Password reset email sent to ${u.email}`);
  };

  const impersonateUser = async (u: U) => {
    setImpersonating(u.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-impersonate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ user_id: u.id }),
        }
      );
      const json = await res.json();
      if (!res.ok || json.error) { toast.error(json.error || "Impersonation failed"); return; }
      window.open(json.url, "_blank");
      toast.success(`Opening session as ${u.email}`);
    } catch {
      toast.error("Failed to impersonate user");
    } finally {
      setImpersonating(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Users</h2>
          <p className="text-xs text-muted-foreground">{rows.length} total accounts</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, name…"
            className="pl-8 h-9 text-sm border-[rgba(22,219,147,0.15)] focus:border-[#16DB93]"
          />
        </div>
      </div>

      <Card className="surface-card border-[rgba(22,219,147,0.08)] overflow-hidden">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <UsersIcon className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">No users found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(22,219,147,0.06)] bg-[rgba(22,219,147,0.02)]">
                    <th className="text-left text-xs uppercase text-muted-foreground tracking-wider px-5 py-3">User</th>
                    <th className="text-xs uppercase text-muted-foreground tracking-wider px-3 py-3">Ref code</th>
                    <th className="text-xs uppercase text-muted-foreground tracking-wider px-3 py-3">Balance</th>
                    <th className="text-xs uppercase text-muted-foreground tracking-wider px-3 py-3">Earned</th>
                    <th className="text-xs uppercase text-muted-foreground tracking-wider px-3 py-3">Joined</th>
                    <th className="text-xs uppercase text-muted-foreground tracking-wider px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <>
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-[rgba(22,219,147,0.04)] hover:bg-[rgba(22,219,147,0.02)] transition-colors cursor-pointer"
                        onClick={() => setExpanded(expanded === u.id ? null : u.id)}
                      >
                        {/* User cell */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full gold-gradient grid place-items-center text-[11px] font-bold text-white shrink-0">
                              {(u.full_name || u.email)?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              {activeId === u.id && actionMode === "edit" ? (
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  placeholder="Full name"
                                  className="h-6 w-36 text-xs border-[rgba(22,219,147,0.3)] focus:border-[#16DB93]"
                                />
                              ) : (
                                <div className="font-medium text-sm">{u.full_name || "—"}</div>
                              )}
                              <div className="text-xs text-muted-foreground">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Ref code */}
                        <td className="px-3 py-3 text-center">
                          <code className="text-xs font-mono bg-[rgba(22,219,147,0.06)] px-2 py-0.5 rounded">{u.referral_code}</code>
                        </td>

                        {/* Balance */}
                        <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          {activeId === u.id && actionMode === "edit" ? (
                            <Input
                              value={editBalance}
                              onChange={(e) => setEditBalance(e.target.value)}
                              className="h-7 w-24 text-xs text-center border-[rgba(22,219,147,0.3)] focus:border-[#16DB93]"
                            />
                          ) : activeId === u.id && (actionMode === "credit" || actionMode === "debit") ? (
                            <div className="flex items-center gap-1 justify-center">
                              <span className="text-xs text-muted-foreground">$</span>
                              <Input
                                value={fundAmount}
                                onChange={(e) => setFundAmount(e.target.value)}
                                type="number"
                                min="0"
                                placeholder="0.00"
                                className={`h-7 w-24 text-xs text-center ${actionMode === "credit" ? "border-[rgba(22,219,147,0.3)] focus:border-[#16DB93]" : "border-red-500/30 focus:border-red-400"}`}
                              />
                            </div>
                          ) : (
                            <span className="font-semibold text-[#16DB93]">${Number(u.balance).toLocaleString()}</span>
                          )}
                        </td>

                        <td className="px-3 py-3 text-center text-xs text-muted-foreground">
                          ${Number(u.total_earned).toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-center text-xs text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1 justify-center">
                            {activeId === u.id && actionMode !== null ? (
                              <>
                                <button
                                  disabled={loading}
                                  onClick={() => {
                                    if (actionMode === "edit") saveEdit(u);
                                    else if (actionMode === "credit") applyFund(u, "credit");
                                    else if (actionMode === "debit") applyFund(u, "debit");
                                    else if (actionMode === "notify") sendNotification(u);
                                  }}
                                  className="h-7 w-7 rounded-lg bg-[rgba(22,219,147,0.12)] border border-[rgba(22,219,147,0.25)] grid place-items-center hover:bg-[rgba(22,219,147,0.2)] transition-colors disabled:opacity-40"
                                >
                                  {loading
                                    ? <span className="h-3 w-3 border border-[#16DB93] border-t-transparent rounded-full animate-spin" />
                                    : <Check className="h-3.5 w-3.5 text-[#16DB93]" />
                                  }
                                </button>
                                <button
                                  onClick={cancel}
                                  className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/20 grid place-items-center hover:bg-red-500/15 transition-colors"
                                >
                                  <X className="h-3.5 w-3.5 text-red-400" />
                                </button>
                              </>
                            ) : (
                              <>
                                {/* Edit */}
                                <Btn title="Edit name/balance" onClick={() => startAction(u, "edit")}>
                                  <Edit2 className="h-3 w-3" />
                                </Btn>
                                {/* Credit */}
                                <Btn title="Credit balance" onClick={() => startAction(u, "credit")} green>
                                  <PlusCircle className="h-3 w-3" />
                                </Btn>
                                {/* Debit */}
                                <Btn title="Debit balance" onClick={() => startAction(u, "debit")} red>
                                  <MinusCircle className="h-3 w-3" />
                                </Btn>
                                {/* Notify */}
                                <Btn title="Send notification" onClick={() => startAction(u, "notify")}>
                                  <Bell className="h-3 w-3" />
                                </Btn>
                                {/* Login as */}
                                <Btn
                                  title="Login as user"
                                  onClick={() => impersonateUser(u)}
                                  disabled={impersonating === u.id}
                                >
                                  {impersonating === u.id
                                    ? <span className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin" />
                                    : <LogIn className="h-3 w-3" />
                                  }
                                </Btn>
                                {/* Password reset */}
                                <Btn title="Send password reset email" onClick={() => sendPasswordReset(u)}>
                                  <KeyRound className="h-3 w-3" />
                                </Btn>
                                {/* Details */}
                                <Btn title="View details" onClick={() => setExpanded(expanded === u.id ? null : u.id)}>
                                  <Eye className="h-3 w-3" />
                                </Btn>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>

                      {/* Notify compose row */}
                      <AnimatePresence>
                        {activeId === u.id && actionMode === "notify" && (
                          <tr key={`${u.id}-notify`}>
                            <td colSpan={6} className="px-5 py-3 bg-[rgba(22,219,147,0.02)] border-b border-[rgba(22,219,147,0.04)]">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.18 }}
                                className="flex gap-2"
                              >
                                <Input
                                  value={notifTitle}
                                  onChange={(e) => setNotifTitle(e.target.value)}
                                  placeholder="Notification title"
                                  className="h-8 text-xs border-[rgba(22,219,147,0.2)] focus:border-[#16DB93]"
                                />
                                <Input
                                  value={notifBody}
                                  onChange={(e) => setNotifBody(e.target.value)}
                                  placeholder="Message (optional)"
                                  className="h-8 text-xs border-[rgba(22,219,147,0.2)] focus:border-[#16DB93] flex-1"
                                />
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>

                      {/* Expanded detail row */}
                      <AnimatePresence>
                        {expanded === u.id && (
                          <tr key={`${u.id}-expanded`}>
                            <td colSpan={6} className="px-5 pb-4 bg-[rgba(22,219,147,0.015)]">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <UserDetail userId={u.id} />
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Btn({
  children, title, onClick, disabled, green, red,
}: {
  children: React.ReactNode; title: string;
  onClick: () => void; disabled?: boolean; green?: boolean; red?: boolean;
}) {
  const base = "h-7 w-7 rounded-lg border grid place-items-center transition-colors text-muted-foreground disabled:opacity-40";
  const cls = green
    ? `${base} border-[rgba(22,219,147,0.2)] hover:border-[#16DB93] hover:text-[#16DB93]`
    : red
    ? `${base} border-red-500/20 hover:border-red-400 hover:text-red-400`
    : `${base} border-[rgba(22,219,147,0.12)] hover:border-[rgba(22,219,147,0.35)] hover:text-[#16DB93]`;
  return (
    <button title={title} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

function UserDetail({ userId }: { userId: string }) {
  const [investments, setInvestments] = useState<{ id: string; amount: number; status: string; start_at: string }[]>([]);
  const [deposits, setDeposits] = useState<{ id: string; amount: number; coin: string; status: string }[]>([]);
  const [withdrawals, setWithdrawals] = useState<{ id: string; amount: number; coin: string; status: string }[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("investments").select("id,amount,status,start_at").eq("user_id", userId).order("start_at", { ascending: false }).limit(5),
      supabase.from("deposits").select("id,amount,coin,status").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
      supabase.from("withdrawals").select("id,amount,coin,status").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
    ]).then(([inv, dep, wit]) => {
      setInvestments(inv.data || []);
      setDeposits(dep.data || []);
      setWithdrawals(wit.data || []);
    });
  }, [userId]);

  const statusCls = (s: string) =>
    s === "active" || s === "approved" ? "text-[#16DB93]" : s === "rejected" ? "text-red-400" : "text-amber-400";

  return (
    <div className="grid sm:grid-cols-3 gap-4 pt-3">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <DollarSign className="h-3 w-3" /> Investments
        </div>
        {investments.length === 0
          ? <div className="text-xs text-muted-foreground">None</div>
          : investments.map((inv) => (
            <div key={inv.id} className="flex justify-between text-xs py-1 border-b border-[rgba(22,219,147,0.05)]">
              <span className="text-muted-foreground">{new Date(inv.start_at).toLocaleDateString()}</span>
              <span className="font-semibold">${Number(inv.amount).toLocaleString()}</span>
              <span className={statusCls(inv.status)}>{inv.status}</span>
            </div>
          ))
        }
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <DollarSign className="h-3 w-3" /> Deposits
        </div>
        {deposits.length === 0
          ? <div className="text-xs text-muted-foreground">None</div>
          : deposits.map((dep) => (
            <div key={dep.id} className="flex justify-between text-xs py-1 border-b border-[rgba(22,219,147,0.05)]">
              <span className="text-muted-foreground">{dep.coin}</span>
              <span className="font-semibold">${Number(dep.amount).toLocaleString()}</span>
              <span className={statusCls(dep.status)}>{dep.status}</span>
            </div>
          ))
        }
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <DollarSign className="h-3 w-3" /> Withdrawals
        </div>
        {withdrawals.length === 0
          ? <div className="text-xs text-muted-foreground">None</div>
          : withdrawals.map((w) => (
            <div key={w.id} className="flex justify-between text-xs py-1 border-b border-[rgba(22,219,147,0.05)]">
              <span className="text-muted-foreground">{w.coin}</span>
              <span className="font-semibold">${Number(w.amount).toLocaleString()}</span>
              <span className={statusCls(w.status)}>{w.status}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}
