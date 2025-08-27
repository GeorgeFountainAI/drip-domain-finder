-- Fix critical security issue: Harden settings table RLS policies
-- Currently any authenticated user can potentially modify settings due to missing policies

-- Drop existing policies to recreate them with proper restrictions
DROP POLICY IF EXISTS "service_role_full_access" ON public.settings;
DROP POLICY IF EXISTS "authenticated_read_settings_whitelist" ON public.settings;

-- 1. Service role maintains full access for backend operations
CREATE POLICY "service_role_full_access" ON public.settings
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Authenticated users can only READ whitelisted public settings
CREATE POLICY "authenticated_read_public_settings" ON public.settings
FOR SELECT 
TO authenticated
USING (key = ANY (ARRAY['credits_per_search'::text, 'pricing'::text, 'ui_flags'::text]));

-- 3. Admin users can read ALL settings
CREATE POLICY "admin_read_all_settings" ON public.settings
FOR SELECT 
TO authenticated
USING (public.is_admin());

-- 4. Only admin users can INSERT settings
CREATE POLICY "admin_insert_settings" ON public.settings
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin());

-- 5. Only admin users can UPDATE settings
CREATE POLICY "admin_update_settings" ON public.settings
FOR UPDATE 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. Only admin users can DELETE settings
CREATE POLICY "admin_delete_settings" ON public.settings
FOR DELETE 
TO authenticated
USING (public.is_admin());