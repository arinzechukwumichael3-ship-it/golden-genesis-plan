-- Site settings table for configurable values
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies: anyone can read, only admins can write
CREATE POLICY "site_settings public read" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "site_settings admin write" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed initial settings
INSERT INTO public.site_settings (key, value, description) VALUES
  ('whatsapp_number', '9122646692', 'WhatsApp support number (without + prefix)'),
  ('whatsapp_message', 'Hello YieldEmpire Support, I need help with my account.', 'Default WhatsApp message')
ON CONFLICT (key) DO NOTHING;

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;