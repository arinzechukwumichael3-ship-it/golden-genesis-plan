-- Plans: add max_amount + duration_days; mark existing inactive; seed 7 new tiers
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS max_amount numeric(20,2),
  ADD COLUMN IF NOT EXISTS duration_days integer NOT NULL DEFAULT 30;

UPDATE public.plans SET active = false WHERE slug NOT IN
  ('basic-deluxe','promo-package','elite-deluxe','pro-deluxe','contract-i','contract-ii','contract-iii');

INSERT INTO public.plans (name, slug, min_amount, max_amount, roi_percent, duration_days, sort_order, active) VALUES
  ('Basic Deluxe',  'basic-deluxe',  50,     999,           15,  30,  1, true),
  ('Promo Package', 'promo-package', 200,    10000,         25,  45,  2, true),
  ('Elite Deluxe',  'elite-deluxe',  1000,   4999,          35,  60,  3, true),
  ('Pro Deluxe',    'pro-deluxe',    5000,   29999,         50,  90,  4, true),
  ('Contract I',    'contract-i',    30000,  45999,         80,  120, 5, true),
  ('Contract II',   'contract-ii',   46000,  78999,         120, 150, 6, true),
  ('Contract III',  'contract-iii',  79000,  9999999999.99, 200, 180, 7, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  min_amount = EXCLUDED.min_amount,
  max_amount = EXCLUDED.max_amount,
  roi_percent = EXCLUDED.roi_percent,
  duration_days = EXCLUDED.duration_days,
  sort_order = EXCLUDED.sort_order,
  active = true;

-- Investments: new fields
ALTER TABLE public.investments
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS wallet_address_used text,
  ADD COLUMN IF NOT EXISTS tx_hash text,
  ADD COLUMN IF NOT EXISTS proof_url text,
  ADD COLUMN IF NOT EXISTS maturity_date timestamptz;

DROP POLICY IF EXISTS "investments own insert" ON public.investments;
CREATE POLICY "investments own insert" ON public.investments
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "investments own update" ON public.investments;
CREATE POLICY "investments own update" ON public.investments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "investments admin update" ON public.investments;
CREATE POLICY "investments admin update" ON public.investments
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE ON public.investments TO authenticated;
GRANT ALL ON public.investments TO service_role;

-- crypto_wallets
CREATE TABLE IF NOT EXISTS public.crypto_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coin_name text NOT NULL,
  symbol text NOT NULL,
  network text NOT NULL,
  wallet_address text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (symbol, network)
);

GRANT SELECT ON public.crypto_wallets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.crypto_wallets TO authenticated;
GRANT ALL ON public.crypto_wallets TO service_role;

ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crypto_wallets public read" ON public.crypto_wallets
  FOR SELECT USING (true);
CREATE POLICY "crypto_wallets admin write" ON public.crypto_wallets
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.crypto_wallets (coin_name, symbol, network, wallet_address, sort_order) VALUES
  ('Bitcoin',  'BTC',  'Bitcoin', '', 1),
  ('Ethereum', 'ETH',  'ERC20',   '', 2),
  ('Tether',   'USDT', 'TRC20',   '', 3),
  ('Tether',   'USDT', 'ERC20',   '', 4),
  ('Tether',   'USDT', 'BEP20',   '', 5),
  ('Tron',     'TRX',  'TRC20',   '', 6)
ON CONFLICT (symbol, network) DO NOTHING;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS crypto_wallets_touch ON public.crypto_wallets;
CREATE TRIGGER crypto_wallets_touch BEFORE UPDATE ON public.crypto_wallets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- earnings_log
CREATE TABLE IF NOT EXISTS public.earnings_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id uuid REFERENCES public.investments(id) ON DELETE CASCADE,
  amount numeric(20,2) NOT NULL,
  type text NOT NULL DEFAULT 'credited',
  credited_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.earnings_log TO authenticated;
GRANT ALL ON public.earnings_log TO service_role;

ALTER TABLE public.earnings_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "earnings_log own select" ON public.earnings_log
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "earnings_log admin write" ON public.earnings_log
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS earnings_log_user_idx ON public.earnings_log(user_id, credited_at DESC);

-- create_pending_investment RPC
CREATE OR REPLACE FUNCTION public.create_pending_investment(
  _plan_id uuid,
  _amount numeric,
  _payment_method text,
  _wallet_address text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  uid uuid := auth.uid();
  pl public.plans%ROWTYPE;
  exp_return numeric;
  new_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO pl FROM public.plans WHERE id = _plan_id AND active;
  IF NOT FOUND THEN RAISE EXCEPTION 'Plan not found'; END IF;
  IF _amount < pl.min_amount THEN RAISE EXCEPTION 'Amount below plan minimum'; END IF;
  IF pl.max_amount IS NOT NULL AND _amount > pl.max_amount THEN RAISE EXCEPTION 'Amount above plan maximum'; END IF;

  exp_return := round(_amount * (1 + pl.roi_percent / 100.0), 2);

  INSERT INTO public.investments (
    user_id, plan_id, amount, duration_days, roi_percent_snapshot,
    expected_return, end_at, status, payment_method, wallet_address_used, maturity_date
  ) VALUES (
    uid, _plan_id, _amount, pl.duration_days, pl.roi_percent,
    exp_return, now() + (pl.duration_days || ' days')::interval, 'pending'::investment_status,
    _payment_method, _wallet_address,
    now() + (pl.duration_days || ' days')::interval
  ) RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;