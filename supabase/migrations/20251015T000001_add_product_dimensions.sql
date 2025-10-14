-- Add width and height columns to product table
ALTER TABLE product
ADD COLUMN width NUMERIC(10, 2),
ADD COLUMN height NUMERIC(10, 2);

-- Add comments
COMMENT ON COLUMN product.width IS 'Product width in cm';
COMMENT ON COLUMN product.height IS 'Product height in cm';
COMMENT ON COLUMN product.size IS 'Product size (XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL)';
