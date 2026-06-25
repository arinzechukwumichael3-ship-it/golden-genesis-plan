# Plan: Mobile Fixes + Crypto Investment System

This is a large piece of work. I'll split it into two phases so you can review and adjust before I build phase 2.

---

## Phase 1 — Mobile responsiveness (site-wide)

Goal: no horizontal scroll, full-width sections, safe containers at 375 / 430 / 768 px.

1. Verify `<meta name="viewport" content="width=device-width, initial-scale=1.0">` in `src/routes/__root.tsx` head.
2. Add global guards in `src/styles.css`:
   - `html, body { overflow-x: hidden; max-width: 100vw; }`
   - `img, video, svg { max-width: 100%; height: auto; }`
   - `.container-x { width: 100%; max-width: 1200px; margin-inline: auto; padding-inline: 16px; box-sizing: border-box; }`
3. Audit and patch fixed-width / overflow offenders on:
   - Home (`src/routes/index.tsx`)
   - Plans (`src/routes/plans.tsx`)
   - Header / Footer / BottomNav
   - Referrals page (called out specifically) — wrap tables in `overflow-x-auto`, make referral-link row use `grid-cols-[minmax(0,1fr)_auto]` + `min-w-0` + `truncate` per the responsive-layout rule
   - Dashboard, Deposit, Withdraw, Admin pages — same audit
4. Replace any `w-[700px]` / fixed pixel widths with `w-full max-w-[Npx]`.

---

## Phase 2 — Crypto Investment System

Note: an `investments` / `plans` / `deposits` system already exists in this project (see `_authenticated/invest.tsx`, `admin/plans.tsx`, `admin/deposits.tsx`, `admin/wallets.tsx`). I will **extend** it rather than create parallel tables, to avoid breaking the existing admin flows.

### 2a. Database migration (single migration, awaiting your approval)

- Extend `public.plans`: add `max_amount`, `duration_days` (if missing — current schema has `min_amount`, `roi_percent`). Seed the 7 tiers:
  Basic Deluxe, Promo Package, Elite Deluxe, Pro Deluxe, Contract I, Contract II, Contract III with the ranges you listed.
- Extend `public.wallets`: add `coin_name`, `network`, `symbol`, `is_active`, `logo_key`. Seed BTC, ETH, USDT-TRC20, USDT-ERC20, USDT-BEP20, TRX rows (addresses blank, admin fills in).
- Extend `public.investments`: add `payment_method`, `wallet_address_used`, `tx_hash`, `proof_url`, `maturity_date`.
- New `public.earnings_log` table (user_id, investment_id, amount, type, credited_at) with RLS + GRANTs.
- Update `create_investment` RPC to accept `payment_method` and enforce `min_amount`/`max_amount`.

### 2b. New investment flow pages (teal EnzoBank styling, mobile-first, white cards, no dark sidebar)

- `/_authenticated/invest/new` — plan selector, custom dropdown with plan cards, payment method 2×3 grid, amount input with min/max validation, order summary, "Proceed to Deposit".
- `/_authenticated/invest/deposit/$id` — wallet address + QR code (using `qrcode.react`), copy button, 30-min countdown, "I have made the payment".
- `/_authenticated/invest/deposit/$id/proof` — upload screenshot to existing `payment-proofs` storage bucket OR enter tx hash.
- `/_authenticated/invest/deposit/$id/confirm` — success screen with green check animation.
- `/_authenticated/invest/portfolio` — stats row + investment cards + progress bars + empty state.
- `/_authenticated/invest/earnings` — filter tabs (All / Credited / Pending), list, running total.
- Existing `/_authenticated/invest` page kept as redirect → `/invest/new` (or repurposed as portfolio).

### 2c. Admin

- Extend `/_authenticated/admin/plans` to manage ROI, duration, max_amount, active status for the 7 tiers.
- Extend `/_authenticated/admin/wallets` to manage per-coin address + active toggle.
- `/_authenticated/admin/deposits` already lists pending + approve/reject — verify it shows new `tx_hash` and `proof_url`.

### 2d. Tech notes

- Use existing teal tokens in `src/styles.css`; no hardcoded hex.
- Use `qrcode.react` (add via bun).
- Currency display uses existing `CurrencySwitcher` / `src/lib/currency.tsx`.
- All server reads via `supabase` browser client (user-scoped, RLS applies).

---

## What I need from you before I start

1. **Phase 1 only first, or both phases in one go?** Phase 2 is several hours of work and a DB migration.
2. **Existing data:** I'll seed the 7 new plan tiers. OK to leave any existing plan rows in place (just marked inactive), or wipe and replace?
3. **ROI / duration values:** you didn't specify per-tier ROI% or duration days. I'll default to: Basic 15%/30d, Promo 25%/45d, Elite 35%/60d, Pro 50%/90d, Contract I 80%/120d, II 120%/150d, III 200%/180d — confirm or override.
4. **Existing `invest.tsx` page:** keep as redirect to `/invest/portfolio`, or fully replace its content with the new flow?
