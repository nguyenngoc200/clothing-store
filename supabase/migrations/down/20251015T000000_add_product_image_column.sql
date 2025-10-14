-- Rollback: Remove image column from product table
ALTER TABLE product
DROP COLUMN IF EXISTS image;
