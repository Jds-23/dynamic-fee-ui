CREATE TABLE IF NOT EXISTS markets (
  condition_id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  collateral_address TEXT NOT NULL,
  creator TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Seed existing market
INSERT OR IGNORE INTO markets (condition_id, question, collateral_address)
VALUES (
  '0xc38c9df21a7da60059f26c396b3f9cae2886aa1dd22d2517efe57eeba795e08b',
  'test-market-1',
  '0x0E23213E046b8B3fa4ec8B41A4726231A7C47320'
);
