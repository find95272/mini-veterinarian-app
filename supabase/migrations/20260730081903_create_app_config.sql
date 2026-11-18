/*
# Create app_config table for storing secrets

1. New Tables
- `app_config`
  - `key` (text, primary key) — config key name
  - `value` (text, not null) — config value
  - `created_at` (timestamptz)
2. Security
- Enable RLS on `app_config`.
- No anon/authenticated policies — only the service role can read/write (service role bypasses RLS).
- This table stores the OpenRouter API key; it must never be readable by the anon key.
*/

CREATE TABLE IF NOT EXISTS app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Insert the OpenRouter API key (idempotent)
INSERT INTO app_config (key, value)
VALUES ('OPENROUTER_API_KEY', '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')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
