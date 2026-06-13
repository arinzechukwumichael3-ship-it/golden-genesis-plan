import { CURRENCIES, useCurrency, type CurrencyCode } from "@/lib/currency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";

export function CurrencySwitcher({ className }: { className?: string }) {
  const { currency, setCurrency, info } = useCurrency();
  const codes: CurrencyCode[] = ["USD", "EUR", "GBP"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold hover:border-[var(--gold)]/40 hover:text-[var(--gold)] transition ${className ?? ""}`}
        aria-label="Change currency"
      >
        <span className="text-[var(--gold)]">{info.symbol}</span>
        <span>{currency}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {codes.map((c) => {
          const i = CURRENCIES[c];
          return (
            <DropdownMenuItem
              key={c}
              onClick={() => setCurrency(c)}
              className="flex items-center justify-between gap-2 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-5 text-[var(--gold)] font-bold">{i.symbol}</span>
                <span>{c}</span>
                <span className="text-xs text-muted-foreground">{i.label}</span>
              </span>
              {c === currency && <Check className="h-3.5 w-3.5 text-[var(--gold)]" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
