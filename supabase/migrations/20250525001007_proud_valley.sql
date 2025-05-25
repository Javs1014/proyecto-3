/*
  # Add bag size to sales table

  1. Changes
    - Add bag_size column to sales table
    - Update existing sales with default value
*/

-- Add bag_size column to sales table
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS bag_size text DEFAULT 'mediana';

-- Update existing sales to have a default bag size
UPDATE sales
SET bag_size = 'mediana'
WHERE bag_size IS NULL;