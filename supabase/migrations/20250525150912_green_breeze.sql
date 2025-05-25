/*
  # Create admin users and update roles

  1. Changes
    - Updates existing users' roles to admin where applicable
    - Sets up RLS policies for admin access

  2. Security
    - Ensures only authenticated users can access profile data
    - Admins have full access to manage profiles
*/

-- Update Javier's role to admin if exists
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'javier5@gmail.com';

-- Create policy for admins to manage all profiles
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR ALL 
TO authenticated
USING (role = 'admin')
WITH CHECK (role = 'admin');

-- Note: The admin@popmaster.com user should be created manually through the Supabase dashboard
-- as we cannot create auth users directly through SQL migrations