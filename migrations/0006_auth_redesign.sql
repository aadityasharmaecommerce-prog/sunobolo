-- SunoBolo English — Auth Redesign: Mobile + PIN
-- Adds recovery_email, ensures reset_tokens table exists

-- ── Users: add recovery_email for account recovery ──
ALTER TABLE users ADD COLUMN recovery_email TEXT;

-- ── Reset tokens (password reset flow) ──
CREATE TABLE IF NOT EXISTS reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT DEFAULT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_user_id ON reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token_hash ON reset_tokens(token_hash);

-- ── Login rate limiting ──
CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  attempted_at TEXT NOT NULL DEFAULT (datetime('now')),
  success INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_phone ON login_attempts(phone, attempted_at);
