-- Drop the existing trigger
DROP TRIGGER IF EXISTS after_product_update;

-- Create a new trigger that doesn't try to access Stock_Level in the product table
DELIMITER $$
CREATE TRIGGER after_product_update AFTER UPDATE ON product 
FOR EACH ROW 
BEGIN
    -- We're no longer using Stock_Level from the product table
    -- This trigger is now empty but we keep it for compatibility
    -- Inventory updates are handled directly in the application code
END$$
DELIMITER ; 