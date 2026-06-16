import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  const linkClass = "relative text-muted-foreground hover:text-[#16DB93] transition-colors duration-200 after:absolute after:bottom-[-2px] after:left-0 after:h-px after:w-0 after:bg-[#16DB93] after:transition-all after:duration-200 hover:after:w-full";
  const activeLinkClass = "text-[#16DB93] after:w-full";

  const navLinks = (
    <>
      <Link to="/" className={linkClass} activeOptions={{ exact: true }} activeProps={{ className: `${linkClass} ${activeLinkClass}` }}>Home</Link>
      <Link to="/about" className={linkClass} activeProps={{ className: `${linkClass} ${activeLinkClass}` }}>About</Link>
      <Link to="/plans" className={linkClass} activeProps={{ className: `${linkClass} ${activeLinkClass}` }}>Plans</Link>
      {user && <Link to="/dashboard" className={linkClass} activeProps={{ className: `${linkClass} ${activeLinkClass}` }}>Dashboard</Link>}
      {isAdmin && <Link to="/admin" className={linkClass} activeProps={{ className: `${linkClass} ${activeLinkClass}` }}>Admin</Link>}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(22,219,147,0.08)] bg-black/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold group">
          <span className="inline-block h-8 w-8 rounded-lg gold-gradient group-hover:scale-105 transition-transform duration-200" />
          <span>Yield<span className="gold-text">Empire</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">{navLinks}</nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <Button variant="outline" size="sm" onClick={signOut} className="border-white/15 hover:border-[rgba(22,219,147,0.4)] hover:text-[#16DB93] transition-colors">
              Sign out
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hover:text-[#16DB93]" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button size="sm" className="gold-gradient text-black hover:opacity-90 animate-glow-pulse" asChild>
                <Link to="/auth" search={{ mode: "register" }}>Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden p-1 hover:text-[#16DB93] transition-colors" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-[rgba(22,219,147,0.08)]"
            onClick={() => setOpen(false)}
          >
            <div className="px-4 py-4 flex flex-col gap-4 text-sm bg-black/80 backdrop-blur-xl">
              {navLinks}
              {user ? (
                <Button variant="outline" size="sm" onClick={signOut} className="border-white/15">Sign out</Button>
              ) : (
                <Button size="sm" className="gold-gradient text-black" asChild>
                  <Link to="/auth">Sign in</Link>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
