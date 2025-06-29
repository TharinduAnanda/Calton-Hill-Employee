-- Add received_quantity column to purchase_order_items table
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS received_quantity INT NULL DEFAULT NULL;

-- Add received_at column to purchase_order_items table to track when each item was received
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS received_at DATETIME NULL DEFAULT NULL;

-- Add received_by column to purchase_order_items to track who received each item
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS received_by INT NULL DEFAULT NULL;

-- Add status column to purchase_order_items to track item fulfillment status (pending, partial, complete)
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS status VARCHAR(20) NULL DEFAULT 'pending';

-- Add is_partially_fulfilled column to purchase_orders table
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS is_partially_fulfilled BOOLEAN DEFAULT FALSE;

-- Add fulfillment_status column to purchase_orders table (not_fulfilled, partially_fulfilled, fully_fulfilled)
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS fulfillment_status VARCHAR(20) NULL DEFAULT 'not_fulfilled';

-- Add partial_fulfillment_date to purchase_orders table to track when an order was partially fulfilled
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS partial_fulfillment_date DATETIME NULL DEFAULT NULL;

-- Add partial_fulfillment_notes to purchase_orders table to track notes about partial fulfillment
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS partial_fulfillment_notes TEXT NULL DEFAULT NULL; 