-- ============================================================
-- 10TOES HQ — Full Database Setup
-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)
-- ============================================================

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BEATS
CREATE TABLE IF NOT EXISTS beats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  genre TEXT,
  style TEXT,
  tier TEXT CHECK (tier IN ('1','2','3','4')),
  mood TEXT,
  era TEXT,
  instrument TEXT,
  bpm INTEGER,
  license TEXT,
  yt_title TEXT,
  yt_url TEXT,
  suno_prompt TEXT,
  notes TEXT,
  on_yt BOOLEAN DEFAULT FALSE,
  on_bs BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUNO PROMPTS
CREATE TABLE IF NOT EXISTS suno_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  genre TEXT,
  style TEXT,
  mood TEXT,
  prompt TEXT NOT NULL,
  times_used INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LIKES
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  beat_id UUID REFERENCES beats(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, beat_id)
);

-- COMMENTS
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  beat_id UUID REFERENCES beats(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE suno_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current user has active subscription
CREATE OR REPLACE FUNCTION is_subscriber()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND subscription_status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES
CREATE POLICY "profiles_read" ON profiles FOR SELECT USING (is_subscriber() OR auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- BEATS
CREATE POLICY "beats_read" ON beats FOR SELECT
  USING ((is_public = true AND is_subscriber()) OR auth.uid() = user_id);
CREATE POLICY "beats_insert" ON beats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "beats_update" ON beats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "beats_delete" ON beats FOR DELETE USING (auth.uid() = user_id);

-- SUNO PROMPTS
CREATE POLICY "prompts_read" ON suno_prompts FOR SELECT
  USING ((is_public = true AND is_subscriber()) OR auth.uid() = user_id);
CREATE POLICY "prompts_insert" ON suno_prompts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prompts_update" ON suno_prompts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "prompts_delete" ON suno_prompts FOR DELETE USING (auth.uid() = user_id);

-- LIKES
CREATE POLICY "likes_read" ON likes FOR SELECT USING (is_subscriber());
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON likes FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS
CREATE POLICY "comments_read" ON comments FOR SELECT USING (is_subscriber());
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- SERVICE ROLE BYPASS (for webhook)
-- The service role key bypasses RLS automatically — no extra config needed.
-- ============================================================

-- OPTIONAL: Create your founder "10Toes" account as admin
-- Run AFTER you sign up with your email:
-- UPDATE profiles SET is_admin = TRUE WHERE username = '10toes';
-- UPDATE profiles SET subscription_status = 'active' WHERE username = '10toes';
