/*
  # Seed Initial Data

  1. Data Seeding
    - Inventory items with realistic quantities
    - Sample sales data for the last 7 days
    - Store settings with default values

  2. Notes
    - Uses a default admin user ID for initial seeding
    - Includes varied quantities and reorder levels
    - Generates realistic sales data with proper pricing
*/

-- Create a function to get or create an admin user
CREATE OR REPLACE FUNCTION get_seed_user_id()
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  admin_id uuid;
BEGIN
  -- Try to get an existing admin user
  SELECT id INTO admin_id
  FROM auth.users
  LIMIT 1;
  
  -- If no user exists, create one
  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid();
  END IF;
  
  RETURN admin_id;
END;
$$;

-- Seed inventory items
INSERT INTO inventory_items (name, category, quantity, unit, reorder_level, updated_by) VALUES
  ('Maíz para Palomitas', 'ingredient', 25.0, 'kg', 10.0, get_seed_user_id()),
  ('Chocolate en Polvo', 'ingredient', 15.0, 'kg', 5.0, get_seed_user_id()),
  ('Mantequilla', 'ingredient', 20.0, 'kg', 8.0, get_seed_user_id()),
  ('Saborizante de Chicle', 'ingredient', 8.0, 'litros', 3.0, get_seed_user_id()),
  ('Chile en Polvo', 'ingredient', 12.0, 'kg', 4.0, get_seed_user_id()),
  ('Azúcar', 'ingredient', 30.0, 'kg', 10.0, get_seed_user_id()),
  ('Sal', 'ingredient', 18.0, 'kg', 5.0, get_seed_user_id()),
  ('Bolsas Pequeñas', 'packaging', 500, 'unidades', 200, get_seed_user_id()),
  ('Bolsas Medianas', 'packaging', 400, 'unidades', 150, get_seed_user_id()),
  ('Bolsas Grandes', 'packaging', 300, 'unidades', 100, get_seed_user_id()),
  ('Máquina de Palomitas', 'equipment', 2, 'unidades', 1, get_seed_user_id()),
  ('Recipientes de Mezcla', 'equipment', 5, 'unidades', 2, get_seed_user_id()),
  ('Cucharas Medidoras', 'equipment', 8, 'unidades', 4, get_seed_user_id());

-- Seed sample sales (last 7 days)
WITH sample_sales AS (
  SELECT 
    unnest(ARRAY['Chocolate', 'Mantequilla', 'Chicle', 'Picante']) as flavor,
    floor(random() * 5 + 1)::int as quantity,
    NOW() - (floor(random() * 7) || ' days')::interval - (floor(random() * 24) || ' hours')::interval as created_at
  FROM generate_series(1, 20)
)
INSERT INTO sales (flavor, quantity, total_amount, created_at, created_by)
SELECT
  flavor,
  quantity,
  CASE 
    WHEN flavor = 'Chocolate' THEN quantity * 50
    WHEN flavor = 'Mantequilla' THEN quantity * 45
    WHEN flavor = 'Chicle' THEN quantity * 50
    WHEN flavor = 'Picante' THEN quantity * 50
  END as total_amount,
  created_at,
  get_seed_user_id()
FROM sample_sales;

-- Seed store settings
INSERT INTO store_settings (name, address, phone, email, updated_by)
VALUES (
  'PopMaster Central',
  'Av. Principal #123, Centro',
  '555-0123',
  'contacto@popmaster.com',
  get_seed_user_id()
);