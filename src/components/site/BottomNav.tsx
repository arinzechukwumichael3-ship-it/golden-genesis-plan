import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LayoutDashboard, TrendingUp, ArrowDownToLine, Wallet, Users } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const ITEMS = [
  { label: "Home",     to: "/dashboard",  icon: LayoutDashboard,    center: false },
  { label: "Invest",   to: "/invest",     icon: TrendingUp,         center: false },
  { label: "Deposit",  to: "/deposit",    icon: ArrowDownToLine,    center: true  },
  { label: "Wallet",   to: "/withdraw",   icon: Wallet,             center: false },
  { label: "Referrals",to: "/referrals",  icon: Users,              center: false },
] as const;

export function BottomNav() {
  const { theme } = useTheme();
  const { location } = useRouterState();
  const path = location.pathname;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50">
      <div
        className={`backdrop-blur-2xl border-t ${
          theme === "dark"
            ? "bg-[rgba(10,11,13,0.97)] border-white/[0.07]"
            : "bg-[rgba(255,255,255,0.98)] border-black/[0.06]"
        }`}
      >
        <div className="flex items-end justify-around px-1 pt-2 pb-[max(env(safe-area-inset-bottom),10px)]">
          {ITEMS.map(({ label, to, icon: Icon, center }) => {
            const active = path === to || (to !== "/dashboard" && path.startsWith(to));
            const color = active
              ? "#16DB93"
              : theme === "dark" ? "rgba(255,255,255,0.38)" : "rgba(13,27,62,0.38)";

            if (center) {
              return (
                <Link key={to} to={to} className="flex flex-col items-center -mt-6">
                  <motion.div
                    whileTap={{ scale: 0.86 }}
                    className="h-14 w-14 rounded-2xl gold-gradient grid place-items-center animate-glow-pulse"
                    style={{ boxShadow: "0 4px 24px rgba(22,219,147,0.5), 0 0 0 3px rgba(22,219,147,0.15)" }}
                  >
                    <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                  </motion.div>
                  <span className="text-[9px] mt-1.5 font-semibold text-[#16DB93]">{label}</span>
                </Link>
              );
            }

            return (
              <Link key={to} to={to}>
                <motion.div whileTap={{ scale: 0.84 }} className="flex flex-col items-center gap-0.5 px-3 py-0.5">
                  <Icon className="h-[21px] w-[21px] transition-colors duration-200" style={{ color }} />
                  <span className="text-[9px] font-medium transition-colors duration-200" style={{ color }}>
                    {label}
                  </span>
                  <div
                    className="h-[3px] w-3.5 rounded-full transition-all duration-300"
                    style={{ background: active ? "#16DB93" : "transparent" }}
                  />
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
