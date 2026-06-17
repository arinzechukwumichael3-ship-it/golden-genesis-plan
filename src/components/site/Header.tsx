import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  const linkCls = "relative text-sm text-muted-foreground hover:text-white transition-colors duration-200 after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-0 after:bg-[#16DB93] after:transition-all after:duration-250 hover:after:w-full";
  const activeCls = "text-white after:w-full";

  const navLinks = (
    <>
      <Link to="/" className={linkCls} activeOptions={{ exact: true }} activeProps={{ className: `${linkCls} ${activeCls}` }}>Home</Link>
      <Link to="/plans" className={linkCls} activeProps={{ className: `${linkCls} ${activeCls}` }}>Plans</Link>
      <Link to="/about" className={linkCls} activeProps={{ className: `${linkCls} ${activeCls}` }}>About</Link>
      <Link to="/faq" className={linkCls} activeProps={{ className: `${linkCls} ${activeCls}` }}>FAQ</Link>
      <Link to="/contact" className={linkCls} activeProps={{ className: `${linkCls} ${activeCls}` }}>Contact</Link>
      {user && <Link to="/dashboard" className={linkCls} activeProps={{ className: `${linkCls} ${activeCls}` }}>Dashboard</Link>}
      {isAdmin && <Link to="/admin" className={linkCls} activeProps={{ className: `${linkCls} ${activeCls}` }}>Admin</Link>}
    </>
  );

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "bg-black/90 border-b border-[rgba(22,219,147,0.08)] shadow-lg shadow-black/30" : "bg-black/50 border-b border-transparent"} backdrop-blur-xl`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-display font-bold group">
          <div className="relative h-9 w-9 rounded-xl gold-gradient grid place-items-center group-hover:scale-105 transition-transform duration-200 shadow-[0_0_20px_rgba(22,219,147,0.3)]">
            <span className="text-black text-sm font-black">Y</span>
          </div>
          <span className="text-base">Yield<span className="gold-text">Empire</span></span>
        </Link>

        {/* Desktop nav — centered */}
        <nav className="hidden md:flex items-center gap-7">{navLinks}</nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="border-[rgba(22,219,147,0.2)] text-muted-foreground hover:border-[rgba(22,219,147,0.5)] hover:text-[#16DB93] transition-colors text-xs px-4"
            >
              Sign out
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white text-xs" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button
                size="sm"
                className="gold-gradient text-black hover:opacity-90 font-semibold text-xs px-5 animate-glow-pulse"
                asChild
              >
                <Link to="/auth" search={{ mode: "register" }}>Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X className="h-5 w-5" />
              </motion.span>
            ) : (
              <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Menu className="h-5 w-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-[rgba(22,219,147,0.08)]"
            onClick={() => setOpen(false)}
          >
            <div className="px-4 py-5 flex flex-col gap-5 text-sm bg-black/95 backdrop-blur-xl">
              {navLinks}
              <div className="pt-3 border-t border-[rgba(22,219,147,0.08)]">
                {user ? (
                  <Button variant="outline" size="sm" onClick={signOut} className="w-full border-[rgba(22,219,147,0.2)] hover:border-[rgba(22,219,147,0.5)] hover:text-[#16DB93]">
                    Sign out
                  </Button>
                ) : (
                  <Button size="sm" className="w-full gold-gradient text-black font-semibold" asChild>
                    <Link to="/auth" search={{ mode: "register" }}>Get Started</Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
