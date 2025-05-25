/*
  # Add admin users

  1. Changes
    - Create admin user
    - Assign admin role to existing user
    - Set up initial profiles
*/

-- Create admin user if not exists
DO $$
DECLARE
  admin_uid uuid;
  javier_uid uuid;
BEGIN
  -- Create admin user
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_app_meta_data)
  VALUES (
    'admin@popmaster.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO admin_uid;

  -- Get Javier's user ID
  SELECT id INTO javier_uid
  FROM auth.users
  WHERE email = 'javier5@gmail.com';

  -- Create admin profile
  IF admin_uid IS NOT NULL THEN
    INSERT INTO public.profiles (id, role, name, email)
    VALUES (
      admin_uid,
      'admin',
      'Administrador',
      'admin@popmaster.com'
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin';
  END IF;

  -- Update Javier's profile to admin
  IF javier_uid IS NOT NULL THEN
    INSERT INTO public.profiles (id, role, name, email)
    VALUES (
      javier_uid,
      'admin',
      'Javier',
      'javier5@gmail.com'
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin';
  END IF;
END;
$$;