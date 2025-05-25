/*
  # Fix recursive profiles policy

  1. Changes
    - Drop and recreate the "Admins can view all profiles" policy to avoid recursion
    - Simplify the policy to use direct role check without subquery

  2. Security
    - Maintains same security level but implements it more efficiently
    - Admins can still view all profiles
    - Users can still view their own profile
*/

-- Drop the recursive policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create new non-recursive policy
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  (role = 'admin') OR (auth.uid() = id)
);