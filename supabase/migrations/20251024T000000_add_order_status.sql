-- Add order status enum and column

-- Create enum type for order status (english values)
CREATE TYPE order_status AS ENUM ('in_stock', 'in_transit', 'sold');

-- Add column to orders table with default
ALTER TABLE IF EXISTS "order"
  ADD COLUMN IF NOT EXISTS status order_status NOT NULL DEFAULT 'in_stock';

-- Note: table name may vary; if your orders table is named "orders", adjust accordingly.
-- If your DB uses a different schema/name, update the ALTER TABLE statement.
