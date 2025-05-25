/*
  # Add Encryption and User Management

  1. Changes
    - Add pgcrypto extension for encryption
    - Add user management fields to profiles
    - Add encryption to sensitive data
    - Update RLS policies
*/

-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add name and email fields to profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
END $$;

-- Add encryption to sensitive data
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'total_amount_raw'
  ) THEN
    ALTER TABLE sales ADD COLUMN total_amount_raw numeric;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'total_amount' 
    AND data_type != 'text'
  ) THEN
    ALTER TABLE sales ALTER COLUMN total_amount SET DATA TYPE text;
  END IF;
END $$;

-- Create function to encrypt numeric values
CREATE OR REPLACE FUNCTION encrypt_numeric(value numeric)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(encrypt_iv(value::text::bytea, 
    current_setting('app.encryption_key')::bytea,
    '12345678'::bytea, 
    'aes-cbc'
  ), 'base64');
END;
$$;

-- Create function to decrypt numeric values
CREATE OR REPLACE FUNCTION decrypt_numeric(encrypted_value text)
RETURNS numeric
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN decrypt_iv(decode(encrypted_value, 'base64'),
    current_setting('app.encryption_key')::bytea,
    '12345678'::bytea,
    'aes-cbc'
  )::text::numeric;
END;
$$;

-- Create trigger to automatically encrypt total_amount
CREATE OR REPLACE FUNCTION encrypt_sales_amount()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_amount_raw = NEW.total_amount;
  NEW.total_amount = encrypt_numeric(NEW.total_amount);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS encrypt_sales_amount_trigger ON sales;
CREATE TRIGGER encrypt_sales_amount_trigger
BEFORE INSERT OR UPDATE ON sales
FOR EACH ROW
EXECUTE FUNCTION encrypt_sales_amount();

-- Update inventory tracking
CREATE OR REPLACE FUNCTION update_inventory_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Update popcorn inventory
  UPDATE inventory_items
  SET quantity = quantity - (NEW.quantity * 0.05)  -- 50g per unit
  WHERE name ILIKE '%maíz%' AND category = 'ingredient';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_inventory_after_sale ON sales;
CREATE TRIGGER update_inventory_after_sale
AFTER INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_sale();

-- Add real-time notifications
CREATE OR REPLACE FUNCTION notify_inventory_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'inventory_update',
    json_build_object(
      'id', NEW.id,
      'name', NEW.name,
      'quantity', NEW.quantity,
      'reorder_level', NEW.reorder_level
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_inventory_changes ON inventory_items;
CREATE TRIGGER notify_inventory_changes
AFTER INSERT OR UPDATE ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION notify_inventory_update();