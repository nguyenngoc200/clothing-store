-- Down migration: remove status column and enum type

ALTER TABLE IF EXISTS "order" DROP COLUMN IF EXISTS status;
DROP TYPE IF EXISTS order_status;

-- Note: if your orders table is named "orders", adjust the ALTER TABLE name accordingly.
