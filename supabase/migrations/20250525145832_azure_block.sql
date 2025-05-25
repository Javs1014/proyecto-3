/*
  # Fix Admin User Creation and Role Assignment

  1. Changes
    - Add function to safely create admin users
    - Update existing users to admin role
    - Handle edge cases for missing users
*/

-- Function to ensure admin role exists
CREATE OR REPLACE FUNCTION ensure_admin_role(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name, email)
  SELECT 
    user_id,
    'admin',
    COALESCE((SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = user_id), 'Admin'),
    (SELECT email FROM auth.users WHERE id = user_id)
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin',
      updated_at = NOW();
END;
$$;

-- Update existing users to admin role
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Update Javier's profile
  FOR user_record IN 
    SELECT id, email 
    FROM auth.users 
    WHERE email = 'javier5@gmail.com'
  LOOP
    PERFORM ensure_admin_role(user_record.id);
  END LOOP;

  -- Update admin profile
  FOR user_record IN 
    SELECT id, email 
    FROM auth.users 
    WHERE email = 'admin@popmaster.com'
  LOOP
    PERFORM ensure_admin_role(user_record.id);
  END LOOP;
END;
$$;