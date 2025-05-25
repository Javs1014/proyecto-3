/*
  # Update admin roles and policies

  1. Changes
    - Updates Javier's role to admin
    - Adds policy for admin management if it doesn't exist
*/

-- Update Javier's role to admin if exists
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'javier5@gmail.com';

-- Drop existing policy if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Admins can update any profile'
    ) THEN
        DROP POLICY "Admins can update any profile" ON public.profiles;
    END IF;
END $$;

-- Create policy for admins to manage all profiles
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR ALL 
TO authenticated
USING (role = 'admin')
WITH CHECK (role = 'admin');