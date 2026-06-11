import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Ticker } from "./Ticker";
import { useAuth } from "@/hooks/use-auth";
import { TrendingUp } from "lucide-react";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <Ticker />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {user && (
        <Link to="/invest" className="md:hidden fixed bottom-5 right-5 z-50 gold-gradient text-black rounded-full px-5 py-3 flex items-center gap-2 font-semibold shadow-lg glow-gold animate-float">
          <TrendingUp className="h-4 w-4" /> Invest Now
        </Link>
      )}
    </div>
  );
}
