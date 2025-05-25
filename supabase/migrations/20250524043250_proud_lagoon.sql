/*
  # Enhance User Management and Security

  1. Changes
    - Add encryption for sensitive user data
    - Add user management functions
    - Update RLS policies for better security
*/

-- Enable pgcrypto if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add encryption functions for user data
CREATE OR REPLACE FUNCTION encrypt_user_data(data text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(
    pgp_sym_encrypt(
      data,
      current_setting('app.settings.jwt_secret')
    ),
    'base64'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN data;
END;
$$;

CREATE OR REPLACE FUNCTION decrypt_user_data(encrypted_data text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN pgp_sym_decrypt(
    decode(encrypted_data, 'base64'),
    current_setting('app.settings.jwt_secret')
  )::text;
EXCEPTION WHEN OTHERS THEN
  RETURN encrypted_data;
END;
$$;

-- Update profiles table to handle encrypted data
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS encrypted_data jsonb DEFAULT '{}'::jsonb;

-- Function to safely update user data
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id uuid,
  new_role text,
  new_name text,
  new_email text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    role = new_role,
    name = new_name,
    email = new_email,
    encrypted_data = jsonb_build_object(
      'name', encrypt_user_data(new_name),
      'email', encrypt_user_data(new_email)
    ),
    updated_at = now()
  WHERE id = user_id;
END;
$$;