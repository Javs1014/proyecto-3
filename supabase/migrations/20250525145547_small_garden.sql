/*
  # Update Admin Roles

  1. Changes
    - Update existing users to have admin role
    - Ensure proper role assignment in profiles table
*/

-- Update Javier's role to admin if exists
UPDATE public.profiles
SET role = 'admin',
    name = COALESCE(name, 'Javier'),
    email = 'javier5@gmail.com'
WHERE email = 'javier5@gmail.com'
OR id IN (
  SELECT id FROM auth.users WHERE email = 'javier5@gmail.com'
);

-- Ensure admin user has admin role
UPDATE public.profiles
SET role = 'admin',
    name = COALESCE(name, 'Administrador'),
    email = 'admin@popmaster.com'
WHERE email = 'admin@popmaster.com'
OR id IN (
  SELECT id FROM auth.users WHERE email = 'admin@popmaster.com'
);