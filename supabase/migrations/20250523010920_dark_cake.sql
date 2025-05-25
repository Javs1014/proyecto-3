/*
  # Initial Schema Setup for PopMaster

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `role` (text, either 'admin' or 'empleado')
      - `updated_at` (timestamp)
    
    - `inventory_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text: ingredient, packaging, equipment)
      - `quantity` (numeric)
      - `unit` (text)
      - `reorder_level` (numeric)
      - `last_updated` (timestamp)
      - `updated_by` (uuid, references auth.users)
    
    - `sales`
      - `id` (uuid, primary key)
      - `flavor` (text)
      - `quantity` (numeric)
      - `total_amount` (numeric)
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users)
    
    - `recipes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `ingredients` (jsonb)
      - `steps` (jsonb)
      - `tips` (jsonb)
      - `image_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `store_settings`
      - `id` (uuid, primary key)
      - `name` (text)
      - `address` (text)
      - `phone` (text)
      - `email` (text)
      - `updated_at` (timestamp)
      - `updated_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
    - Secure access to sensitive data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'empleado')),
  updated_at timestamptz DEFAULT now()
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('ingredient', 'packaging', 'equipment')),
  quantity numeric NOT NULL DEFAULT 0,
  unit text NOT NULL,
  reorder_level numeric NOT NULL,
  last_updated timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users NOT NULL
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flavor text NOT NULL,
  quantity numeric NOT NULL,
  total_amount numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users NOT NULL
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  ingredients jsonb NOT NULL,
  steps jsonb NOT NULL,
  tips jsonb,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create store_settings table
CREATE TABLE IF NOT EXISTS store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  phone text,
  email text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Inventory policies
CREATE POLICY "Authenticated users can view inventory"
  ON inventory_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert inventory"
  ON inventory_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update inventory"
  ON inventory_items
  FOR UPDATE
  TO authenticated
  USING (true);

-- Sales policies
CREATE POLICY "Authenticated users can view sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Recipes policies
CREATE POLICY "Authenticated users can view recipes"
  ON recipes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage recipes"
  ON recipes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Store settings policies
CREATE POLICY "Authenticated users can view settings"
  ON store_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON store_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert initial recipes
INSERT INTO recipes (name, description, ingredients, steps, tips, image_url) VALUES
(
  'Palomitas de Chocolate',
  'Deliciosas palomitas cubiertas con chocolate derretido y un toque de canela',
  '["8 tazas de palomitas", "200g de chocolate semi-amargo", "2 cucharadas de mantequilla", "1/2 cucharadita de canela"]'::jsonb,
  '["Preparar las palomitas", "Derretir el chocolate con mantequilla", "Mezclar con canela", "Cubrir las palomitas"]'::jsonb,
  '["Usar chocolate de buena calidad", "Servir inmediatamente"]'::jsonb,
  'https://images.pexels.com/photos/1028711/pexels-photo-1028711.jpeg'
),
(
  'Palomitas de Mantequilla',
  'Clásicas palomitas con mantequilla derretida y sal',
  '["1/2 taza de maíz para palomitas", "3 cucharadas de aceite", "4 cucharadas de mantequilla", "Sal al gusto"]'::jsonb,
  '["Calentar el aceite", "Agregar el maíz", "Derretir la mantequilla", "Mezclar y salar"]'::jsonb,
  '["Usar mantequilla sin sal", "Agregar la sal al final"]'::jsonb,
  'https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg'
),
(
  'Palomitas de Chicle',
  'Palomitas dulces con sabor a chicle y color azul',
  '["10 tazas de palomitas", "1 taza de azúcar", "Colorante azul", "Saborizante de chicle"]'::jsonb,
  '["Preparar el caramelo", "Agregar color y sabor", "Mezclar con las palomitas", "Dejar enfriar"]'::jsonb,
  '["No sobrecalentar el caramelo", "Trabajar rápido"]'::jsonb,
  'https://images.pexels.com/photos/6312964/pexels-photo-6312964.jpeg'
),
(
  'Palomitas Picantes',
  'Palomitas con chile en polvo y un toque de limón',
  '["8 tazas de palomitas", "2 cucharadas de chile en polvo", "1 limón", "Sal al gusto"]'::jsonb,
  '["Preparar las palomitas", "Mezclar los condimentos", "Agregar el jugo de limón", "Mezclar bien"]'::jsonb,
  '["Ajustar el picante al gusto", "Servir caliente"]'::jsonb,
  'https://images.pexels.com/photos/5506161/pexels-photo-5506161.jpeg'
);