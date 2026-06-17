import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useLanguage } from "@/contexts/language-context";
import { LOCALES, type Locale } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon, Globe, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  const darkBg = scrolled
    ? "bg-[#0A0B0D]/95 border-b border-white/[0.08] shadow-sm shadow-black/30"
    : "bg-[#0A0B0D]/80";
  const lightBg = scrolled
    ? "bg-white/95 border-b border-black/[0.06] shadow-sm shadow-black/[0.04]"
    : "bg-white/80";

  const headerCls = `sticky top-0 z-40 transition-all duration-300 backdrop-blur-xl ${theme === "dark" ? darkBg : lightBg}`;

  const linkCls = theme === "dark"
    ? "relative text-sm text-white/60 hover:text-white transition-colors duration-200 after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-0 after:bg-[#16DB93] after:transition-all after:duration-250 hover:after:w-full"
    : "relative text-sm text-[#0D1B3E]/60 hover:text-[#0D1B3E] transition-colors duration-200 after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-0 after:bg-[#16DB93] after:transition-all after:duration-250 hover:after:w-full";
  const activeCls = theme === "dark" ? "text-white after:w-full" : "text-[#0D1B3E] after:w-full";
  const brandCls = theme === "dark" ? "text-white" : "text-[#0D1B3E]";

  const currentLoc = LOCALES.find((l) => l.code === locale)!;

  const navLinks = (
    <>
      <Link to="/" className={linkCls} activeOptions={{ exact: true }} activeProps={{ className: `${linkCls} ${activeCls}` }}>{t("nav.home")}</Link>
      <Link to="/plans" className={linkCls} activeProps={{ className: `${linkCls} ${activeCls}` }}>{t("nav.plans")}</Link>
      <Link to="/about" className={linkCls} activeProps={{ className: `${linkCls} ${activeCls}` }}>{t("nav.about")}</Link>
      <Link to="/faq" className={linkCls} activeProps={{ className: `${linkCls} ${activeCls}` }}>{t("nav.faq")}</Link>
      <Link to="/contact" className={linkCls} activeProps={{ className: `${linkCls} ${activeCls}` }}>{t("nav.contact")}</Link>
      {user && <Link to="/dashboard" className={linkCls} activeProps={{ className: `${linkCls} ${activeCls}` }}>{t("nav.dashboard")}</Link>}
      {isAdmin && <Link to="/admin" className={linkCls} activeProps={{ className: `${linkCls} ${activeCls}` }}>Admin</Link>}
    </>
  );

  const iconBtnCls = theme === "dark"
    ? "p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
    : "p-2 rounded-lg hover:bg-black/5 transition-colors text-[#0D1B3E]/60 hover:text-[#0D1B3E]";

  return (
    <header className={headerCls}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-display font-bold group">
          <div className="relative h-9 w-9 rounded-xl gold-gradient grid place-items-center group-hover:scale-105 transition-transform duration-200 shadow-[0_0_16px_rgba(13,27,62,0.2)]">
            <span className="text-white text-sm font-black">Y</span>
          </div>
          <span className={`text-base ${brandCls}`}>Yield<span className="gold-text">Empire</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">{navLinks}</nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-1.5">
          {/* Theme toggle */}
          <button onClick={toggle} className={iconBtnCls} aria-label="Toggle theme">
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun className="h-4 w-4" />
                </motion.span>
              ) : (
                <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon className="h-4 w-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Language selector */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className={`${iconBtnCls} flex items-center gap-1.5 text-xs font-medium px-3`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{currentLoc.flag}</span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className={`absolute right-0 top-full mt-2 w-44 rounded-xl shadow-xl border overflow-hidden z-50 ${theme === "dark" ? "bg-[#111827] border-white/10" : "bg-white border-black/[0.08]"}`}
                >
                  {LOCALES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLocale(l.code as Locale); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${locale === l.code
                        ? "text-[#16DB93] bg-[rgba(22,219,147,0.08)]"
                        : theme === "dark" ? "text-white/70 hover:text-white hover:bg-white/5" : "text-[#0D1B3E]/70 hover:text-[#0D1B3E] hover:bg-black/[0.04]"
                      }`}
                    >
                      <span className="text-base">{l.flag}</span>
                      <span>{l.label}</span>
                      {locale === l.code && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#16DB93]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className={`border text-xs px-4 transition-colors ${theme === "dark" ? "border-white/20 text-white/70 hover:border-white/50 hover:text-white bg-transparent" : "border-[#0D1B3E]/20 text-[#0D1B3E]/70 hover:border-[#0D1B3E]/50 hover:text-[#0D1B3E]"}`}
            >
              {t("auth.signOut")}
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className={`text-xs ${theme === "dark" ? "text-white/70 hover:text-white hover:bg-white/10" : "text-[#0D1B3E]/70 hover:text-[#0D1B3E]"}`} asChild>
                <Link to="/auth">{t("auth.signIn")}</Link>
              </Button>
              <Button
                size="sm"
                className="gold-gradient text-white hover:opacity-90 font-semibold text-xs px-5 animate-glow-pulse"
                asChild
              >
                <Link to="/auth" search={{ mode: "register" }}>{t("auth.getStarted")}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-1">
          <button onClick={toggle} className={iconBtnCls} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-white/10" : "hover:bg-black/5"}`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className={`h-5 w-5 ${theme === "dark" ? "text-white" : "text-[#0D1B3E]"}`} />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className={`h-5 w-5 ${theme === "dark" ? "text-white" : "text-[#0D1B3E]"}`} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className={`md:hidden overflow-hidden border-t ${theme === "dark" ? "border-white/[0.08]" : "border-black/[0.06]"}`}
            onClick={() => setOpen(false)}
          >
            <div className={`px-4 py-5 flex flex-col gap-5 text-sm ${theme === "dark" ? "bg-[#0A0B0D]" : "bg-white"}`}>
              {navLinks}
              {/* Language picker row */}
              <div className="flex flex-wrap gap-2 py-2">
                {LOCALES.map((l) => (
                  <button
                    key={l.code}
                    onClick={(e) => { e.stopPropagation(); setLocale(l.code as Locale); }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-colors ${locale === l.code
                      ? "border-[#16DB93] text-[#16DB93] bg-[rgba(22,219,147,0.08)]"
                      : theme === "dark" ? "border-white/10 text-white/50 hover:text-white" : "border-black/10 text-[#0D1B3E]/50 hover:text-[#0D1B3E]"
                    }`}
                  >
                    <span>{l.flag}</span>
                  </button>
                ))}
              </div>
              <div className={`pt-3 border-t ${theme === "dark" ? "border-white/[0.08]" : "border-black/[0.06]"}`}>
                {user ? (
                  <Button variant="outline" size="sm" onClick={signOut} className="w-full">
                    {t("auth.signOut")}
                  </Button>
                ) : (
                  <Button size="sm" className="w-full gold-gradient text-white font-semibold" asChild>
                    <Link to="/auth" search={{ mode: "register" }}>{t("auth.getStarted")}</Link>
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
