import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
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
      <section className="relative mx-auto max-w-md px-4 py-20 overflow-hidden">
        {/* Green ambient glow behind card */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(22,219,147,0.07),transparent_70%)] pointer-events-none" />

        {/* Floating particles */}
        {[...Array(4)].map((_, i) => (
          <motion.div key={i}
            className="absolute h-1 w-1 rounded-full bg-[#16DB93]/30 pointer-events-none"
            style={{ left: `${15 + i * 22}%`, top: `${20 + (i % 2) * 40}%` }}
            animate={{ y: [-8, 8], opacity: [0.2, 0.6] }}
            transition={{ duration: 2.5 + i * 0.6, repeat: Infinity, repeatType: "reverse", delay: i * 0.5 }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="surface-card border-[rgba(22,219,147,0.15)] animate-glow-pulse relative">
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
                    <div>
                      <Label>Email</Label>
                      <Input name="email" type="email" required className="focus-visible:ring-[#16DB93] focus-visible:border-[#16DB93]/50" />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input name="password" type="password" required minLength={6} className="focus-visible:ring-[#16DB93] focus-visible:border-[#16DB93]/50" />
                    </div>
                    <Button disabled={loading} type="submit" className="w-full gold-gradient text-white hover:opacity-90">
                      {loading ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={onRegister} className="space-y-4 mt-4">
                    <div>
                      <Label>Full name</Label>
                      <Input name="full_name" required className="focus-visible:ring-[#16DB93] focus-visible:border-[#16DB93]/50" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input name="email" type="email" required className="focus-visible:ring-[#16DB93] focus-visible:border-[#16DB93]/50" />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input name="password" type="password" required minLength={6} className="focus-visible:ring-[#16DB93] focus-visible:border-[#16DB93]/50" />
                    </div>
                    <div>
                      <Label>Referral code (optional)</Label>
                      <Input name="ref" defaultValue={ref} placeholder="e.g. ABC12345" className="focus-visible:ring-[#16DB93] focus-visible:border-[#16DB93]/50" />
                    </div>
                    <Button disabled={loading} type="submit" className="w-full gold-gradient text-white hover:opacity-90">
                      {loading ? "Creating..." : "Create account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </SiteLayout>
  );
}
