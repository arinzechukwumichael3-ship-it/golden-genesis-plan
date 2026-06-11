import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const searchSchema = z.object({ mode: z.enum(["login","register"]).optional(), ref: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — YieldEmpireCapital" },
      { name: "description", content: "Sign in or create your YieldEmpireCapital account." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const { mode, ref } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login"|"register">(mode === "register" ? "register" : "login");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate({ to: "/dashboard" });
  };

  const onRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const refCode = String(fd.get("ref") || "").trim();
    const { error } = await supabase.auth.signUp({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: String(fd.get("full_name") || ""),
          ref: refCode || undefined,
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — you're signed in");
    navigate({ to: "/dashboard" });
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-4 py-20">
        <Card className="surface-card border-white/5">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold mb-1">Welcome to <span className="gold-text">YieldEmpire</span></h1>
            <p className="text-sm text-muted-foreground mb-6">Sign in or create an account to start investing.</p>
            <Tabs value={tab} onValueChange={(v) => setTab(v as "login"|"register")}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Sign in</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={onLogin} className="space-y-4 mt-4">
                  <div><Label>Email</Label><Input name="email" type="email" required /></div>
                  <div><Label>Password</Label><Input name="password" type="password" required minLength={6} /></div>
                  <Button disabled={loading} type="submit" className="w-full gold-gradient text-black hover:opacity-90">{loading ? "Signing in..." : "Sign in"}</Button>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={onRegister} className="space-y-4 mt-4">
                  <div><Label>Full name</Label><Input name="full_name" required /></div>
                  <div><Label>Email</Label><Input name="email" type="email" required /></div>
                  <div><Label>Password</Label><Input name="password" type="password" required minLength={6} /></div>
                  <div><Label>Referral code (optional)</Label><Input name="ref" defaultValue={ref} placeholder="e.g. ABC12345" /></div>
                  <Button disabled={loading} type="submit" className="w-full gold-gradient text-black hover:opacity-90">{loading ? "Creating..." : "Create account"}</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </SiteLayout>
  );
}
