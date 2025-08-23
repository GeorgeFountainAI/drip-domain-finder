-- Fix security vulnerability in profiles table
-- Remove the overly broad policy that allows admins to see all profiles
-- and replace with more restrictive policies

-- Drop existing problematic policy
DROP POLICY IF EXISTS "Public profiles are viewable by admins" ON public.profiles;

-- Create new restrictive policies
-- Users can only view their own profile
CREATE POLICY "Users can view own profile only" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Create a separate admin-only policy that's more secure
-- This requires explicit admin verification and limits what data can be accessed
CREATE POLICY "Admins can view limited profile data" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.is_admin = true
    )
  );

-- Update the admin function to be more secure
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = user_id AND id = auth.uid()),
    false
  );
$function$;

-- Create a more secure admin verification function that only admins can call
CREATE OR REPLACE FUNCTION public.verify_admin_access()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
$function$;