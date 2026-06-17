import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/notifications")({ component: AdminN });

function AdminN() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    // broadcast: user_id null
    const { error } = await supabase.from("notifications").insert({ user_id: null, title, body });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Broadcast sent to all users");
    setTitle(""); setBody("");
  };

  return (
    <Card className="surface-card border-white/5 max-w-xl"><CardContent className="p-6">
      <h2 className="text-xl font-bold mb-4">Send broadcast notification</h2>
      <form onSubmit={send} className="space-y-4">
        <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} /></div>
        <div><Label>Message</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={500} /></div>
        <Button disabled={loading} type="submit" className="gold-gradient text-white w-full">{loading ? "Sending..." : "Send to all users"}</Button>
      </form>
    </CardContent></Card>
  );
}
