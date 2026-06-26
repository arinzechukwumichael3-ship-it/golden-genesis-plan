// Shared types + helpers for the investment flow

export type Plan = {
  id: string;
  name: string;
  slug: string;
  min_amount: number;
  max_amount: number | null;
  roi_percent: number;
  duration_days: number;
  active: boolean;
  sort_order: number;
};

export type CryptoWallet = {
  id: string;
  coin_name: string;
  symbol: string;
  network: string;
  wallet_address: string;
  is_active: boolean;
  sort_order: number;
};

export type Investment = {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  duration_days: number;
  roi_percent_snapshot: number;
  expected_return: number;
  start_at: string;
  end_at: string;
  maturity_date: string | null;
  status: "pending" | "active" | "completed" | "cancelled";
  payment_method: string | null;
  wallet_address_used: string | null;
  tx_hash: string | null;
  proof_url: string | null;
};

export const COIN_META: Record<string, { color: string; sym: string; bgSoft: string }> = {
  BTC:  { color: "#F7931A", sym: "₿", bgSoft: "rgba(247,147,26,0.12)" },
  ETH:  { color: "#627EEA", sym: "Ξ", bgSoft: "rgba(98,126,234,0.12)" },
  USDT: { color: "#26A17B", sym: "₮", bgSoft: "rgba(38,161,123,0.12)" },
  TRX:  { color: "#EB0029", sym: "T", bgSoft: "rgba(235,0,41,0.12)" },
  BNB:  { color: "#F3BA2F", sym: "⬡", bgSoft: "rgba(243,186,47,0.12)" },
};

export function paymentKey(w: Pick<CryptoWallet, "symbol" | "network">) {
  return `${w.symbol}:${w.network}`;
}

export function formatMoney(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function expectedReturn(amount: number, roiPct: number) {
  return Math.round(amount * (1 + roiPct / 100) * 100) / 100;
}

export function statusColor(s: Investment["status"]) {
  switch (s) {
    case "active":    return { bg: "rgba(22,219,147,0.12)",  fg: "#16DB93", label: "Active" };
    case "pending":   return { bg: "rgba(245,158,11,0.12)",  fg: "#F59E0B", label: "Pending" };
    case "completed": return { bg: "rgba(59,130,246,0.12)",  fg: "#3B82F6", label: "Completed" };
    case "cancelled": return { bg: "rgba(239,68,68,0.12)",   fg: "#EF4444", label: "Cancelled" };
    default:          return { bg: "rgba(148,163,184,0.12)", fg: "#94A3B8", label: s };
  }
}
