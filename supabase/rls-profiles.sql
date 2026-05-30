-- Run in Supabase SQL Editor if score/leaderboard fail after refresh (403 / empty).

-- Read any profile (leaderboard + public scores)
CREATE POLICY "Public read profiles"
ON profiles FOR SELECT
USING (true);

-- Insert own profile on first login
CREATE POLICY "Users insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Update own profile (score sync)
CREATE POLICY "Users update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Read words for all players
CREATE POLICY "Public read words"
ON words FOR SELECT
USING (true);
