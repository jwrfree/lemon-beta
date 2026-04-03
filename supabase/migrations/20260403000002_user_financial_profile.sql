CREATE TABLE IF NOT EXISTS public.user_financial_profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  spending_patterns JSONB DEFAULT '{}'::jsonb,
  coaching_notes TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_financial_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own their profile" ON public.user_financial_profile;
CREATE POLICY "Users own their profile"
  ON public.user_financial_profile
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
