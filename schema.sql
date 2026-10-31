-- ARAYI Market — Cloudflare D1 schema for quote requests
-- Run once: Cloudflare dashboard → D1 → arayi-market → Console, paste and execute.
CREATE TABLE IF NOT EXISTS rfq (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  lang        TEXT,
  name        TEXT NOT NULL,
  company     TEXT,
  phone       TEXT NOT NULL,
  email       TEXT,
  location    TEXT,
  product     TEXT,
  quantity    TEXT,
  budget      TEXT,
  message     TEXT,
  page        TEXT,
  ip_country  TEXT,
  status      TEXT NOT NULL DEFAULT 'new'
);
CREATE INDEX IF NOT EXISTS rfq_created ON rfq (created_at DESC);
