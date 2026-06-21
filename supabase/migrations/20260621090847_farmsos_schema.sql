/*
# FarmSOS core schema (single-tenant)

1. Overview
   This schema backs the FarmSOS AI farming platform. It is intentionally
   single-tenant (no auth / user_id) because the product is a demo that
   anyone can open and use. All tables therefore allow anon+authenticated
   CRUD through RLS — they are shared, public demo data.

2. New Tables
   - farms             digital farm twin profiles (name, soil, water, AI scores)
   - soil_reports      uploaded soil NPK reports (per farm)
   - market_listings   seeds, fertilizers, pesticides, equipment catalog
   - community_posts   discussion / Q&A posts
   - alerts            emergency flood/heatwave/pest/advisory alerts
   - job_listings       agriculture jobs, seasonal, internships, startups
   - disease_reports   image-analysis results submitted by farmers
   - services          nearby agricultural services (KVK, labs, shops)

3. Security
   RLS enabled on every table. Policies allow anon+authenticated full CRUD
   because all data is intentionally public/shared demo data (no sign-in).

4. Notes
   - Timestamps default to now().
   - JSONB used where fields are flexible (historical yield, treatments).
   - Idempotent: IF NOT EXISTS on tables; DROP IF EXISTS + CREATE on policies.
*/

-- Farms: digital farm twin -----------------------------------------------
CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_name text NOT NULL DEFAULT 'Anonymous Farmer',
  farm_name text NOT NULL,
  location text NOT NULL DEFAULT 'Rajasthan',
  state text NOT NULL DEFAULT 'Rajasthan',
  farm_size_acres numeric NOT NULL DEFAULT 1,
  soil_type text NOT NULL DEFAULT 'Loamy',
  water_source text NOT NULL DEFAULT 'Tube Well',
  primary_crop text NOT NULL DEFAULT 'Wheat',
  historical_yield jsonb NOT NULL DEFAULT '[]'::jsonb,
  health_score int NOT NULL DEFAULT 60,
  productivity_score int NOT NULL DEFAULT 55,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "farms_read" ON farms;
CREATE POLICY "farms_read" ON farms FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "farms_insert" ON farms;
CREATE POLICY "farms_insert" ON farms FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "farms_update" ON farms;
CREATE POLICY "farms_update" ON farms FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "farms_delete" ON farms;
CREATE POLICY "farms_delete" ON farms FOR DELETE TO anon, authenticated USING (true);

-- Soil reports (per farm) -------------------------------------------------
CREATE TABLE IF NOT EXISTS soil_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid REFERENCES farms(id) ON DELETE CASCADE,
  ph numeric NOT NULL DEFAULT 7,
  nitrogen numeric NOT NULL DEFAULT 0,
  phosphorus numeric NOT NULL DEFAULT 0,
  potassium numeric NOT NULL DEFAULT 0,
  organic_carbon numeric NOT NULL DEFAULT 0,
  ec numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Moderate',
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE soil_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "soil_read" ON soil_reports;
CREATE POLICY "soil_read" ON soil_reports FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "soil_insert" ON soil_reports;
CREATE POLICY "soil_insert" ON soil_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "soil_update" ON soil_reports;
CREATE POLICY "soil_update" ON soil_reports FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "soil_delete" ON soil_reports;
CREATE POLICY "soil_delete" ON soil_reports FOR DELETE TO anon, authenticated USING (true);

-- Marketplace catalog -----------------------------------------------------
CREATE TABLE IF NOT EXISTS market_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  brand text NOT NULL,
  price numeric NOT NULL,
  unit text NOT NULL,
  rating numeric NOT NULL DEFAULT 4,
  reviews int NOT NULL DEFAULT 0,
  image text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT ''
);
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "market_read" ON market_listings;
CREATE POLICY "market_read" ON market_listings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "market_insert" ON market_listings;
CREATE POLICY "market_insert" ON market_listings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "market_update" ON market_listings;
CREATE POLICY "market_update" ON market_listings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "market_delete" ON market_listings;
CREATE POLICY "market_delete" ON market_listings FOR DELETE TO anon, authenticated USING (true);

-- Community posts ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author text NOT NULL DEFAULT 'Anonymous',
  group_name text NOT NULL DEFAULT 'Wheat Farmers',
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  replies int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "community_read" ON community_posts;
CREATE POLICY "community_read" ON community_posts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "community_insert" ON community_posts;
CREATE POLICY "community_insert" ON community_posts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "community_update" ON community_posts;
CREATE POLICY "community_update" ON community_posts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "community_delete" ON community_posts;
CREATE POLICY "community_delete" ON community_posts FOR DELETE TO anon, authenticated USING (true);

-- Alerts ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  severity text NOT NULL DEFAULT 'Low',
  region text NOT NULL DEFAULT 'Rajasthan',
  published_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "alerts_read" ON alerts;
CREATE POLICY "alerts_read" ON alerts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "alerts_insert" ON alerts;
CREATE POLICY "alerts_insert" ON alerts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "alerts_update" ON alerts;
CREATE POLICY "alerts_update" ON alerts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "alerts_delete" ON alerts;
CREATE POLICY "alerts_delete" ON alerts FOR DELETE TO anon, authenticated USING (true);

-- Jobs --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS job_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL,
  location text NOT NULL,
  salary text NOT NULL,
  posted text NOT NULL DEFAULT 'recently'
);
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "jobs_read" ON job_listings;
CREATE POLICY "jobs_read" ON job_listings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "jobs_insert" ON job_listings;
CREATE POLICY "jobs_insert" ON job_listings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "jobs_update" ON job_listings;
CREATE POLICY "jobs_update" ON job_listings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "jobs_delete" ON job_listings;
CREATE POLICY "jobs_delete" ON job_listings FOR DELETE TO anon, authenticated USING (true);

-- Disease/image-analysis reports -----------------------------------------
CREATE TABLE IF NOT EXISTS disease_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop text NOT NULL DEFAULT '',
  disease text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'Disease',
  confidence numeric NOT NULL DEFAULT 0,
  stage text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'Low',
  treatments jsonb NOT NULL DEFAULT '[]'::jsonb,
  submitted_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE disease_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "disease_read" ON disease_reports;
CREATE POLICY "disease_read" ON disease_reports FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "disease_insert" ON disease_reports;
CREATE POLICY "disease_insert" ON disease_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "disease_delete" ON disease_reports;
CREATE POLICY "disease_delete" ON disease_reports FOR DELETE TO anon, authenticated USING (true);

-- Nearby services ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  lat numeric NOT NULL DEFAULT 25.21,
  lng numeric NOT NULL DEFAULT 75.86,
  distance_km numeric NOT NULL DEFAULT 0
);
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "services_read" ON services;
CREATE POLICY "services_read" ON services FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "services_insert" ON services;
CREATE POLICY "services_insert" ON services FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "services_update" ON services;
CREATE POLICY "services_update" ON services FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "services_delete" ON services;
CREATE POLICY "services_delete" ON services FOR DELETE TO anon, authenticated USING (true);

-- Indexes for common queries ---------------------------------------------
CREATE INDEX IF NOT EXISTS idx_soil_reports_farm ON soil_reports(farm_id);
CREATE INDEX IF NOT EXISTS idx_disease_reports_crop ON disease_reports(crop);
CREATE INDEX IF NOT EXISTS idx_community_posts_group ON community_posts(group_name);
