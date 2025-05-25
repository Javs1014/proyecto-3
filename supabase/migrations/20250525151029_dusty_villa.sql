/*
  # Update profile policies

  1. Changes
    - Add policy for admins to view all profiles
    - Update existing policy for users to view their own profile
  
  2. Security
    - Ensures admins can see all user profiles
    - Regular users can still only see their own profile
*/

-- Drop existing select policies if they exist
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can view their own profile'
    ) THEN
        DROP POLICY "Users can view their own profile" ON public.profiles;
    END IF;
END $$;

-- Create policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT 
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  OR id = auth.uid()
);