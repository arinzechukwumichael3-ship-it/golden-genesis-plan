import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Announcement bar */}
      <div className={`text-xs font-semibold py-2 overflow-hidden ${theme === "dark" ? "bg-[#16DB93] text-black" : "bg-[#0D1B3E] text-white"}`}>
        <div className="animate-marquee flex whitespace-nowrap gap-16">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex gap-16 shrink-0">
              {[
                "🔥 Now paying out crypto returns in 72 hours",
                "Trusted by 12,400+ investors",
                "BTC & USDT plans live",
                "Zero hidden fees · Bank-grade security",
                "SOC2 Compliant",
              ].map((item) => (
                <span key={item} className="shrink-0 px-3">{item}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <Header />
      <main className={`flex-1 ${user ? "pb-24 md:pb-0" : ""}`}>{children}</main>
      <Footer />
      {user && <BottomNav />}
    </div>
  );
}
