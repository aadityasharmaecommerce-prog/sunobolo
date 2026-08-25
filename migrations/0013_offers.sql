-- SunoBolo English — Offers & Discounts System
-- Migration 0013: Creates offers table, adds offer columns to payments and subscriptions

-- ══════════════════════════════════════════
-- 1. OFFERS TABLE
-- ══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  plan_id TEXT NOT NULL CHECK (plan_id IN ('three_month', 'six_month', 'one_year')),
  mrp INTEGER NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  sale_price INTEGER NOT NULL,
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'expired', 'disabled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_offers_plan ON offers(plan_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_dates ON offers(start_at, end_at);

-- ══════════════════════════════════════════
-- 2. PAYMENTS — Add offer snapshot columns
-- ══════════════════════════════════════════
-- SAFETY: ALTER TABLE will fail if column already exists — that is expected
ALTER TABLE payments ADD COLUMN offer_id TEXT;
ALTER TABLE payments ADD COLUMN offer_name TEXT;
ALTER TABLE payments ADD COLUMN offer_mrp INTEGER;
ALTER TABLE payments ADD COLUMN offer_discount_percent INTEGER;
ALTER TABLE payments ADD COLUMN offer_sale_price INTEGER;

-- ══════════════════════════════════════════
-- 3. SUBSCRIPTIONS — Add offer snapshot columns
-- ══════════════════════════════════════════
ALTER TABLE subscriptions ADD COLUMN offer_id TEXT;
ALTER TABLE subscriptions ADD COLUMN offer_name TEXT;
