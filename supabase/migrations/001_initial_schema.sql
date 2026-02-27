-- Emotion Catalog (reference table)
CREATE TABLE emotion_catalog (
  id SERIAL PRIMARY KEY,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('positive', 'negative', 'neutral')),
  color_hex TEXT NOT NULL,
  icon_key TEXT
);

INSERT INTO emotion_catalog (name_ko, name_en, category, color_hex) VALUES
  ('긴장', 'tension', 'negative', '#FFB84D'),
  ('불안', 'anxiety', 'negative', '#FF6B6B'),
  ('피로', 'fatigue', 'negative', '#7B8794'),
  ('안정', 'calm', 'positive', '#5CE0D8'),
  ('설렘', 'excitement', 'positive', '#FF8FAB'),
  ('무기력', 'lethargy', 'negative', '#6B7280'),
  ('집중', 'focus', 'positive', '#4A9EFF'),
  ('만족', 'satisfaction', 'positive', '#7FE5A0'),
  ('외로움', 'loneliness', 'negative', '#A78BFA'),
  ('혼란', 'confusion', 'negative', '#F59E0B');

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  auth_provider TEXT DEFAULT 'email' CHECK (auth_provider IN ('email', 'kakao', 'google', 'apple')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  subscription_expires_at TIMESTAMPTZ,
  timezone TEXT DEFAULT 'Asia/Seoul',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Emotion Entries
CREATE TABLE emotion_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emotion_ids INT[] NOT NULL,
  intensity SMALLINT NOT NULL CHECK (intensity BETWEEN 1 AND 5),
  context_tag TEXT,
  note TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_entries_user_date ON emotion_entries (user_id, recorded_at DESC);
CREATE INDEX idx_entries_pattern ON emotion_entries (user_id, emotion_ids, context_tag, recorded_at);

-- AI Mirror Responses
CREATE TABLE ai_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES emotion_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  understanding TEXT NOT NULL,
  structure TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  question TEXT,
  model_used TEXT DEFAULT 'gpt-4o-mini',
  prompt_tokens INT,
  completion_tokens INT,
  latency_ms INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Aggregates
CREATE TABLE user_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  avg_intensity NUMERIC(3,2),
  top_emotions JSONB,
  stability_index NUMERIC(5,2),
  entry_count INT DEFAULT 0,
  context_distribution JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, period_type, period_start)
);

-- Detected Patterns
CREATE TABLE detected_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emotion_id INT NOT NULL,
  context_tag TEXT,
  occurrence_count INT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Push Tokens
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE emotion_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own entries" ON emotion_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own AI responses" ON ai_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own aggregates" ON user_aggregates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own patterns" ON detected_patterns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own push tokens" ON push_tokens
  FOR ALL USING (auth.uid() = user_id);
