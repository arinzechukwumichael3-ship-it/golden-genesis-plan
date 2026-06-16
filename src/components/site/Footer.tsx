import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[rgba(22,219,147,0.2)]">
      <div className="bg-black/40 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-bold mb-3">
              <span className="inline-block h-8 w-8 rounded-lg gold-gradient" />
              Yield<span className="gold-text">Empire</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">Institutional-grade crypto investment platform. Trusted by 12,000+ investors worldwide.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#16DB93] uppercase tracking-wider text-xs">Platform</h4>
            <ul className="space-y-2.5 text-muted-foreground">
              <li><Link to="/plans" className="hover:text-[#16DB93] transition-colors">Plans</Link></li>
              <li><Link to="/about" className="hover:text-[#16DB93] transition-colors">About</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#16DB93] transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#16DB93] uppercase tracking-wider text-xs">Resources</h4>
            <ul className="space-y-2.5 text-muted-foreground">
              <li><a href="#" className="hover:text-[#16DB93] transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-[#16DB93] transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-[#16DB93] transition-colors">Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#16DB93] uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-2.5 text-muted-foreground">
              <li><a href="#" className="hover:text-[#16DB93] transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-[#16DB93] transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-[#16DB93] transition-colors">AML</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[rgba(22,219,147,0.06)] py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} YieldEmpireCapital. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
