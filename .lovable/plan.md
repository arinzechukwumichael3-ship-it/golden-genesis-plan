
# YieldEmpireCapital — Crypto Investment Platform

A dark, gold-accented investment platform with public marketing pages, user dashboard, deposit/withdrawal flows, referrals, and an admin panel. Built on the existing TanStack Start template with Lovable Cloud (Supabase) for auth, database, storage, and server logic.

## Pages & Routes

Public:
- `/` — Home: ticker bar, hero with autoplay looping muted background video + headline + Get Started CTA, How It Works (3 steps), Plans overview, Why Choose Us, Testimonials, Footer
- `/about` — Mission, team grid, security/trust badges
- `/plans` — 3 plan cards (Basic, Pro, VIP) with duration selector (30/60/90/180/365) and dynamic estimated return
- `/auth` — Login + Register tabs (email/password, referral code field on register, sign-in-with-google supported)

Authenticated (`/_authenticated/*`):
- `/dashboard` — Balance, active investments (countdown + expected return), total earned, deposit/withdraw buttons, referral link & stats
- `/invest` — Choose plan + amount + duration, confirms against active balance
- `/deposit` — Select BTC/ETH/USDT/BNB, amount, shows wallet address + QR code, upload payment-proof screenshot
- `/withdraw` — Enter wallet address + amount, status (pending/approved/rejected)
- `/referrals` — Unique link, total referrals, bonus earned, referred-user list

Admin (`/_authenticated/admin/*`, gated by `has_role(admin)`):
- `/admin` — overview
- `/admin/users` — list, view balances
- `/admin/deposits` — approve/reject (on approve, credit balance)
- `/admin/withdrawals` — approve/reject (on approve, debit + mark paid)
- `/admin/plans` — edit ROI %, min amount
- `/admin/wallets` — edit wallet addresses per coin
- `/admin/referrals` — view referral activity
- `/admin/notifications` — broadcast notifications

Global UI: fixed top scrolling ticker (fake BTC/ETH/BNB/USDT prices animated), floating "Invest Now" button on mobile when signed-in.

## Design

- Background `#0a0a0a`, surfaces `#111`, gold accent `#f0b429`, white text, muted `#a1a1aa`
- Display font: Space Grotesk; body: Inter (loaded via `<link>` in `__root.tsx`)
- Subtle radial/linear gold gradients on hero, card shadows with gold glow
- Framer-motion: hero text fade-up, plan card hover lift, ticker marquee (CSS keyframes), section reveal on scroll
- Fully responsive; mobile bottom-floating CTA

## Backend (Lovable Cloud)

Enable Cloud first. Migrations:

Enums: `app_role ('admin','user')`, `coin ('BTC','ETH','USDT','BNB')`, `tx_status ('pending','approved','rejected')`, `investment_status ('active','completed','cancelled')`.

Tables (all in `public`, with proper GRANTs + RLS):
- `profiles` (id PK→auth.users, email, full_name, referral_code unique, referred_by uuid→profiles, balance numeric default 0, total_earned numeric default 0, created_at)
- `user_roles` (id, user_id, role app_role, unique(user_id, role)) — separate from profiles
- `plans` (id, name, min_amount, roi_percent, sort_order, active) — seeded Basic/Pro/VIP
- `wallets` (coin PK, address text, qr_url text) — admin editable
- `deposits` (id, user_id, coin, amount, proof_url, status, created_at, reviewed_at, reviewed_by)
- `withdrawals` (id, user_id, coin, amount, wallet_address, status, created_at, reviewed_at, reviewed_by)
- `investments` (id, user_id, plan_id, amount, duration_days, roi_percent_snapshot, expected_return, start_at, end_at, status)
- `referrals` (id, referrer_id, referred_id unique, bonus_paid bool, bonus_amount numeric, created_at)
- `notifications` (id, user_id nullable for broadcast, title, body, read, created_at)

Triggers/functions (SECURITY DEFINER, `set search_path = public`):
- `handle_new_user()` on `auth.users` insert → creates profile, generates unique referral_code, links `referred_by` from raw_user_meta_data.ref, inserts `referrals` row
- `has_role(_user_id, _role)` for RLS
- `approve_deposit(deposit_id)` admin RPC: marks approved, credits balance, on user's first approved deposit pays 5% referral bonus to referrer (updates referrer balance + total_earned, marks referrals.bonus_paid)
- `approve_withdrawal(id)` / `reject_*` admin RPCs
- `create_investment(plan_id, amount, duration_days)` user RPC: validates min, debits balance, creates row with computed expected_return = amount * roi_percent * duration_days/365 (or simple flat ROI for plan duration — final formula documented in code), sets start_at/end_at
- `complete_due_investments()` callable from cron later (out of scope to schedule, but function exists)

RLS:
- profiles: user reads/updates own; admin reads all
- user_roles: user reads own; admin manages
- plans/wallets: anon+authenticated SELECT; admin write
- deposits/withdrawals/investments/referrals/notifications: user reads own rows; admin reads all; writes via RPCs

Seeded admin: insert into `auth.users` is not possible via migration. Instead, seed `wallets`, `plans`, and create a trigger/insert so that any user with email `admin@yieldempire.local` automatically gets the admin role. The migration also inserts a `user_roles` row for that email if it later signs up (using `handle_new_user`). **Default admin credentials to share with user: email `admin@yieldempire.local`, password `Admin#2026!` — user signs up with that email once and gets admin automatically.** (Documented in README.)

Storage: bucket `payment-proofs` (private), RLS: user uploads to `userId/...`, admin reads all.

## Server Functions (`createServerFn`, auth-protected via `requireSupabaseAuth`)

In `src/lib/`:
- `plans.functions.ts` — `listPlans` (public)
- `wallets.functions.ts` — `listWallets` (public)
- `investments.functions.ts` — `createInvestment`, `listMyInvestments`
- `deposits.functions.ts` — `createDeposit`, `listMyDeposits`
- `withdrawals.functions.ts` — `createWithdrawal`, `listMyWithdrawals`
- `referrals.functions.ts` — `myReferralStats`
- `dashboard.functions.ts` — `getDashboardSummary`
- `admin.functions.ts` — list/approve/reject for deposits, withdrawals; update plan, update wallet, broadcast notification (all gated by `has_role admin` check)

## Hero Video

Use a free Coverr/Pexels crypto/abstract loop. Upload via `lovable-assets create --file /tmp/hero.mp4` and reference the CDN URL. Fallback poster image.

## Ticker

Client component fetching `https://api.coingecko.com/api/v3/simple/price` for BTC/ETH/BNB/USDT with 30s refresh; falls back to static values if request fails. Horizontal marquee via CSS keyframes.

## Out of scope (will note to user)

- Real on-chain payment verification (admin manually approves screenshot)
- Scheduled job to auto-complete matured investments (function exists; user can wire pg_cron later)
- Email notifications

## Build order

1. Enable Lovable Cloud
2. Migration: enums, tables, GRANTs, RLS, functions, seeds (plans, wallets, admin-on-signup)
3. Storage bucket + policies
4. Layout: ticker, header, footer, floating CTA, theme tokens in `src/styles.css`, font links in `__root.tsx`
5. Public pages (Home, About, Plans, Auth) + hero video asset
6. `_authenticated` layout already managed by integration; build Dashboard, Invest, Deposit, Withdraw, Referrals
7. Admin pages + server fns
8. Polish animations, responsive QA

I'll share the admin login + the public referral signup link after the first build.
