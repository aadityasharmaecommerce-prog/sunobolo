-- SunoBolo English — Add missing payment columns for coupon system
-- Migration 0010 failed entirely because plan_id already existed.
-- This adds: original_amount, discount_amount, final_amount, coupon_id, coupon_code
-- plan_id ALREADY EXISTS — do NOT add it again.
--
-- SAFETY: If any column already exists, this migration will fail.
-- If that happens, manually run the individual ALTER TABLE statements
-- via the D1 console to add only the missing ones.
-- DO NOT re-run this migration after partial success.

ALTER TABLE payments ADD COLUMN original_amount INTEGER;
ALTER TABLE payments ADD COLUMN discount_amount INTEGER DEFAULT 0;
ALTER TABLE payments ADD COLUMN final_amount INTEGER;
ALTER TABLE payments ADD COLUMN coupon_id TEXT;
ALTER TABLE payments ADD COLUMN coupon_code TEXT;
