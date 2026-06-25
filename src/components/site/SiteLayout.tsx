import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

const WHATSAPP_NUMBER = "9122646692";
const WHATSAPP_MSG = encodeURIComponent("Hello YieldEmpire Support, I need help with my account.");

export function SiteLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col w-full max-w-[100vw] overflow-x-hidden">

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
      <main className={`flex-1 w-full min-w-0 ${user ? "pb-24 md:pb-0" : ""}`}>{children}</main>
      <Footer />
      {user && <BottomNav />}

      {/* WhatsApp support button — left side on mobile to avoid covering right-side content */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className={`fixed z-50 flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-110 active:scale-95 left-4 md:left-auto md:right-4 ${user ? "bottom-28 md:bottom-6" : "bottom-6"}`}
        style={{
          width: 48,
          height: 48,
          background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
          boxShadow: "0 4px 20px rgba(37,211,102,0.45)",
        }}
      >
        <svg viewBox="0 0 32 32" width="26" height="26" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.003 2.667C8.639 2.667 2.667 8.638 2.667 16c0 2.338.636 4.624 1.844 6.627L2.667 29.333l6.875-1.803A13.29 13.29 0 0016.003 29.333c7.364 0 13.33-5.97 13.33-13.333 0-7.362-5.966-13.333-13.33-13.333zm0 24.444a11.07 11.07 0 01-5.638-1.546l-.404-.24-4.08 1.07 1.09-3.973-.264-.41A11.07 11.07 0 014.89 16c0-6.128 4.985-11.111 11.113-11.111S27.116 9.872 27.116 16c0 6.128-4.985 11.111-11.113 11.111zm6.09-8.318c-.333-.167-1.97-.972-2.276-1.083-.305-.111-.528-.167-.75.167-.222.333-.861 1.083-1.056 1.305-.194.222-.388.25-.72.083-.333-.167-1.404-.517-2.675-1.65-.988-.882-1.655-1.97-1.85-2.304-.194-.333-.02-.514.146-.68.15-.149.333-.39.5-.583.167-.194.222-.333.333-.556.111-.222.056-.416-.028-.583-.083-.167-.75-1.806-1.028-2.472-.27-.65-.547-.561-.75-.572l-.638-.011c-.222 0-.583.083-.888.416-.305.333-1.167 1.14-1.167 2.778s1.195 3.222 1.361 3.444c.167.222 2.347 3.583 5.688 5.028.796.344 1.416.55 1.9.703.799.255 1.527.219 2.1.133.641-.095 1.97-.805 2.248-1.583.278-.778.278-1.444.194-1.583-.083-.14-.305-.222-.638-.389z"/>
        </svg>
      </a>
    </div>
  );
}
