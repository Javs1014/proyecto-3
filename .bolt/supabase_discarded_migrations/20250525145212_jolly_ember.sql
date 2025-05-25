/*
  # Add Admin Users

  1. Changes
    - Create admin user function
    - Update user roles to admin
    - Handle existing users properly
*/

-- Function to create or update admin users
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email text,
  user_password text,
  user_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create user in auth.users using Supabase's auth.create_user function
  new_user_id := (
    SELECT id FROM auth.create_user(
      user_email,
      user_password,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      true
    )
  );

  -- Create or update profile
  INSERT INTO public.profiles (id, role, name, email)
  VALUES (new_user_id, 'admin', user_name, user_email)
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin', name = EXCLUDED.name, email = EXCLUDED.email;

  RETURN new_user_id;
END;
$$;

-- Create admin user
SELECT create_admin_user(
  'admin@popmaster.com',
  'admin123',
  'Administrador'
);

-- Update Javier's role to admin if exists
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'javier5@gmail.com';