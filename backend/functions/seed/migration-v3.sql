-- ORBIT v3 Migration: Payment + AI features

-- Payment provider tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_source TEXT DEFAULT 'demo';

-- Add CHECK constraint safely
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_subscription_source_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_subscription_source_check
      CHECK (subscription_source IN ('demo', 'stripe', 'revenuecat', 'manual'));
  END IF;
END $$;

-- Subscription event log
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  plan TEXT,
  raw_event JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sub_events_user ON subscription_events (user_id, created_at DESC);

-- AI summaries (weekly/monthly)
CREATE TABLE IF NOT EXISTS ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary_type TEXT NOT NULL CHECK (summary_type IN ('weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  content JSONB NOT NULL,
  model_used TEXT DEFAULT 'mock',
  prompt_tokens INT,
  completion_tokens INT,
  latency_ms INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, summary_type, period_start)
);

-- AI pattern explanations
CREATE TABLE IF NOT EXISTS ai_pattern_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pattern_hash TEXT NOT NULL,
  emotion_id INT NOT NULL,
  context_tag TEXT,
  explanation TEXT NOT NULL,
  suggestion TEXT,
  model_used TEXT DEFAULT 'mock',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, pattern_hash)
);

-- AI experiment suggestions
CREATE TABLE IF NOT EXISTS ai_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  experiment_text TEXT NOT NULL,
  reasoning TEXT,
  model_used TEXT DEFAULT 'mock',
  prompt_tokens INT,
  completion_tokens INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, week_start)
);

-- Add columns if table already exists without them
ALTER TABLE ai_experiments ADD COLUMN IF NOT EXISTS prompt_tokens INT;
ALTER TABLE ai_experiments ADD COLUMN IF NOT EXISTS completion_tokens INT;
