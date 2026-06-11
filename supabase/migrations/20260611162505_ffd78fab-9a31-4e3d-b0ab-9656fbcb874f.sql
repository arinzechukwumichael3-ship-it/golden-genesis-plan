
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TYPE public.coin AS ENUM ('BTC','ETH','USDT','BNB');
CREATE TYPE public.tx_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.investment_status AS ENUM ('active','completed','cancelled');

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  balance NUMERIC(20,2) NOT NULL DEFAULT 0,
  total_earned NUMERIC(20,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- profiles policies
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- user_roles policies
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- plans
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  min_amount NUMERIC(20,2) NOT NULL,
  roi_percent NUMERIC(6,2) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true
);
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans public read" ON public.plans FOR SELECT USING (true);
CREATE POLICY "plans admin write" ON public.plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- wallets
CREATE TABLE public.wallets (
  coin public.coin PRIMARY KEY,
  address TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallets TO anon, authenticated;
GRANT ALL ON public.wallets TO service_role;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallets public read" ON public.wallets FOR SELECT USING (true);
CREATE POLICY "wallets admin write" ON public.wallets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- deposits
CREATE TABLE public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin public.coin NOT NULL,
  amount NUMERIC(20,2) NOT NULL CHECK (amount > 0),
  proof_url TEXT,
  status public.tx_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);
GRANT SELECT, INSERT ON public.deposits TO authenticated;
GRANT ALL ON public.deposits TO service_role;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deposits own select" ON public.deposits FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "deposits own insert" ON public.deposits FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- withdrawals
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin public.coin NOT NULL,
  amount NUMERIC(20,2) NOT NULL CHECK (amount > 0),
  wallet_address TEXT NOT NULL,
  status public.tx_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);
