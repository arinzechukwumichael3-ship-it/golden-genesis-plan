import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[rgba(22,219,147,0.12)]">
      <div className="bg-black/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-14 grid md:grid-cols-4 gap-10 text-sm">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 font-display font-bold mb-4">
              <div className="h-8 w-8 rounded-xl gold-gradient grid place-items-center shadow-[0_0_16px_rgba(22,219,147,0.25)]">
                <span className="text-black text-sm font-black">Y</span>
              </div>
              <span>Yield<span className="gold-text">Empire</span></span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-xs">
              Institutional-grade crypto copy trading platform. Trusted by 12,400+ investors in 195+ countries.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#16DB93] uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-2.5 text-muted-foreground">
              <li><Link to="/plans" className="hover:text-[#16DB93] transition-colors duration-150">Plans</Link></li>
              <li><Link to="/about" className="hover:text-[#16DB93] transition-colors duration-150">About</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#16DB93] transition-colors duration-150">Dashboard</Link></li>
              <li><Link to="/auth" search={{ mode: "register" }} className="hover:text-[#16DB93] transition-colors duration-150">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#16DB93] uppercase tracking-wider text-[11px]">Resources</h4>
            <ul className="space-y-2.5 text-muted-foreground">
              <li><Link to="/faq" className="hover:text-[#16DB93] transition-colors duration-150">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-[#16DB93] transition-colors duration-150">Support</Link></li>
              <li><a href="#" className="hover:text-[#16DB93] transition-colors duration-150">Security</a></li>
              <li><a href="#" className="hover:text-[#16DB93] transition-colors duration-150">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#16DB93] uppercase tracking-wider text-[11px]">Legal</h4>
            <ul className="space-y-2.5 text-muted-foreground">
              <li><a href="#" className="hover:text-[#16DB93] transition-colors duration-150">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#16DB93] transition-colors duration-150">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#16DB93] transition-colors duration-150">AML Policy</a></li>
              <li><a href="#" className="hover:text-[#16DB93] transition-colors duration-150">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[rgba(22,219,147,0.06)] py-5">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
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
