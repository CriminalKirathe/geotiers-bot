-- ============================================================================
-- GEOTIERS - PRO-GRADE SUPABASE DATABASE SETUP
-- ============================================================================
-- Version: 2.0
-- Description: Complete schema with automatic points and title calculation.
-- ============================================================================

-- ============================================================================
-- SECTION 1: TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Players Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT 'Rookie',
  total_points INTEGER DEFAULT 0,
  region TEXT NOT NULL DEFAULT 'NA',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Player Tiers Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.player_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  game_mode TEXT NOT NULL,
  tier TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, game_mode)
);

-- ----------------------------------------------------------------------------
-- Admin Accounts Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  game_modes TEXT[] NOT NULL DEFAULT '{}',
  is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete_players BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 2: INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_players_username ON public.players(username);
CREATE INDEX IF NOT EXISTS idx_players_total_points ON public.players(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_player_tiers_player_id ON public.player_tiers(player_id);
CREATE INDEX IF NOT EXISTS idx_player_tiers_game_mode ON public.player_tiers(game_mode);

-- ============================================================================
-- SECTION 3: RLS & SECURITY
-- ============================================================================

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public to read players" ON public.players;
DROP POLICY IF EXISTS "Allow authenticated to insert players" ON public.players;
DROP POLICY IF EXISTS "Allow authenticated to update players" ON public.players;
DROP POLICY IF EXISTS "Allow authenticated to delete players" ON public.players;
DROP POLICY IF EXISTS "Allow public to read player tiers" ON public.player_tiers;
DROP POLICY IF EXISTS "Allow authenticated to insert player tiers" ON public.player_tiers;
DROP POLICY IF EXISTS "Allow authenticated to update player tiers" ON public.player_tiers;
DROP POLICY IF EXISTS "Allow authenticated to delete player tiers" ON public.player_tiers;
DROP POLICY IF EXISTS "service role access only" ON public.admin_accounts;

-- Policies
CREATE POLICY "Allow public to read players" ON public.players FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated to insert players" ON public.players FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated to update players" ON public.players FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated to delete players" ON public.players FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow public to read player tiers" ON public.player_tiers FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated to insert player tiers" ON public.player_tiers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated to update player tiers" ON public.player_tiers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated to delete player tiers" ON public.player_tiers FOR DELETE TO authenticated USING (true);

CREATE POLICY "service role access only" ON public.admin_accounts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- SECTION 4: POINT & TITLE LOGIC (FUNCTIONS)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function: Get Points for Tier
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_tier_points(tier_name TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE
    WHEN tier_name IN ('HT1', 'RHT1') THEN 60
    WHEN tier_name IN ('LT1', 'RLT1') THEN 45
    WHEN tier_name IN ('HT2', 'RHT2') THEN 30
    WHEN tier_name IN ('LT2', 'RLT2') THEN 20
    WHEN tier_name = 'HT3' THEN 10
    WHEN tier_name = 'LT3' THEN 6
    WHEN tier_name = 'HT4' THEN 4
    WHEN tier_name = 'LT4' THEN 3
    WHEN tier_name = 'HT5' THEN 2
    WHEN tier_name = 'LT5' THEN 1
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ----------------------------------------------------------------------------
-- Function: Get Title for Points
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_title_from_points(points INTEGER)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN points >= 400 THEN 'Combat Paragon'
    WHEN points >= 200 THEN 'Combat Dominator'
    WHEN points >= 100 THEN 'Combat Elite'
    WHEN points >= 50  THEN 'Combat Vanguard'
    WHEN points >= 25  THEN 'Combat Operative'
    WHEN points >= 10  THEN 'Combat Initiate'
    ELSE 'Rookie'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- SECTION 5: TRIGGERS & AUTOMATION
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Trigger Function: Update Points on Tier Change
-- ----------------------------------------------------------------------------
-- Automatically assigns points based on the tier name whenever a tier is saved
CREATE OR REPLACE FUNCTION public.handle_tier_points_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.points = public.get_tier_points(NEW.tier);
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_handle_tier_points ON public.player_tiers;
CREATE TRIGGER trigger_handle_tier_points
  BEFORE INSERT OR UPDATE ON public.player_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_tier_points_update();

-- ----------------------------------------------------------------------------
-- Trigger Function: Sync Player Total Points and Title
-- ----------------------------------------------------------------------------
-- Runs after any change to the player_tiers table
CREATE OR REPLACE FUNCTION public.sync_player_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_player_id UUID;
  new_total_points INTEGER;
  new_title TEXT;
BEGIN
  target_player_id = COALESCE(NEW.player_id, OLD.player_id);

  -- 1. Calculate new sum
  SELECT COALESCE(SUM(points), 0) INTO new_total_points
  FROM public.player_tiers
  WHERE player_id = target_player_id;

  -- 2. Determine new title
  new_title = public.get_title_from_points(new_total_points);

  -- 3. Update the player record
  UPDATE public.players
  SET 
    total_points = new_total_points,
    title = new_title,
    updated_at = NOW()
  WHERE id = target_player_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_player_stats ON public.player_tiers;
CREATE TRIGGER trigger_sync_player_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.player_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_player_stats();

-- Generic updated_at trigger for other tables
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_players_updated_at ON public.players;
CREATE TRIGGER trigger_players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_admin_accounts_updated_at ON public.admin_accounts;
CREATE TRIGGER trigger_admin_accounts_updated_at BEFORE UPDATE ON public.admin_accounts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- SECTION 6: INITIAL DATA (SEEDING)
-- ============================================================================

-- Uncomment if you want to clear tables before seeding
-- TRUNCATE public.players CASCADE;

-- Add a super admin (Change this email to your account)
INSERT INTO public.admin_accounts (email, is_super_admin, can_delete_players)
VALUES ('shakauashvili@gmail.com', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- Seed some players
DO $$
DECLARE
  p1_id UUID;
  p2_id UUID;
  p3_id UUID;
BEGIN
  -- Insert Players
  INSERT INTO public.players (username, region) VALUES ('Kirathe', 'EU') RETURNING id INTO p1_id;
  INSERT INTO public.players (username, region) VALUES ('Antigravity', 'AS') RETURNING id INTO p2_id;
  INSERT INTO public.players (username, region) VALUES ('Tester', 'NA') RETURNING id INTO p3_id;

  -- Insert Tiers (Triggers will automatically handle points, total_points, and titles!)
  INSERT INTO public.player_tiers (player_id, game_mode, tier) VALUES (p1_id, 'vanilla', 'HT1');
  INSERT INTO public.player_tiers (player_id, game_mode, tier) VALUES (p1_id, 'pot', 'HT1');
  INSERT INTO public.player_tiers (player_id, game_mode, tier) VALUES (p1_id, 'uhc', 'LT1');

  INSERT INTO public.player_tiers (player_id, game_mode, tier) VALUES (p2_id, 'vanilla', 'HT2');
  INSERT INTO public.player_tiers (player_id, game_mode, tier) VALUES (p2_id, 'mace', 'HT1');

  INSERT INTO public.player_tiers (player_id, game_mode, tier) VALUES (p3_id, 'vanilla', 'LT5');
END $$;

-- ============================================================================
-- SECTION 7: VIEWS FOR EASIER FRONTEND ACCESS
-- ============================================================================

CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  p.*,
  RANK() OVER (ORDER BY p.total_points DESC) as rank
FROM public.players p;

GRANT SELECT ON public.leaderboard TO public;

-- ============================================================================
-- FINAL STATUS
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'GEOTIERS v2.0 Setup Complete!';
  RAISE NOTICE 'Points and Titles are now AUTOMATICALLY calculated via database triggers.';
END $$;
