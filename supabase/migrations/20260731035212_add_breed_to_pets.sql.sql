/*
# Add breed column to pets table

1. Modified Tables
- `pets`
  - Add `breed` (text, nullable) — specific breed/品种, e.g. 暹罗猫, 拉布拉多.
  - Existing `species` column remains as the broad category (猫/狗/兔子...) used for icon display.
2. Security
- No policy changes; existing owner-scoped CRUD policies cover the new column.
3. Notes
- `breed` is nullable so existing rows are not affected.
- Frontend will send both species (category) and breed (specific).
*/

ALTER TABLE pets ADD COLUMN IF NOT EXISTS breed text;
