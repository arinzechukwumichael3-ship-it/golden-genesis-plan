import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/40 mt-24">
      <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold mb-3">
            <span className="inline-block h-8 w-8 rounded-lg gold-gradient" />
            Yield<span className="gold-text">Empire</span>
          </div>
          <p className="text-muted-foreground">Institutional-grade crypto investment platform. Trusted by 12,000+ investors worldwide.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-[var(--gold)]">Platform</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/plans" className="hover:text-foreground">Plans</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-[var(--gold)]">Resources</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">FAQ</a></li>
            <li><a href="#" className="hover:text-foreground">Security</a></li>
            <li><a href="#" className="hover:text-foreground">Support</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-[var(--gold)]">Legal</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Terms</a></li>
            <li><a href="#" className="hover:text-foreground">Privacy</a></li>
            <li><a href="#" className="hover:text-foreground">AML</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} YieldEmpireCapital. All rights reserved.</div>
    </footer>
  );
}
