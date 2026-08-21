-- SunoBolo English — Add password_hash for admin login
-- Password is SHA-256(password + pepper) where pepper = sunobolo-secret-key-2024

ALTER TABLE users ADD COLUMN password_hash TEXT;

-- Seed admin password (Avni@123)
-- Hash = SHA-256("Avni@123" + "sunobolo-secret-key-2024")
UPDATE users SET password_hash = '1621b2e6eacfe81010782fd3a3439117d72d2e15972c054a89614b109cc87547' WHERE id = 'admin_system';
