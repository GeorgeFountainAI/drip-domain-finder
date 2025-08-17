-- Fix security vulnerability: Restrict access to settings table
-- Currently the settings table is publicly readable which could expose sensitive data

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "allow_service_role_reads" ON public.settings;

-- Create secure policies for settings table access
-- Only admins and service roles can read settings
CREATE POLICY "Admins and service roles can read settings" ON public.settings
FOR SELECT 
USING (
  auth.role() = 'service_role'::text OR
  public.is_admin(auth.uid())
);

-- Only admins and service roles can manage settings
CREATE POLICY "Admins and service roles can manage settings" ON public.settings
FOR ALL
USING (
  auth.role() = 'service_role'::text OR
  public.is_admin(auth.uid())
)
WITH CHECK (
  auth.role() = 'service_role'::text OR
  public.is_admin(auth.uid())
);