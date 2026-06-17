import { Link } from "@tanstack/react-router";
import { LogoMark } from "./LogoMark";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="bg-[#0D1B3E]">
        <div className="mx-auto max-w-7xl px-4 py-14 grid md:grid-cols-4 gap-10 text-sm">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 font-display font-bold mb-4">
              <LogoMark size={32} uid="footer" />
              <span className="text-white">Yield<span className="gold-text">Empire</span></span>
            </div>
            <p className="text-white/60 leading-relaxed text-xs">
              Institutional-grade crypto copy trading platform. Trusted by 12,400+ investors in 195+ countries.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#16DB93] uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-2.5 text-white/60">
              <li><Link to="/plans" className="hover:text-[#16DB93] transition-colors duration-150">Plans</Link></li>
              <li><Link to="/about" className="hover:text-[#16DB93] transition-colors duration-150">About</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#16DB93] transition-colors duration-150">Dashboard</Link></li>
              <li><Link to="/auth" search={{ mode: "register" }} className="hover:text-[#16DB93] transition-colors duration-150">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#16DB93] uppercase tracking-wider text-[11px]">Resources</h4>
            <ul className="space-y-2.5 text-white/60">
              <li><Link to="/faq" className="hover:text-[#16DB93] transition-colors duration-150">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-[#16DB93] transition-colors duration-150">Support</Link></li>
              <li><a href="#" className="hover:text-[#16DB93] transition-colors duration-150">Security</a></li>
              <li><a href="#" className="hover:text-[#16DB93] transition-colors duration-150">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#16DB93] uppercase tracking-wider text-[11px]">Legal</h4>
            <ul className="space-y-2.5 text-white/60">
              <li><a href="#" className="hover:text-[#16DB93] transition-colors duration-150">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#16DB93] transition-colors duration-150">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#16DB93] transition-colors duration-150">AML Policy</a></li>
              <li><a href="#" className="hover:text-[#16DB93] transition-colors duration-150">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.08] py-5">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
            <span>© {new Date().getFullYear()} YieldEmpireCapital. All rights reserved.</span>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16DB93] animate-pulse" />
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
