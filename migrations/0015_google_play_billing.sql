-- Migration 0015: Google Play Billing Support
-- Add google_purchase_token column with UNIQUE constraint for secure duplicate protection
--
-- IDEMPOTENT: Each statement is safe to run multiple times.
-- If column already exists, ALTER TABLE will fail silently (expected).
-- If index already exists, CREATE INDEX IF NOT EXISTS is a no-op.
-- If table already exists, CREATE TABLE IF NOT EXISTS is a no-op.
--
-- NOTE: D1 does not support IF NOT EXISTS for ALTER TABLE ADD COLUMN.
-- This migration may produce errors for pre-existing columns — those are EXPECTED.
--
-- AFTER RUNNING: Verify these exist:
--   SELECT column_name FROM pragma_table_info('payments') WHERE name='google_purchase_token';
--   SELECT column_name FROM pragma_table_info('payments') WHERE name='google_acknowledgement_state';
--   SELECT name FROM sqlite_master WHERE type='index' AND name='idx_payments_unique_purchase_token';
--   SELECT name FROM sqlite_master WHERE type='table' AND name='google_webhook_log';

-- Add google_purchase_token column (will error if already exists — that's fine)
ALTER TABLE payments ADD COLUMN google_purchase_token TEXT;

-- Add google_acknowledgement_state column for server-side acknowledgement tracking
ALTER TABLE payments ADD COLUMN google_acknowledgement_state TEXT DEFAULT 'not_acknowledged';

-- Create unique index on google_purchase_token for duplicate protection
-- This prevents the same purchase token from being used twice
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_unique_purchase_token 
  ON payments(google_purchase_token) 
  WHERE google_purchase_token IS NOT NULL;

-- Add google_webhook_log table for RTDN message deduplication
CREATE TABLE IF NOT EXISTS google_webhook_log (
  id TEXT PRIMARY KEY,
  message_id TEXT UNIQUE NOT NULL,
  message_type TEXT,
  package_name TEXT,
  product_id TEXT,
  purchase_token TEXT,
  processed_at TEXT DEFAULT (datetime('now'))
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_google_webhook_log_token 
  ON google_webhook_log(purchase_token);

-- POST-MIGRATION VERIFICATION (run manually in D1 console):
-- SELECT column_name FROM pragma_table_info('payments') WHERE name='google_purchase_token';
-- SELECT column_name FROM pragma_table_info('payments') WHERE name='google_acknowledgement_state';
-- SELECT name FROM sqlite_master WHERE type='index' AND name='idx_payments_unique_purchase_token';
-- SELECT name FROM sqlite_master WHERE type='table' AND name='google_webhook_log';
