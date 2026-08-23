-- SunoBolo English — Add password_hash for admin login
-- IMPORTANT: This migration has already been applied to production.
-- The hash below was generated at migration time. Do NOT re-run.
-- Admin password was set via PASSWORD_PEPPER env secret (configured separately).

ALTER TABLE users ADD COLUMN password_hash TEXT;

-- Admin password hash (pre-computed, already applied to production)
-- Password hash was generated using PASSWORD_PEPPER configured via wrangler secret
UPDATE users SET password_hash = '1621b2e6eacfe81010782fd3a3439117d72d2e15972c054a89614b109cc87547' WHERE id = 'admin_system';
