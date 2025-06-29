-- Add cancellation_reason column
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT NULL AFTER canceled_by;

-- Add confirm_notes column
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS confirm_notes TEXT NULL AFTER confirmed_by;

-- Add updated_by column to track who last modified the record
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS updated_by INT NULL AFTER updated_at;

-- Add canceled_at column to record when a PO was cancelled
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS canceled_at DATETIME NULL AFTER canceled_by;

-- Ensure payment_terms column exists
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100) NULL; 