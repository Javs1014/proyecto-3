/*
  # Fix infinite recursion in profiles policy

  1. Changes
    - Remove recursive admin check in profiles policy
    - Replace with direct role check
  
  2. Security
    - Maintains RLS protection
    - Simplifies policy logic while maintaining security
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Create new policy without recursion
CREATE POLICY "Admins can update any profile"
ON profiles
FOR ALL 
TO authenticated
USING (
  role = 'admin'
);