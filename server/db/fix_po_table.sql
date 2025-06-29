-- First, delete any records with empty PO numbers
DELETE FROM purchase_orders WHERE po_number = '';

-- Modify the po_number column to be NOT NULL
ALTER TABLE purchase_orders MODIFY po_number VARCHAR(50) NOT NULL;

-- Ensure the PO number column has a unique constraint
ALTER TABLE purchase_orders ADD CONSTRAINT unique_po_number UNIQUE (po_number); 