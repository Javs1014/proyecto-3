/*
  # Update admin users

  1. Changes
    - Updates existing profiles to admin role
    - Sets admin role for specific users

  2. Security
    - Only updates existing profiles
    - No direct auth table modifications
*/

-- Update Javier's role to admin if exists
UPDATE public.profiles
SET role = 'admin'
WHERE email IN ('javier5@gmail.com', 'admin@popmaster.com');

-- Ensure admin profile exists
INSERT INTO public.profiles (id, role, name, email)
SELECT 
  auth.uid(),
  'admin',
  'Administrador',
  'admin@popmaster.com'
WHERE EXISTS (
  SELECT 1 
  FROM auth.users 
  WHERE email = 'admin@popmaster.com'
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin', name = EXCLUDED.name;