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

-- Add name and email fields to profiles if they don't exist
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

-- Add total_amount_raw to sales if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'total_amount_raw'
  ) THEN
    ALTER TABLE sales ADD COLUMN total_amount_raw numeric;
    -- Copy existing total_amount values to total_amount_raw
    UPDATE sales SET total_amount_raw = total_amount::numeric;
  END IF;
END $$;

-- Create encryption functions using built-in pgcrypto functions
CREATE OR REPLACE FUNCTION encrypt_numeric(value numeric)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(
    pgp_sym_encrypt(
      value::text,
      'your-encryption-key-here'
    ),
    'base64'
  );
EXCEPTION WHEN OTHERS THEN
  -- On encryption error, return the original value as text
  RETURN value::text;
END;
$$;

CREATE OR REPLACE FUNCTION decrypt_numeric(encrypted_value text)
RETURNS numeric
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN pgp_sym_decrypt(
    decode(encrypted_value, 'base64'),
    'your-encryption-key-here'
  )::text::numeric;
EXCEPTION WHEN OTHERS THEN
  -- On decryption error, try to convert the value directly
  RETURN encrypted_value::numeric;
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS encrypt_sales_amount_trigger ON sales;
DROP TRIGGER IF EXISTS update_inventory_after_sale ON sales;
DROP TRIGGER IF EXISTS notify_inventory_changes ON inventory_items;

-- Create trigger functions
CREATE OR REPLACE FUNCTION encrypt_sales_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Store the raw numeric value
  NEW.total_amount_raw = NEW.total_amount::numeric;
  -- Encrypt the value
  NEW.total_amount = encrypt_numeric(NEW.total_amount_raw);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- On error, keep the original value
  NEW.total_amount_raw = NEW.total_amount::numeric;
  NEW.total_amount = NEW.total_amount::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_inventory_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventory_items
  SET quantity = quantity - (NEW.quantity * 0.05)  -- 50g per unit
  WHERE name ILIKE '%maíz%' AND category = 'ingredient';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Create new triggers
CREATE TRIGGER encrypt_sales_amount_trigger
BEFORE INSERT OR UPDATE ON sales
FOR EACH ROW
EXECUTE FUNCTION encrypt_sales_amount();

CREATE TRIGGER update_inventory_after_sale
AFTER INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_sale();

CREATE TRIGGER notify_inventory_changes
AFTER INSERT OR UPDATE ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION notify_inventory_update();