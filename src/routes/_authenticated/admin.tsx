import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
    if (!roles) throw redirect({ to: "/dashboard" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex gap-2 flex-wrap mb-8 border-b border-[rgba(22,219,147,0.08)] pb-4">
          {[
            { to: "/admin", label: "Overview" },
            { to: "/admin/users", label: "Users" },
            { to: "/admin/deposits", label: "Deposits" },
            { to: "/admin/withdrawals", label: "Withdrawals" },
            { to: "/admin/plans", label: "Plans" },
            { to: "/admin/wallets", label: "Wallets" },
            { to: "/admin/referrals", label: "Referrals" },
            { to: "/admin/notifications", label: "Notify" },
          ].map((l) => (
            <Link key={l.to} to={l.to} activeOptions={{ exact: true }} activeProps={{ className: "gold-gradient text-white" }}
              className="px-3 py-1.5 rounded-md text-sm border border-white/10 hover:border-[rgba(22,219,147,0.4)] hover:text-[#16DB93] transition-colors duration-200">{l.label}</Link>
          ))}
        </div>
        <Outlet />
      </section>
    </SiteLayout>
  );
}
