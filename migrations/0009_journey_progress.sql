-- SunoBolo English — 30-Day Grammar Journey Progress
-- Tracks per-user progress through the structured 30-day grammar learning path

-- ── Journey Progress (one row per user per day) ──
CREATE TABLE IF NOT EXISTS journey_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked',
  score INTEGER DEFAULT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, day_number)
);
CREATE INDEX IF NOT EXISTS idx_journey_user ON journey_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_status ON journey_progress(status);
CREATE INDEX IF NOT EXISTS idx_journey_user_day ON journey_progress(user_id, day_number);
