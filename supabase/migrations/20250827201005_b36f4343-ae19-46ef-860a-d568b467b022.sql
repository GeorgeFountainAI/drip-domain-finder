
-- Harden function search_path to prevent malicious overrides

-- Ensure all SECURITY DEFINER and trigger functions execute with a locked search_path
-- This prevents attacker-controlled schemas from shadowing objects during function execution.

ALTER FUNCTION public.prevent_completed_purchase_changes() SET search_path = 'public';
ALTER FUNCTION public.is_admin(uuid) SET search_path = 'public';
ALTER FUNCTION public.verify_admin_access() SET search_path = 'public';
ALTER FUNCTION public.handle_new_user_profile() SET search_path = 'public';
ALTER FUNCTION public.get_all_users_with_credits() SET search_path = 'public';
ALTER FUNCTION public.admin_update_user_credits(uuid, integer) SET search_path = 'public';
ALTER FUNCTION public.complete_credit_purchase(text, uuid, integer) SET search_path = 'public';
ALTER FUNCTION public.handle_new_user_credits() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.ensure_user_starter_credits(uuid) SET search_path = 'public';
