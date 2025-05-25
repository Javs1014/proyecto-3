/*
  # Fix Database Synchronization

  1. Changes
    - Enable pgcrypto for password hashing
    - Add unique constraints and indexes
    - Add real-time notification triggers
    - Add data validation
    - Fix duplicate handling
*/

-- Enable pgcrypto extension if not exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Remove duplicates from inventory_items before adding constraint
WITH duplicates AS (
  SELECT name, category, 
         (array_agg(id ORDER BY last_updated DESC))[1] as keep_id
  FROM inventory_items
  GROUP BY name, category
  HAVING COUNT(*) > 1
)
DELETE FROM inventory_items i
WHERE EXISTS (
  SELECT 1 FROM duplicates d
  WHERE i.name = d.name
  AND i.category = d.category
  AND i.id != d.keep_id
);

-- Add unique constraint to prevent duplicates in inventory
ALTER TABLE inventory_items 
ADD CONSTRAINT unique_item_category UNIQUE (name, category);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory_items(quantity);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);

-- Add function to hash passwords
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$;

-- Add function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(password text, hashed_password text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN hashed_password = crypt(password, hashed_password);
END;
$$;

-- Update sales triggers for better inventory sync
CREATE OR REPLACE FUNCTION update_inventory_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Update popcorn inventory with proper error handling
  UPDATE inventory_items
  SET 
    quantity = GREATEST(0, quantity - (NEW.quantity * 0.05)),  -- Prevent negative quantities
    last_updated = NOW()
  WHERE name ILIKE '%maíz%' 
    AND category = 'ingredient'
  RETURNING quantity INTO NEW.total_amount_raw;  -- Store the new quantity

  -- Notify about low stock if needed
  IF EXISTS (
    SELECT 1 FROM inventory_items 
    WHERE quantity <= reorder_level
  ) THEN
    PERFORM pg_notify('low_stock_alert', 'true');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to ensure latest version
DROP TRIGGER IF EXISTS update_inventory_after_sale ON sales;
CREATE TRIGGER update_inventory_after_sale
AFTER INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_sale();

-- Add function for real-time inventory updates
CREATE OR REPLACE FUNCTION notify_inventory_update()
RETURNS TRIGGER AS $$
DECLARE
  payload json;
BEGIN
  payload = json_build_object(
    'id', NEW.id,
    'name', NEW.name,
    'category', NEW.category,
    'quantity', NEW.quantity,
    'reorder_level', NEW.reorder_level,
    'last_updated', NEW.last_updated,
    'is_low_stock', NEW.quantity <= NEW.reorder_level
  );
  
  -- Notify on the general channel
  PERFORM pg_notify('inventory_updates', payload::text);
  
  -- Notify on category-specific channel
  PERFORM pg_notify(
    'inventory_' || NEW.category, 
    payload::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to ensure latest version
DROP TRIGGER IF EXISTS notify_inventory_changes ON inventory_items;
CREATE TRIGGER notify_inventory_changes
AFTER INSERT OR UPDATE ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION notify_inventory_update();

-- Add function for real-time sales updates
CREATE OR REPLACE FUNCTION notify_sale_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'sales_updates',
    json_build_object(
      'id', NEW.id,
      'flavor', NEW.flavor,
      'quantity', NEW.quantity,
      'total_amount_raw', NEW.total_amount_raw,
      'created_at', NEW.created_at,
      'created_by', NEW.created_by
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for sales notifications
CREATE TRIGGER notify_sale_changes
AFTER INSERT OR UPDATE ON sales
FOR EACH ROW
EXECUTE FUNCTION notify_sale_update();

-- Add validation functions
CREATE OR REPLACE FUNCTION validate_inventory_item()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate quantity
  IF NEW.quantity < 0 THEN
    RAISE EXCEPTION 'Quantity cannot be negative';
  END IF;
  
  -- Validate reorder level
  IF NEW.reorder_level < 0 THEN
    RAISE EXCEPTION 'Reorder level cannot be negative';
  END IF;
  
  -- Validate category
  IF NEW.category NOT IN ('ingredient', 'packaging', 'equipment') THEN
    RAISE EXCEPTION 'Invalid category';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation trigger
CREATE TRIGGER validate_inventory_item_trigger
BEFORE INSERT OR UPDATE ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION validate_inventory_item();

-- Update existing data to ensure consistency
UPDATE inventory_items
SET last_updated = NOW()
WHERE last_updated IS NULL;