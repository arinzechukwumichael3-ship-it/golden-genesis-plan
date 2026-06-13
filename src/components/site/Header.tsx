import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { CurrencySwitcher } from "@/components/site/CurrencySwitcher";

export function Header() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  const navItems = (
    <>
      <Link to="/" className="hover:text-[var(--gold)] transition" activeOptions={{ exact: true }} activeProps={{ className: "text-[var(--gold)]" }}>Home</Link>
      <Link to="/about" className="hover:text-[var(--gold)] transition" activeProps={{ className: "text-[var(--gold)]" }}>About</Link>
      <Link to="/plans" className="hover:text-[var(--gold)] transition" activeProps={{ className: "text-[var(--gold)]" }}>Plans</Link>
      {user && <Link to="/dashboard" className="hover:text-[var(--gold)] transition" activeProps={{ className: "text-[var(--gold)]" }}>Dashboard</Link>}
      {isAdmin && <Link to="/admin" className="hover:text-[var(--gold)] transition" activeProps={{ className: "text-[var(--gold)]" }}>Admin</Link>}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="inline-block h-8 w-8 rounded-lg gold-gradient" />
          <span>Yield<span className="gold-text">Empire</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">{navItems}</nav>
        <div className="hidden md:flex items-center gap-2">
          <CurrencySwitcher />
          {user ? (
            <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild><Link to="/auth">Sign in</Link></Button>
              <Button size="sm" className="gold-gradient text-black hover:opacity-90" asChild><Link to="/auth" search={{ mode: "register" }}>Get Started</Link></Button>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/5 px-4 py-4 flex flex-col gap-4 text-sm" onClick={() => setOpen(false)}>
          {navItems}
          <div onClick={(e) => e.stopPropagation()}><CurrencySwitcher /></div>
          {user ? (
            <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
          ) : (
            <Button size="sm" className="gold-gradient text-black" asChild><Link to="/auth">Sign in</Link></Button>
          )}
        </div>
      )}
    </header>
  );
}
