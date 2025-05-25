/*
  # Create Admin User Migration
  
  1. Changes
    - Creates an admin user if it doesn't exist
    - Sets up proper auth records in auth.users and auth.identities
    - Creates corresponding profile in public.profiles
  
  2. Security
    - Uses secure password hashing with bcrypt
    - Sets proper metadata and timestamps
    - Maintains referential integrity between tables
*/

-- Create the admin user if it doesn't exist
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Check if the admin user already exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@popmaster.com'
  ) THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@popmaster.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"admin"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO new_user_id;

    -- Insert into auth.identities
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      new_user_id,
      format('{"sub":"%s","email":"%s"}', new_user_id, 'admin@popmaster.com')::jsonb,
      'email',
      now(),
      now(),
      now()
    );

    -- Insert into profiles
    INSERT INTO public.profiles (
      id,
      role,
      email,
      name
    )
    VALUES (
      new_user_id,
      'admin',
      'admin@popmaster.com',
      'Admin'
    );
  END IF;
END $$;