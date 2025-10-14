-- Add image column to product table
ALTER TABLE product
ADD COLUMN image TEXT;

-- Add comment
COMMENT ON COLUMN product.image IS 'Product image URL from storage';
