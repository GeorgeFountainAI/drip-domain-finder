-- Fix infinite recursion in profiles RLS policies by using the existing is_admin() function

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view limited profile data" ON public.profiles;

-- Recreate admin policies using the existing is_admin() security definer function
-- This prevents infinite recursion by using a security definer function instead of 
-- querying the profiles table directly within the policy

CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can view limited profile data" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public.is_admin());

-- Ensure the existing user policies are properly restrictive
-- Update the user select policy to be more explicit about authentication requirement
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;

CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Update the user update policy to be more explicit
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

-- Update the user insert policy to be more explicit  
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Add explicit DELETE policy to prevent unauthorized deletion
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can delete any profile" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (public.is_admin());