-- Rollback: Remove width and height columns from product table
ALTER TABLE product
DROP COLUMN IF EXISTS width,
DROP COLUMN IF EXISTS height;