GRANT SELECT, INSERT ON public.withdrawals TO authenticated;
GRANT ALL ON public.withdrawals TO service_role;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "withdrawals own select" ON public.withdrawals FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "withdrawals own insert" ON public.withdrawals FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- investments
CREATE TABLE public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  amount NUMERIC(20,2) NOT NULL CHECK (amount > 0),
  duration_days INT NOT NULL,
  roi_percent_snapshot NUMERIC(6,2) NOT NULL,
  expected_return NUMERIC(20,2) NOT NULL,
  start_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_at TIMESTAMPTZ NOT NULL,
  status public.investment_status NOT NULL DEFAULT 'active'
);
GRANT SELECT ON public.investments TO authenticated;
GRANT ALL ON public.investments TO service_role;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "investments own select" ON public.investments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- referrals
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  bonus_paid BOOLEAN NOT NULL DEFAULT false,
  bonus_amount NUMERIC(20,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrals own select" ON public.referrals FOR SELECT TO authenticated
  USING (referrer_id = auth.uid() OR referred_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif own or broadcast" ON public.notifications FOR SELECT TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "notif own update" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ref_code TEXT;
  referrer_profile_id UUID;
  ref_input TEXT;
BEGIN
  -- unique referral code
  LOOP
    ref_code := upper(substr(md5(random()::text || NEW.id::text), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = ref_code);
  END LOOP;

  ref_input := NEW.raw_user_meta_data->>'ref';
  IF ref_input IS NOT NULL AND length(ref_input) > 0 THEN
    SELECT id INTO referrer_profile_id FROM public.profiles WHERE referral_code = upper(ref_input);
  END IF;

  INSERT INTO public.profiles (id, email, full_name, referral_code, referred_by)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', ref_code, referrer_profile_id);

  IF referrer_profile_id IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_id) VALUES (referrer_profile_id, NEW.id)
    ON CONFLICT DO NOTHING;
  END IF;

  -- default role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;

  -- auto-admin for seed email
  IF NEW.email = 'admin@yieldempire.local' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- create investment RPC
CREATE OR REPLACE FUNCTION public.create_investment(_plan_id UUID, _amount NUMERIC, _duration_days INT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  pl public.plans%ROWTYPE;
  bal NUMERIC;
  exp_return NUMERIC;
  new_id UUID;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _duration_days NOT IN (30,60,90,180,365) THEN RAISE EXCEPTION 'Invalid duration'; END IF;
  SELECT * INTO pl FROM public.plans WHERE id = _plan_id AND active;
  IF NOT FOUND THEN RAISE EXCEPTION 'Plan not found'; END IF;
  IF _amount < pl.min_amount THEN RAISE EXCEPTION 'Amount below plan minimum'; END IF;
  SELECT balance INTO bal FROM public.profiles WHERE id = uid FOR UPDATE;
  IF bal < _amount THEN RAISE EXCEPTION 'Insufficient balance'; END IF;

  exp_return := round(_amount * pl.roi_percent / 100.0 * _duration_days / 30.0, 2);

  UPDATE public.profiles SET balance = balance - _amount WHERE id = uid;

  INSERT INTO public.investments (user_id, plan_id, amount, duration_days, roi_percent_snapshot, expected_return, end_at)
  VALUES (uid, _plan_id, _amount, _duration_days, pl.roi_percent, exp_return, now() + (_duration_days || ' days')::interval)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- approve deposit RPC
CREATE OR REPLACE FUNCTION public.approve_deposit(_deposit_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  dep public.deposits%ROWTYPE;
  is_first BOOLEAN;
  ref_row public.referrals%ROWTYPE;
  bonus NUMERIC;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT * INTO dep FROM public.deposits WHERE id = _deposit_id FOR UPDATE;
  IF NOT FOUND OR dep.status <> 'pending' THEN RAISE EXCEPTION 'Invalid deposit'; END IF;

  UPDATE public.deposits SET status='approved', reviewed_at=now(), reviewed_by=auth.uid() WHERE id=_deposit_id;
  UPDATE public.profiles SET balance = balance + dep.amount WHERE id = dep.user_id;

  -- referral bonus on user's first approved deposit
  SELECT NOT EXISTS (
    SELECT 1 FROM public.deposits WHERE user_id = dep.user_id AND status='approved' AND id <> _deposit_id
  ) INTO is_first;

  IF is_first THEN
    SELECT * INTO ref_row FROM public.referrals WHERE referred_id = dep.user_id AND bonus_paid = false;
    IF FOUND THEN
      bonus := round(dep.amount * 0.05, 2);
      UPDATE public.profiles SET balance = balance + bonus, total_earned = total_earned + bonus WHERE id = ref_row.referrer_id;
      UPDATE public.referrals SET bonus_paid = true, bonus_amount = bonus WHERE id = ref_row.id;
      INSERT INTO public.notifications (user_id, title, body) VALUES (ref_row.referrer_id, 'Referral bonus credited', 'You earned $' || bonus || ' from your referral.');
    END IF;
  END IF;

  INSERT INTO public.notifications (user_id, title, body) VALUES (dep.user_id, 'Deposit approved', 'Your deposit of $' || dep.amount || ' has been credited.');
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_deposit(_deposit_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  UPDATE public.deposits SET status='rejected', reviewed_at=now(), reviewed_by=auth.uid()
    WHERE id=_deposit_id AND status='pending';
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_withdrawal(_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE w public.withdrawals%ROWTYPE; bal NUMERIC;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT * INTO w FROM public.withdrawals WHERE id=_id FOR UPDATE;
  IF NOT FOUND OR w.status <> 'pending' THEN RAISE EXCEPTION 'Invalid withdrawal'; END IF;
  SELECT balance INTO bal FROM public.profiles WHERE id = w.user_id FOR UPDATE;
  IF bal < w.amount THEN RAISE EXCEPTION 'Insufficient user balance'; END IF;
  UPDATE public.profiles SET balance = balance - w.amount WHERE id = w.user_id;
  UPDATE public.withdrawals SET status='approved', reviewed_at=now(), reviewed_by=auth.uid() WHERE id=_id;
  INSERT INTO public.notifications (user_id, title, body) VALUES (w.user_id, 'Withdrawal approved', 'Your withdrawal of $' || w.amount || ' has been processed.');
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_withdrawal(_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  UPDATE public.withdrawals SET status='rejected', reviewed_at=now(), reviewed_by=auth.uid()
    WHERE id=_id AND status='pending';
END;
$$;

-- Seed plans
INSERT INTO public.plans (name, slug, min_amount, roi_percent, sort_order) VALUES
  ('Basic', 'basic', 100, 8, 1),
  ('Pro', 'pro', 1000, 15, 2),
  ('VIP', 'vip', 10000, 25, 3);

-- Seed wallets (placeholders, admin-editable)
INSERT INTO public.wallets (coin, address) VALUES
  ('BTC', 'bc1qexampleplaceholderbtcaddress0000000000'),
  ('ETH', '0xExamplePlaceholderEthAddress0000000000000'),
  ('USDT', 'TExamplePlaceholderUsdtTrc20Address000000'),
  ('BNB', 'bnb1exampleplaceholderbnbaddress0000000000');
