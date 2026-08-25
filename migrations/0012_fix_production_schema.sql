-- SunoBolo English — Fix Production Schema
-- Migration 0010 never applied. This migration:
-- 1. Adds missing coupon columns to payments table
-- 2. Creates coupons table (if missing)
-- 3. Creates coupon_usages table (if missing)
-- SAFE: All CREATE TABLE use IF NOT EXISTS
-- NOTE: ALTER TABLE will fail if column already exists — that is expected

-- ── Add missing coupon columns to payments ──
-- plan_id ALREADY EXISTS — do NOT add it
ALTER TABLE payments ADD COLUMN original_amount INTEGER;
ALTER TABLE payments ADD COLUMN discount_amount INTEGER DEFAULT 0;
ALTER TABLE payments ADD COLUMN final_amount INTEGER;
ALTER TABLE payments ADD COLUMN coupon_id TEXT;
ALTER TABLE payments ADD COLUMN coupon_code TEXT;

-- ── Coupons table ──
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,
  applicable_plans TEXT NOT NULL DEFAULT 'all',
  start_date TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  max_total_uses INTEGER NOT NULL DEFAULT 0,
  max_uses_per_user INTEGER NOT NULL DEFAULT 1,
  min_order_amount INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_expiry ON coupons(expiry_date);

-- ── Coupon Usage Tracking ──
CREATE TABLE IF NOT EXISTS coupon_usages (
  id TEXT PRIMARY KEY,
  coupon_id TEXT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_id TEXT REFERENCES payments(id) ON DELETE SET NULL,
  order_id TEXT,
  original_amount INTEGER NOT NULL,
  discount_amount INTEGER NOT NULL,
  final_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'reserved',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_status ON coupon_usages(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupon_usage_order ON coupon_usages(order_id);
