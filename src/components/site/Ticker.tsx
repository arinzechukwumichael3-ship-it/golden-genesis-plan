import { useEffect, useState } from "react";

type Quote = { symbol: string; price: number; change: number };

const FALLBACK: Quote[] = [
  { symbol: "BTC", price: 71823.42, change: 2.31 },
  { symbol: "ETH", price: 3842.10, change: 1.07 },
  { symbol: "BNB", price: 612.84, change: -0.42 },
  { symbol: "USDT", price: 1.00, change: 0.01 },
  { symbol: "SOL", price: 184.92, change: 3.18 },
  { symbol: "XRP", price: 0.58, change: -1.22 },
];

export function Ticker() {
  const [quotes, setQuotes] = useState<Quote[]>(FALLBACK);
  useEffect(() => {
    const ids = "bitcoin,ethereum,binancecoin,tether,solana,ripple";
    const load = async () => {
      try {
        const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
        if (!r.ok) return;
        const d = await r.json();
        setQuotes([
          { symbol: "BTC", price: d.bitcoin.usd, change: d.bitcoin.usd_24h_change },
          { symbol: "ETH", price: d.ethereum.usd, change: d.ethereum.usd_24h_change },
          { symbol: "BNB", price: d.binancecoin.usd, change: d.binancecoin.usd_24h_change },
          { symbol: "USDT", price: d.tether.usd, change: d.tether.usd_24h_change },
          { symbol: "SOL", price: d.solana.usd, change: d.solana.usd_24h_change },
          { symbol: "XRP", price: d.ripple.usd, change: d.ripple.usd_24h_change },
        ]);
      } catch { /* keep fallback */ }
    };
    load();
    const i = setInterval(load, 30000);
    return () => clearInterval(i);
  }, []);

  const items = [...quotes, ...quotes];
  return (
    <div className="bg-[#0D1B3E] border-b border-white/5 overflow-hidden">
      <div className="ticker-track flex whitespace-nowrap py-2 gap-10 text-xs">
        {items.map((q, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-3">
            <span className="font-semibold text-[var(--gold)]">{q.symbol}</span>
            <span className="tabular-nums text-white/80">${q.price.toLocaleString(undefined, { maximumFractionDigits: q.price < 5 ? 4 : 2 })}</span>
            <span className={q.change >= 0 ? "text-emerald-400" : "text-red-400"}>
              {q.change >= 0 ? "▲" : "▼"} {Math.abs(q.change).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
